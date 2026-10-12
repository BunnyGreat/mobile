CREATE TABLE IF NOT EXISTS oauth_attempts (
  state_hash TEXT PRIMARY KEY CHECK (length(state_hash) = 64),
  payload_ciphertext TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  CHECK (expires_at > 0)
);

CREATE INDEX IF NOT EXISTS oauth_attempts_expiry_idx
  ON oauth_attempts (expires_at);

CREATE TABLE IF NOT EXISTS oauth_tickets (
  ticket_hash TEXT PRIMARY KEY CHECK (length(ticket_hash) = 64),
  app_challenge TEXT NOT NULL CHECK (
    length(app_challenge) = 43 AND app_challenge NOT GLOB '*[^A-Za-z0-9_-]*'
  ),
  id_token_ciphertext TEXT NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > 0)
);

CREATE INDEX IF NOT EXISTS oauth_tickets_expiry_idx
  ON oauth_tickets (expires_at);

CREATE TABLE IF NOT EXISTS oauth_rate_limits (
  operation TEXT PRIMARY KEY CHECK (
    operation IN ('start', 'callback', 'redeem')
  ),
  window_started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts > 0)
);
