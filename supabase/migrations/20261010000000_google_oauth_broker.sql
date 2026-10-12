CREATE TABLE public.google_oauth_attempts (
  state_hash text PRIMARY KEY CHECK (state_hash ~ '^[0-9a-f]{64}$'),
  nonce text NOT NULL,
  code_verifier text NOT NULL,
  app_challenge text NOT NULL CHECK (app_challenge ~ '^[A-Za-z0-9_-]{43}$'),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  CHECK (expires_at > created_at)
);

CREATE INDEX google_oauth_attempts_expiry_idx
  ON public.google_oauth_attempts (expires_at);

CREATE TABLE public.google_oauth_tickets (
  ticket_hash text PRIMARY KEY CHECK (ticket_hash ~ '^[0-9a-f]{64}$'),
  app_challenge text NOT NULL CHECK (app_challenge ~ '^[A-Za-z0-9_-]{43}$'),
  google_id_token text NOT NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > created_at)
);

CREATE INDEX google_oauth_tickets_expiry_idx
  ON public.google_oauth_tickets (expires_at);

CREATE TABLE public.google_oauth_rate_limits (
  key_hash text PRIMARY KEY CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0)
);

ALTER TABLE public.google_oauth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_oauth_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_oauth_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.google_oauth_attempts,
  public.google_oauth_tickets,
  public.google_oauth_rate_limits
FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_google_oauth_rate_limit(
  p_key_hash text,
  p_now timestamptz,
  p_max_attempts integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_attempts integer;
BEGIN
  IF p_key_hash !~ '^[0-9a-f]{64}$'
     OR p_max_attempts < 1 OR p_max_attempts > 100
     OR p_window_seconds < 30 OR p_window_seconds > 3600
  THEN
    RETURN false;
  END IF;

  DELETE FROM public.google_oauth_attempts
  WHERE expires_at <= p_now OR consumed_at < p_now - interval '1 day';

  DELETE FROM public.google_oauth_tickets
  WHERE expires_at <= p_now;

  DELETE FROM public.google_oauth_rate_limits
  WHERE window_started_at < p_now - interval '1 day';

  INSERT INTO public.google_oauth_rate_limits AS existing (
    key_hash, window_started_at, attempts
  )
  VALUES (p_key_hash, p_now, 1)
  ON CONFLICT (key_hash) DO UPDATE
    SET attempts = CASE
          WHEN existing.window_started_at <=
               p_now - make_interval(secs => p_window_seconds) THEN 1
          ELSE existing.attempts + 1
        END,
        window_started_at = CASE
          WHEN existing.window_started_at <=
               p_now - make_interval(secs => p_window_seconds) THEN p_now
          ELSE existing.window_started_at
        END
  RETURNING attempts INTO v_attempts;

  RETURN v_attempts <= p_max_attempts;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_google_oauth_attempt(
  p_state_hash text,
  p_nonce text,
  p_code_verifier text,
  p_app_challenge text,
  p_now timestamptz,
  p_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_state_hash !~ '^[0-9a-f]{64}$'
     OR p_app_challenge !~ '^[A-Za-z0-9_-]{43}$'
     OR p_expires_at <= p_now
     OR p_expires_at > p_now + interval '5 minutes'
  THEN
    RETURN false;
  END IF;

  INSERT INTO public.google_oauth_attempts (
    state_hash, nonce, code_verifier, app_challenge, created_at, expires_at
  )
  VALUES (
    p_state_hash, p_nonce, p_code_verifier, p_app_challenge, p_now, p_expires_at
  )
  ON CONFLICT (state_hash) DO NOTHING;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_google_oauth_attempt(
  p_state_hash text,
  p_now timestamptz
)
RETURNS TABLE (
  nonce text,
  code_verifier text,
  app_challenge text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.google_oauth_attempts AS attempt
  SET consumed_at = p_now
  WHERE attempt.state_hash = p_state_hash
    AND attempt.consumed_at IS NULL
    AND attempt.expires_at > p_now
  RETURNING attempt.nonce, attempt.code_verifier, attempt.app_challenge;
$$;

CREATE OR REPLACE FUNCTION public.create_google_oauth_ticket(
  p_ticket_hash text,
  p_app_challenge text,
  p_google_id_token text,
  p_now timestamptz,
  p_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_ticket_hash !~ '^[0-9a-f]{64}$'
     OR p_app_challenge !~ '^[A-Za-z0-9_-]{43}$'
     OR length(p_google_id_token) > 16384
     OR p_expires_at <= p_now
     OR p_expires_at > p_now + interval '2 minutes'
  THEN
    RETURN false;
  END IF;

  INSERT INTO public.google_oauth_tickets (
    ticket_hash, app_challenge, google_id_token, created_at, expires_at
  )
  VALUES (
    p_ticket_hash, p_app_challenge, p_google_id_token, p_now, p_expires_at
  )
  ON CONFLICT (ticket_hash) DO NOTHING;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_google_oauth_ticket(
  p_ticket_hash text,
  p_app_challenge text,
  p_now timestamptz
)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.google_oauth_tickets AS ticket
  WHERE ticket.ticket_hash = p_ticket_hash
    AND ticket.app_challenge = p_app_challenge
    AND ticket.expires_at > p_now
  RETURNING ticket.google_id_token;
$$;

REVOKE ALL ON FUNCTION public.consume_google_oauth_rate_limit(text, timestamptz, integer, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_google_oauth_attempt(text, text, text, text, timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_google_oauth_attempt(text, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_google_oauth_ticket(text, text, text, timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_google_oauth_ticket(text, text, timestamptz)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_google_oauth_rate_limit(text, timestamptz, integer, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.create_google_oauth_attempt(text, text, text, text, timestamptz, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_google_oauth_attempt(text, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.create_google_oauth_ticket(text, text, text, timestamptz, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_google_oauth_ticket(text, text, timestamptz)
  TO service_role;
