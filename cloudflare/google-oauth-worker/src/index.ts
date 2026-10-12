interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  meta?: { changes?: number };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(columnName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(
    statements: D1PreparedStatement[],
  ): Promise<D1Result<T>[]>;
}

interface Env {
  DB: D1Database;
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_CLIENT_SECRET: string;
  OAUTH_DATA_ENCRYPTION_KEY: string;
  OAUTH_PUBLIC_BASE_URL: string;
}

interface AttemptPayload {
  nonce: string;
  codeVerifier: string;
  appChallenge: string;
}

interface GoogleTokenResponse {
  id_token?: unknown;
}

interface TicketPayload {
  idToken: string;
  nonce: string;
}

interface GoogleIdTokenClaims {
  iss?: unknown;
  aud?: unknown;
  azp?: unknown;
  exp?: unknown;
  iat?: unknown;
  nbf?: unknown;
  nonce?: unknown;
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
}

interface GoogleJwk extends JsonWebKey {
  kid?: string;
}

const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_CERTS_ENDPOINT = "https://www.googleapis.com/oauth2/v3/certs";
const APP_REDIRECT_URI = "barangay://oauth/google";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Cache-Control": "no-store",
};

class BrokerError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

const logOAuthDiagnostic = (
  stage: string,
  status: number,
  category: string,
  fieldsPresent: Record<string, boolean>,
): void => {
  console.info(
    "[GOOGLE OAUTH]",
    JSON.stringify({ stage, status, category, fieldsPresent }),
  );
};

const logNonceDiagnostic = (
  stage: string,
  details: Record<string, boolean | number | string>,
): void => {
  console.info(
    "[GOOGLE OAUTH]",
    JSON.stringify({ stage, nonceDiagnostic: details }),
  );
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });

const appRedirect = (error?: string, ticket?: string): Response => {
  const redirect = new URL(APP_REDIRECT_URI);
  redirect.searchParams.set(ticket ? "ticket" : "error", ticket ?? error ?? "oauth_failed");
  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "Location": redirect.toString(),
      "Referrer-Policy": "no-referrer",
    },
  });
};

const baseUrl = (env: Env): URL => {
  let url: URL;
  try {
    url = new URL(env.OAUTH_PUBLIC_BASE_URL);
  } catch {
    throw new BrokerError(503, "service_unavailable");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".workers.dev") ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new BrokerError(503, "service_unavailable");
  }
  return url;
};

const randomToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const base64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const fromBase64Url = (value: string): Uint8Array<ArrayBuffer> => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_base64url");
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const sha256 = async (value: string): Promise<Uint8Array<ArrayBuffer>> =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

const sha256Hex = async (value: string): Promise<string> =>
  Array.from(await sha256(value), (byte) => byte.toString(16).padStart(2, "0")).join("");

const challengeFor = async (verifier: string): Promise<string> =>
  base64Url(await sha256(verifier));

const encryptionKey = async (env: Env): Promise<CryptoKey> => {
  if (typeof env.OAUTH_DATA_ENCRYPTION_KEY !== "string" ||
      env.OAUTH_DATA_ENCRYPTION_KEY.length < 32) {
    throw new BrokerError(503, "service_unavailable");
  }
  const keyMaterial = await sha256(env.OAUTH_DATA_ENCRYPTION_KEY);
  return crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, ["encrypt", "decrypt"]);
};

const encrypt = async (env: Env, plaintext: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(env),
    encoder.encode(plaintext),
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return base64Url(combined);
};

const decrypt = async (env: Env, ciphertext: string): Promise<string> => {
  const bytes = fromBase64Url(ciphertext);
  if (bytes.length < 29) throw new BrokerError(500, "service_unavailable");
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes.subarray(0, 12) },
    await encryptionKey(env),
    bytes.subarray(12),
  );
  return decoder.decode(plaintext);
};

