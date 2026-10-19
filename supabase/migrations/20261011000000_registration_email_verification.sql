CREATE TABLE public.registration_email_challenges (
  id uuid PRIMARY KEY,
  email_key text NOT NULL,
  otp_hash text NOT NULL,
  auth_method text NOT NULL CHECK (auth_method IN ('password', 'google')),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  consumed_at timestamptz
);

CREATE INDEX registration_email_challenges_email_key_idx
  ON public.registration_email_challenges (email_key, created_at DESC);

ALTER TABLE public.registration_email_challenges ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.registration_email_challenges
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.store_registration_email_challenge(
  p_id uuid,
  p_email_key text,
  p_otp_hash text,
  p_auth_method text,
  p_expires_at timestamptz,
  p_now timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_auth_method NOT IN ('password', 'google') THEN
    RETURN false;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_email_key, 0::bigint)
  );

  UPDATE public.registration_email_challenges
  SET consumed_at = p_now
  WHERE email_key = p_email_key AND consumed_at IS NULL;

  DELETE FROM public.registration_email_challenges
  WHERE expires_at < p_now - interval '1 day'
     OR (consumed_at IS NOT NULL AND consumed_at < p_now - interval '1 day');

  INSERT INTO public.registration_email_challenges (
    id, email_key, otp_hash, auth_method, created_at, expires_at
  )
  VALUES (
    p_id, p_email_key, p_otp_hash, p_auth_method, p_now, p_expires_at
  );

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.invalidate_registration_email_challenge(
  p_id uuid,
  p_now timestamptz
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.registration_email_challenges
  SET consumed_at = p_now
  WHERE id = p_id AND consumed_at IS NULL
  RETURNING true;
$$;

CREATE OR REPLACE FUNCTION public.verify_registration_email_challenge(
  p_id uuid,
  p_email_key text,
  p_otp_hash text,
  p_now timestamptz
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_challenge public.registration_email_challenges%ROWTYPE;
BEGIN
  SELECT *
  INTO v_challenge
  FROM public.registration_email_challenges
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_challenge.consumed_at IS NOT NULL
     OR v_challenge.expires_at <= p_now
     OR v_challenge.attempts >= 5
  THEN
    RETURN NULL;
  END IF;

  UPDATE public.registration_email_challenges
  SET attempts = attempts + 1
  WHERE id = p_id;

  IF v_challenge.email_key <> p_email_key
     OR v_challenge.otp_hash <> p_otp_hash
  THEN
    RETURN NULL;
  END IF;

  UPDATE public.registration_email_challenges
  SET consumed_at = p_now
  WHERE id = p_id;

  RETURN v_challenge.auth_method;
END;
$$;

CREATE OR REPLACE FUNCTION public.registration_email_exists(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE pg_catalog.lower(email) = pg_catalog.lower(p_email)
  );
$$;

REVOKE ALL ON FUNCTION public.store_registration_email_challenge(
  uuid, text, text, text, timestamptz, timestamptz
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.invalidate_registration_email_challenge(uuid, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_registration_email_challenge(
  uuid, text, text, timestamptz
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.registration_email_exists(text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.store_registration_email_challenge(
  uuid, text, text, text, timestamptz, timestamptz
) TO service_role;
GRANT EXECUTE ON FUNCTION public.invalidate_registration_email_challenge(uuid, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_registration_email_challenge(
  uuid, text, text, timestamptz
) TO service_role;
GRANT EXECUTE ON FUNCTION public.registration_email_exists(text)
  TO service_role;
