CREATE TABLE public.password_reset_challenges (
  id uuid PRIMARY KEY,
  firebase_uid text,
  email_key text NOT NULL,
  otp_hash text NOT NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  consumed_at timestamptz
);

CREATE INDEX password_reset_challenges_email_key_idx
  ON public.password_reset_challenges (email_key, created_at DESC);

CREATE TABLE public.password_reset_tokens (
  token_hash text PRIMARY KEY,
  firebase_uid text NOT NULL,
  email_key text NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.password_reset_challenges(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz
);

CREATE INDEX password_reset_tokens_expiry_idx
  ON public.password_reset_tokens (expires_at);

CREATE TABLE public.password_reset_rate_limits (
  key_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0)
);

ALTER TABLE public.password_reset_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
  public.password_reset_challenges,
  public.password_reset_tokens,
  public.password_reset_rate_limits
FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_password_reset_rate_limit(
  p_email_key text,
  p_ip_key text,
  p_now timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email_attempts integer;
  v_ip_attempts integer;
BEGIN
  DELETE FROM public.password_reset_rate_limits
  WHERE window_started_at < p_now - interval '1 day';

  INSERT INTO public.password_reset_rate_limits AS existing (
    key_hash, window_started_at, attempts
  )
  VALUES (p_email_key, p_now, 1)
  ON CONFLICT (key_hash) DO UPDATE
    SET attempts = CASE
          WHEN existing.window_started_at <= p_now - interval '15 minutes' THEN 1
          ELSE existing.attempts + 1
        END,
        window_started_at = CASE
          WHEN existing.window_started_at <= p_now - interval '15 minutes' THEN p_now
          ELSE existing.window_started_at
        END
  RETURNING attempts INTO v_email_attempts;

  INSERT INTO public.password_reset_rate_limits AS existing (
    key_hash, window_started_at, attempts
  )
  VALUES (p_ip_key, p_now, 1)
  ON CONFLICT (key_hash) DO UPDATE
    SET attempts = CASE
          WHEN existing.window_started_at <= p_now - interval '15 minutes' THEN 1
          ELSE existing.attempts + 1
        END,
        window_started_at = CASE
          WHEN existing.window_started_at <= p_now - interval '15 minutes' THEN p_now
          ELSE existing.window_started_at
        END
  RETURNING attempts INTO v_ip_attempts;

  RETURN v_email_attempts <= 3 AND v_ip_attempts <= 20;
END;
$$;

CREATE OR REPLACE FUNCTION public.store_password_reset_challenge(
  p_id uuid,
  p_firebase_uid text,
  p_email_key text,
  p_otp_hash text,
  p_expires_at timestamptz,
  p_now timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_email_key, 0::bigint)
  );

  UPDATE public.password_reset_challenges
  SET consumed_at = p_now
  WHERE email_key = p_email_key AND consumed_at IS NULL;

  UPDATE public.password_reset_tokens
  SET consumed_at = p_now
  WHERE email_key = p_email_key AND consumed_at IS NULL;

  DELETE FROM public.password_reset_challenges
  WHERE expires_at < p_now - interval '1 day';

  DELETE FROM public.password_reset_tokens
  WHERE expires_at < p_now - interval '1 day'
     OR (consumed_at IS NOT NULL AND consumed_at < p_now - interval '1 day');

  INSERT INTO public.password_reset_challenges (
    id, firebase_uid, email_key, otp_hash, created_at, expires_at
  )
  VALUES (p_id, p_firebase_uid, p_email_key, p_otp_hash, p_now, p_expires_at);

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.invalidate_password_reset_challenge(
  p_id uuid,
  p_now timestamptz
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.password_reset_challenges
  SET consumed_at = p_now
  WHERE id = p_id AND consumed_at IS NULL
  RETURNING true;
$$;

CREATE OR REPLACE FUNCTION public.verify_password_reset_otp(
  p_challenge_id uuid,
  p_otp_hash text,
  p_token_hash text,
  p_token_expires_at timestamptz,
  p_now timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_challenge public.password_reset_challenges%ROWTYPE;
BEGIN
  SELECT *
  INTO v_challenge
  FROM public.password_reset_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_challenge.consumed_at IS NOT NULL
     OR v_challenge.expires_at <= p_now
     OR v_challenge.attempts >= 5
  THEN
    RETURN false;
  END IF;

  UPDATE public.password_reset_challenges
  SET attempts = attempts + 1
  WHERE id = p_challenge_id;

  IF v_challenge.firebase_uid IS NULL OR v_challenge.otp_hash <> p_otp_hash THEN
    RETURN false;
  END IF;

  UPDATE public.password_reset_challenges
  SET consumed_at = p_now
  WHERE id = p_challenge_id;

  INSERT INTO public.password_reset_tokens (
    token_hash, firebase_uid, email_key, challenge_id, created_at, expires_at
  )
  VALUES (
    p_token_hash,
    v_challenge.firebase_uid,
    v_challenge.email_key,
    p_challenge_id,
    p_now,
    p_token_expires_at
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_password_reset_token(
  p_token_hash text,
  p_now timestamptz
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_firebase_uid text;
BEGIN
  UPDATE public.password_reset_tokens
  SET consumed_at = p_now
  WHERE token_hash = p_token_hash
    AND consumed_at IS NULL
    AND expires_at > p_now
  RETURNING firebase_uid INTO v_firebase_uid;

  RETURN v_firebase_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_password_reset_rate_limit(text, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.store_password_reset_challenge(uuid, text, text, text, timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.invalidate_password_reset_challenge(uuid, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_password_reset_otp(uuid, text, text, timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_password_reset_token(text, timestamptz)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_password_reset_rate_limit(text, text, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.store_password_reset_challenge(uuid, text, text, text, timestamptz, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.invalidate_password_reset_challenge(uuid, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_password_reset_otp(uuid, text, text, timestamptz, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_password_reset_token(text, timestamptz)
  TO service_role;