const consumeRateLimit = async (
  env: Env,
  operation: "start" | "callback" | "redeem",
  maximum: number,
): Promise<boolean> => {
  const now = Math.floor(Date.now() / 1000);
  const windowSeconds = 900;
  const results = await env.DB.batch<{ attempts: number }>([
    env.DB.prepare("DELETE FROM oauth_attempts WHERE expires_at <= ?1 OR consumed_at < ?1 - 86400")
      .bind(now),
    env.DB.prepare("DELETE FROM oauth_tickets WHERE expires_at <= ?1").bind(now),
    env.DB.prepare("DELETE FROM oauth_rate_limits WHERE window_started_at < ?1 - 86400")
      .bind(now),
    env.DB.prepare(
      `INSERT INTO oauth_rate_limits (operation, window_started_at, attempts)
       VALUES (?1, ?2, 1)
       ON CONFLICT(operation) DO UPDATE SET
         attempts = CASE
           WHEN oauth_rate_limits.window_started_at <= ?2 - ?3 THEN 1
           ELSE oauth_rate_limits.attempts + 1
         END,
         window_started_at = CASE
           WHEN oauth_rate_limits.window_started_at <= ?2 - ?3 THEN ?2
           ELSE oauth_rate_limits.window_started_at
         END
       RETURNING attempts`,
    ).bind(operation, now, windowSeconds),
  ]);
  const attemptCount = Number(results[3]?.results?.[0]?.attempts);
  if (!Number.isInteger(attemptCount) || attemptCount < 1) {
    throw new BrokerError(503, "service_unavailable");
  }
  return attemptCount <= maximum;
};

const readJsonBody = async (
  request: Request,
  keys: string[],
): Promise<Record<string, unknown>> => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 1024) {
    throw new BrokerError(413, "invalid_request");
  }
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > 1024) throw new BrokerError(413, "invalid_request");
  let body: unknown;
  try {
    body = JSON.parse(decoder.decode(bytes));
  } catch {
    throw new BrokerError(400, "invalid_request");
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    Object.keys(body).length !== keys.length ||
    keys.some((key) => !Object.prototype.hasOwnProperty.call(body, key))
  ) {
    throw new BrokerError(400, "invalid_request");
  }
  return body as Record<string, unknown>;
};

const readFormBody = async (request: Request): Promise<URLSearchParams> => {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (
    contentType !== "application/x-www-form-urlencoded" ||
    (Number.isFinite(contentLength) && contentLength > 16384)
  ) {
    throw new BrokerError(400, "invalid_callback");
  }
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > 16384) throw new BrokerError(413, "invalid_callback");
  let form: string;
  try {
    form = decoder.decode(bytes);
  } catch {
    throw new BrokerError(400, "invalid_callback");
  }
  return new URLSearchParams(form);
};

const claimAttempt = async (
  env: Env,
  state: string,
): Promise<AttemptPayload | null> => {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `UPDATE oauth_attempts
     SET consumed_at = ?2
     WHERE state_hash = ?1 AND consumed_at IS NULL AND expires_at > ?2
     RETURNING payload_ciphertext`,
  ).bind(await sha256Hex(state), now).first<{ payload_ciphertext: string }>();
  if (!row) return null;
  try {
    const payload = JSON.parse(await decrypt(env, row.payload_ciphertext)) as AttemptPayload;
    if (
      typeof payload.nonce !== "string" ||
      typeof payload.codeVerifier !== "string" ||
      typeof payload.appChallenge !== "string"
    ) {
      throw new Error("invalid_attempt");
    }
    return payload;
  } catch {
    throw new BrokerError(500, "service_unavailable");
  }
};

const verifyGoogleIdToken = async (
  token: string,
  expectedNonce: string,
  clientId: string,
): Promise<void> => {
  if (token.length > 16384) throw new BrokerError(401, "invalid_identity");
  const parts = token.split(".");
  if (parts.length !== 3) throw new BrokerError(401, "invalid_identity");

  let header: { alg?: unknown; kid?: unknown };
  let claims: GoogleIdTokenClaims;
  try {
    header = JSON.parse(decoder.decode(fromBase64Url(parts[0])));
    claims = JSON.parse(decoder.decode(fromBase64Url(parts[1]))) as GoogleIdTokenClaims;
  } catch {
    throw new BrokerError(401, "invalid_identity");
  }
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== "RS256") {
    throw new BrokerError(401, "invalid_algorithm");
  }
  if (typeof header.kid !== "string" || !header.kid) {
    throw new BrokerError(401, "invalid_key_id");
  }
  if (!["https://accounts.google.com", "accounts.google.com"].includes(String(claims.iss))) {
    throw new BrokerError(401, "invalid_issuer");
  }
  if (claims.aud !== clientId) {
    throw new BrokerError(401, "invalid_audience");
  }
  if (claims.azp !== undefined && claims.azp !== clientId) {
    throw new BrokerError(401, "invalid_authorized_party");
  }
  if (
    typeof claims.exp !== "number" ||
    claims.exp <= now ||
    typeof claims.iat !== "number" ||
    claims.iat > now + 60 ||
    claims.iat < now - 3600 ||
    claims.exp <= claims.iat ||
    (claims.nbf !== undefined &&
      (typeof claims.nbf !== "number" || claims.nbf > now))
  ) {
    throw new BrokerError(401, "invalid_time_claims");
  }
  const nonceMatches = typeof claims.nonce === "string" &&
    claims.nonce === expectedNonce;
  logNonceDiagnostic("google_identity_nonce", {
    encoding: "sha256_hex",
    expectedLength: expectedNonce.length,
    claimLength: typeof claims.nonce === "string" ? claims.nonce.length : 0,
    matches: nonceMatches,
  });
  if (!nonceMatches) {
    throw new BrokerError(401, "invalid_nonce");
  }
  if (
    typeof claims.sub !== "string" ||
    !claims.sub ||
    typeof claims.email !== "string" ||
    !claims.email ||
    claims.email_verified !== true
  ) {
    throw new BrokerError(401, "invalid_identity_claims");
  }

  let jwks: { keys?: GoogleJwk[] };
  try {
    const response = await fetch(GOOGLE_CERTS_ENDPOINT, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("identity_service_unavailable");
    jwks = await response.json() as { keys?: GoogleJwk[] };
  } catch {
    throw new BrokerError(503, "identity_service_unavailable");
  }
  const jwk = jwks.keys?.find((key) => key.kid === header.kid);
  if (!jwk) throw new BrokerError(401, "identity_key_not_found");
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      fromBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!valid) throw new BrokerError(401, "invalid_signature");
  } catch (error: unknown) {
    if (error instanceof BrokerError) throw error;
    throw new BrokerError(401, "invalid_signature");
  }
};

const handleStart = async (request: Request, env: Env): Promise<Response> => {
  if (!(await consumeRateLimit(env, "start", 100))) {
    throw new BrokerError(429, "rate_limited");
  }
  const body = await readJsonBody(request, ["appChallenge"]);
  if (
    typeof body.appChallenge !== "string" ||
    !TOKEN_PATTERN.test(body.appChallenge)
  ) {
    throw new BrokerError(400, "invalid_request");
  }
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new BrokerError(503, "service_unavailable");
  }
  const publicBaseUrl = baseUrl(env);
  const state = randomToken();
  const nonce = randomToken();
  const googleNonce = await sha256Hex(nonce);
  const codeVerifier = randomToken();
  const now = Math.floor(Date.now() / 1000);
  const payload = await encrypt(env, JSON.stringify({
    nonce,
    codeVerifier,
    appChallenge: body.appChallenge,
  } satisfies AttemptPayload));
  const inserted = await env.DB.prepare(
    `INSERT INTO oauth_attempts (state_hash, payload_ciphertext, expires_at)
     VALUES (?1, ?2, ?3) ON CONFLICT(state_hash) DO NOTHING`,
  ).bind(await sha256Hex(state), payload, now + 300).run();
  if (inserted.meta?.changes !== 1) {
    throw new BrokerError(503, "service_unavailable");
  }

  const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  authorizationUrl.search = new URLSearchParams({
    client_id: env.GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: new URL("/oauth/callback", publicBaseUrl).toString(),
    response_type: "code",
    response_mode: "form_post",
    scope: "openid email profile",
    state,
    nonce: googleNonce,
    code_challenge: await challengeFor(codeVerifier),
    code_challenge_method: "S256",
  }).toString();
  logNonceDiagnostic("nonce_generation", {
    sourceLength: nonce.length,
    googleClaimLength: googleNonce.length,
    encoding: "sha256_hex",
  });
  logOAuthDiagnostic("oauth_start", 200, "success", {
    appChallenge: true,
    authorizationUrl: true,
  });
  return jsonResponse({ authorizationUrl: authorizationUrl.toString() });
};

const googleTokenErrorCategory = async (response: Response): Promise<string> => {
  try {
    const body = await response.clone().json() as { error?: unknown };
    if (body.error === "invalid_grant") return "authorization_code_rejected";
    if (body.error === "invalid_client") return "client_configuration_rejected";
    if (body.error === "invalid_request") return "token_request_rejected";
  } catch {
    return "provider_rejected";
  }
  return "provider_rejected";
};

const handleCallback = async (request: Request, env: Env): Promise<Response> => {
  const callbackFields = {
    state: false,
    code: false,
    idToken: false,
    ticket: false,
  };
  let stage = "callback_rate_limit";
  try {
    if (!(await consumeRateLimit(env, "callback", 100))) {
      logOAuthDiagnostic("callback_rate_limit", 302, "rate_limited", {
        state: false,
        code: false,
        error: false,
      });
      return appRedirect("rate_limited");
    }
    if (new URL(request.url).search) {
      logOAuthDiagnostic("callback_validation", 302, "callback_invalid", {
        queryStringAbsent: false,
      });
      return appRedirect("callback_invalid");
    }
    stage = "callback_form_parse";
    const params = await readFormBody(request);
    const states = params.getAll("state");
    const codes = params.getAll("code");
    const errors = params.getAll("error");
    const issuers = params.getAll("iss");
    callbackFields.state = states.length === 1;
    callbackFields.code = codes.length === 1;
    const allowed = new Set([
      "state", "code", "error", "error_description", "error_uri", "iss",
      "scope", "authuser", "prompt",
    ]);
    if (
      [...params.keys()].some((key) => !allowed.has(key)) ||
      [...params.keys()].some((key) => params.getAll(key).length !== 1) ||
      states.length !== 1 ||
      !TOKEN_PATTERN.test(states[0]) ||
      codes.length > 1 ||
      errors.length > 1 ||
      issuers.length > 1 ||
      (issuers.length === 1 && issuers[0] !== "https://accounts.google.com") ||
      (codes.length === 1) === (errors.length === 1)
    ) {
      logOAuthDiagnostic("callback_validation", 302, "callback_invalid", {
        state: callbackFields.state,
        code: callbackFields.code,
        error: errors.length === 1,
        issuer: issuers.length === 1,
      });
      return appRedirect("callback_invalid");
    }
    logOAuthDiagnostic("callback_validation", 302, "success", {
      state: true,
      code: codes.length === 1,
      error: errors.length === 1,
      issuer: issuers.length === 1,
    });
    stage = "callback_state_claim";
    const attempt = await claimAttempt(env, states[0]);
    if (!attempt) {
      logOAuthDiagnostic("callback_state", 302, "attempt_expired", {
        state: states.length === 1,
      });
      return appRedirect("attempt_expired");
    }
    if (errors.length) {
      const category = errors[0] === "access_denied"
        ? "cancelled"
        : "authorization_failed";
      logOAuthDiagnostic("google_authorization", 302, category, {
        error: true,
      });
      return appRedirect(category);
    }
    const code = codes[0];
    if (!code || code.length > 4096) {
      logOAuthDiagnostic("callback_validation", 302, "callback_invalid", {
        code: Boolean(code),
      });
      return appRedirect("callback_invalid");
    }

    stage = "google_token_exchange";
    let tokenResponse: Response;
    try {
      tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_OAUTH_CLIENT_ID,
          client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
          redirect_uri: new URL("/oauth/callback", baseUrl(env)).toString(),
          grant_type: "authorization_code",
          code_verifier: attempt.codeVerifier,
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      logOAuthDiagnostic("google_token_exchange", null, "network_error", {
        code: true,
        idToken: false,
      });
      return appRedirect("token_exchange_failed");
    }
    if (!tokenResponse.ok) {
      const category = await googleTokenErrorCategory(tokenResponse);
      logOAuthDiagnostic(
        "google_token_exchange",
        tokenResponse.status,
        category,
        { code: true, idToken: false },
      );
      return appRedirect("token_exchange_failed");
    }
    logOAuthDiagnostic("google_token_exchange", tokenResponse.status, "success", {
      code: true,
      response: true,
    });
    let tokens: GoogleTokenResponse;
    try {
      tokens = await tokenResponse.json() as GoogleTokenResponse;
    } catch {
      logOAuthDiagnostic(
        "google_token_exchange",
        tokenResponse.status,
        "token_response_invalid",
        { idToken: false },
      );
      return appRedirect("token_response_invalid");
    }
    callbackFields.idToken = typeof tokens.id_token === "string";
    if (typeof tokens.id_token !== "string") {
      logOAuthDiagnostic("google_token_exchange", 302, "id_token_missing", {
        idToken: false,
      });
      return appRedirect("identity_rejected");
    }
    stage = "google_identity_verification";
    try {
      await verifyGoogleIdToken(
        tokens.id_token,
        await sha256Hex(attempt.nonce),
        env.GOOGLE_OAUTH_CLIENT_ID,
      );
    } catch (error: unknown) {
      const category = error instanceof BrokerError &&
          /^[a-z_]+$/.test(error.code)
        ? error.code
        : "verification_failed";
      logOAuthDiagnostic("google_identity_verification", 302, category, {
        idToken: true,
        verified: false,
      });
      return appRedirect("identity_rejected");
    }
    logOAuthDiagnostic("google_identity_verification", 302, "success", {
      idToken: true,
      verified: true,
    });
    stage = "ticket_storage";
    const ticket = randomToken();
    callbackFields.ticket = true;
    try {
      const encryptedToken = await encrypt(env, JSON.stringify({
        idToken: tokens.id_token,
        nonce: attempt.nonce,
      } satisfies TicketPayload));
      const inserted = await env.DB.prepare(
        `INSERT INTO oauth_tickets (ticket_hash, app_challenge, id_token_ciphertext, expires_at)
         VALUES (?1, ?2, ?3, ?4) ON CONFLICT(ticket_hash) DO NOTHING`,
      ).bind(
        await sha256Hex(ticket),
        attempt.appChallenge,
        encryptedToken,
        Math.floor(Date.now() / 1000) + 90,
      ).run();
      if (inserted.meta?.changes !== 1) {
        callbackFields.ticket = false;
        logOAuthDiagnostic("ticket_storage", 302, "ticket_store_failed", {
          idToken: true,
          ticketStored: false,
        });
        return appRedirect("ticket_store_failed");
      }
    } catch {
      callbackFields.ticket = false;
      logOAuthDiagnostic("ticket_storage", 302, "ticket_store_failed", {
        idToken: true,
        ticketStored: false,
      });
      return appRedirect("ticket_store_failed");
    }
    logOAuthDiagnostic("ticket_storage", 302, "success", {
      idToken: true,
      ticketStored: true,
    });
    return appRedirect(undefined, ticket);
  } catch (error: unknown) {
    const category = error instanceof BrokerError
      ? error.code === "invalid_callback"
        ? "callback_invalid"
        : ["service_unavailable", "rate_limited"].includes(error.code)
          ? error.code
          : "callback_failed"
      : stage === "callback_state_claim"
        ? "state_claim_failed"
        : stage === "callback_form_parse"
          ? "callback_form_parse_failed"
          : "callback_failed";
    logOAuthDiagnostic(
      stage,
      error instanceof BrokerError ? error.status : 302,
      category,
      callbackFields,
    );
    return appRedirect(
      category === "callback_invalid"
        ? "callback_invalid"
        : category === "rate_limited"
          ? "rate_limited"
          : "callback_failed",
    );
  }
};

const handleRedeem = async (request: Request, env: Env): Promise<Response> => {
  if (!(await consumeRateLimit(env, "redeem", 100))) {
    throw new BrokerError(429, "rate_limited");
  }
  const body = await readJsonBody(request, ["ticket", "verifier"]);
  if (
    typeof body.ticket !== "string" ||
    !TOKEN_PATTERN.test(body.ticket) ||
    typeof body.verifier !== "string" ||
    !/^[A-Za-z0-9._~-]{43,128}$/.test(body.verifier)
  ) {
    logOAuthDiagnostic("ticket_redemption", 400, "invalid_request", {
      ticket: typeof body.ticket === "string",
      verifier: typeof body.verifier === "string",
    });
    throw new BrokerError(400, "invalid_request");
  }
  const encrypted = await env.DB.prepare(
    `DELETE FROM oauth_tickets
     WHERE ticket_hash = ?1 AND app_challenge = ?2 AND expires_at > ?3
     RETURNING id_token_ciphertext`,
  ).bind(
    await sha256Hex(body.ticket),
    await challengeFor(body.verifier),
    Math.floor(Date.now() / 1000),
  ).first<{ id_token_ciphertext: string }>();
  if (!encrypted) {
    logOAuthDiagnostic("ticket_redemption", 410, "ticket_expired_or_used", {
      ticket: true,
      verifier: true,
      idToken: false,
    });
    throw new BrokerError(410, "ticket_expired_or_used");
  }
  const ticketPayload = JSON.parse(
    await decrypt(env, encrypted.id_token_ciphertext),
  ) as Partial<TicketPayload>;
  if (
    typeof ticketPayload.idToken !== "string" ||
    typeof ticketPayload.nonce !== "string" ||
    !TOKEN_PATTERN.test(ticketPayload.nonce)
  ) {
    throw new BrokerError(500, "service_unavailable");
  }
  logOAuthDiagnostic("ticket_redemption", 200, "success", {
    ticket: true,
    verifier: true,
    idToken: Boolean(ticketPayload.idToken),
    nonce: Boolean(ticketPayload.nonce),
  });
  logNonceDiagnostic("nonce_ticket_redemption", {
    encoding: "original",
    nonceLength: ticketPayload.nonce.length,
    encryptedWithIdToken: true,
  });
  return jsonResponse(ticketPayload);
};

const withMethod = async (
  request: Request,
  env: Env,
  handler: (request: Request, env: Env) => Promise<Response>,
  stage: string,
): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  try {
    return await handler(request, env);
  } catch (error: unknown) {
    if (error instanceof BrokerError) {
      logOAuthDiagnostic(stage, error.status, error.code, {
        requestBody: request.headers.get("content-type") === "application/json",
      });
      return jsonResponse({ error: error.code }, error.status);
    }
    logOAuthDiagnostic(stage, 503, "service_unavailable", {
      requestBody: request.headers.get("content-type") === "application/json",
    });
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/oauth/start") {
      return await withMethod(request, env, handleStart, "oauth_start");
    }
    if (url.pathname === "/oauth/callback") {
      if (request.method !== "POST") {
        logOAuthDiagnostic("callback_method", 302, "method_not_allowed", {
          post: false,
        });
        return appRedirect("callback_invalid");
      }
      return await handleCallback(request, env);
    }
    if (url.pathname === "/oauth/redeem") {
      return await withMethod(request, env, handleRedeem, "oauth_redeem");
    }
    return jsonResponse({ error: "not_found" }, 404);
  },
};
