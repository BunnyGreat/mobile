import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

declare const Deno: {
  env: { get(name: string): string | undefined };
};

const GOOGLE_REDIRECT_URI =
  "https://vmkinoqserekbymhhczo.supabase.co/functions/v1/google-oauth-callback";
const APP_REDIRECT_URI = "barangay://oauth/google";
const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_CERTS_ENDPOINT = "https://www.googleapis.com/oauth2/v3/certs";
const encoder = new TextEncoder();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

type GoogleAttempt = {
  nonce: string;
  code_verifier: string;
  app_challenge: string;
};

type GoogleTokenResponse = {
  id_token?: unknown;
};

type GoogleIdTokenClaims = {
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
};

type GoogleJwk = JsonWebKey & { kid?: string };

class BrokerError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

let databaseClient: SupabaseClient | undefined;

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });

const requiredSecret = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) throw new BrokerError(500, "service_unavailable");
  return value;
};

const getDatabaseClient = (): SupabaseClient => {
  if (!databaseClient) {
    databaseClient = createClient(
      requiredSecret("SUPABASE_URL"),
      requiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return databaseClient;
};

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const fromBase64Url = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const randomToken = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

const sha256Bytes = async (value: string): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

const sha256Hex = async (value: string): Promise<string> =>
  Array.from(await sha256Bytes(value), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

const codeChallenge = async (verifier: string): Promise<string> =>
  toBase64Url(await sha256Bytes(verifier));

const hmacKey = async (): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(requiredSecret("GOOGLE_OAUTH_CLIENT_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

const checkRateLimit = async (
  operation: string,
  maximum: number,
): Promise<boolean> => {
  const key = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    encoder.encode(`${operation}:global`),
  );
  const keyHash = Array.from(new Uint8Array(key), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const { data, error } = await getDatabaseClient().rpc(
    "consume_google_oauth_rate_limit",
    {
      p_key_hash: keyHash,
      p_now: new Date().toISOString(),
      p_max_attempts: maximum,
      p_window_seconds: 900,
    },
  );
  if (error) throw new BrokerError(500, "service_unavailable");
  return data === true;
};

const exactObjectKeys = (
  value: Record<string, unknown>,
  keys: string[],
): boolean =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));

const parseJsonObject = async (
  request: Request,
  allowedKeys: string[],
): Promise<Record<string, unknown>> => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 1024) {
    throw new BrokerError(413, "invalid_request");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BrokerError(400, "invalid_request");
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !exactObjectKeys(body as Record<string, unknown>, allowedKeys)
  ) {
    throw new BrokerError(400, "invalid_request");
  }
  return body as Record<string, unknown>;
};

const parseGoogleFormPost = async (
  request: Request,
): Promise<URLSearchParams> => {
  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (
    contentType !== "application/x-www-form-urlencoded" ||
    (Number.isFinite(contentLength) && contentLength > 16384)
  ) {
    throw new BrokerError(400, "invalid_callback");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new BrokerError(400, "invalid_callback");

  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalLength += value.length;
      if (totalLength > 16384) {
        await reader.cancel();
        throw new BrokerError(413, "invalid_callback");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  let form: string;
  try {
    form = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new BrokerError(400, "invalid_callback");
  }
  return new URLSearchParams(form);
};

const claimAttempt = async (state: string): Promise<GoogleAttempt | null> => {
  const { data, error } = await getDatabaseClient().rpc(
    "claim_google_oauth_attempt",
    {
      p_state_hash: await sha256Hex(state),
      p_now: new Date().toISOString(),
    },
  );
  if (error) throw new BrokerError(500, "service_unavailable");
  if (!Array.isArray(data) || data.length !== 1) return null;
  const attempt = data[0] as Partial<GoogleAttempt>;
  if (
    typeof attempt.nonce !== "string" ||
    typeof attempt.code_verifier !== "string" ||
    typeof attempt.app_challenge !== "string"
  ) {
    throw new BrokerError(500, "service_unavailable");
  }
  return attempt as GoogleAttempt;
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
    header = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0])));
    claims = JSON.parse(
      new TextDecoder().decode(fromBase64Url(parts[1])),
    ) as GoogleIdTokenClaims;
  } catch {
    throw new BrokerError(401, "invalid_identity");
  }
  if (
    header.alg !== "RS256" ||
    typeof header.kid !== "string" ||
    !header.kid ||
    typeof claims.iss !== "string" ||
    !["https://accounts.google.com", "accounts.google.com"].includes(claims.iss) ||
    !(
      claims.aud === clientId ||
      (Array.isArray(claims.aud) && claims.aud.includes(clientId))
    ) ||
    (Array.isArray(claims.aud) &&
      claims.aud.length > 1 &&
      claims.azp !== clientId) ||
    (claims.azp !== undefined && claims.azp !== clientId) ||
    typeof claims.exp !== "number" ||
    claims.exp <= Math.floor(Date.now() / 1000) ||
    typeof claims.iat !== "number" ||
    claims.iat > Math.floor(Date.now() / 1000) + 60 ||
    claims.iat < Math.floor(Date.now() / 1000) - 3600 ||
    claims.exp <= claims.iat ||
    (claims.nbf !== undefined &&
      (typeof claims.nbf !== "number" ||
        claims.nbf > Math.floor(Date.now() / 1000))) ||
    typeof claims.nonce !== "string" ||
    claims.nonce !== expectedNonce ||
    typeof claims.sub !== "string" ||
    !claims.sub ||
    typeof claims.email !== "string" ||
    !claims.email ||
    claims.email_verified !== true
  ) {
    throw new BrokerError(401, "invalid_identity");
  }

  let jwks: { keys?: GoogleJwk[] };
  try {
    const response = await fetch(GOOGLE_CERTS_ENDPOINT, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new BrokerError(503, "identity_service_unavailable");
    jwks = (await response.json()) as { keys?: GoogleJwk[] };
  } catch {
    throw new BrokerError(503, "identity_service_unavailable");
  }

  const jwk = jwks.keys?.find((key) => key.kid === header.kid);
  if (!jwk) throw new BrokerError(401, "invalid_identity");

  let signatureValid = false;
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    signatureValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      fromBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
  } catch {
    throw new BrokerError(401, "invalid_identity");
  }
  if (!signatureValid) throw new BrokerError(401, "invalid_identity");
};

const appRedirect = (error?: string, ticket?: string): Response => {
  const redirect = new URL(APP_REDIRECT_URI);
  if (ticket) redirect.searchParams.set("ticket", ticket);
  else redirect.searchParams.set("error", error ?? "oauth_failed");
  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "Location": redirect.toString(),
      "Referrer-Policy": "no-referrer",
    },
  });
};

const handleFailure = (error: unknown): Response => {
  if (error instanceof BrokerError) {
    return jsonResponse({ error: error.code }, error.status);
  }
  return jsonResponse({ error: "service_unavailable" }, 500);
};

export const handleGoogleOAuthStart = async (
  request: Request,
): Promise<Response> => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const body = await parseJsonObject(request, ["appChallenge"]);
    if (
      typeof body.appChallenge !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(body.appChallenge)
    ) {
      throw new BrokerError(400, "invalid_request");
    }
    if (!(await checkRateLimit("start", 100))) {
      throw new BrokerError(429, "rate_limited");
    }

    const clientId = requiredSecret("GOOGLE_OAUTH_CLIENT_ID");
    requiredSecret("GOOGLE_OAUTH_CLIENT_SECRET");
    const state = randomToken();
    const nonce = randomToken();
    const codeVerifier = randomToken();
    const now = new Date();
    const { data, error } = await getDatabaseClient().rpc(
      "create_google_oauth_attempt",
      {
        p_state_hash: await sha256Hex(state),
        p_nonce: nonce,
        p_code_verifier: codeVerifier,
        p_app_challenge: body.appChallenge,
        p_now: now.toISOString(),
        p_expires_at: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
      },
    );
    if (error || data !== true) {
      throw new BrokerError(500, "service_unavailable");
    }

    const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
    authorizationUrl.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      response_mode: "form_post",
      state,
      nonce,
      code_challenge: await codeChallenge(codeVerifier),
      code_challenge_method: "S256",
    }).toString();

    return jsonResponse({ authorizationUrl: authorizationUrl.toString() });
  } catch (error: unknown) {
    return handleFailure(error);
  }
};

export const handleGoogleOAuthCallback = async (
  request: Request,
): Promise<Response> => {
  if (request.method !== "POST") return appRedirect();

  try {
    if (!(await checkRateLimit("callback", 100))) {
      return appRedirect("oauth_failed");
    }

    if (new URL(request.url).search) return appRedirect("oauth_failed");
    const params = await parseGoogleFormPost(request);
    const states = params.getAll("state");
    const codes = params.getAll("code");
    const errors = params.getAll("error");
    const issuers = params.getAll("iss");
    const allowedFields = new Set([
      "state",
      "code",
      "error",
      "error_description",
      "error_uri",
      "iss",
      "scope",
      "authuser",
      "prompt",
    ]);
    if (
      [...params.keys()].some((key) => !allowedFields.has(key)) ||
      [...params.keys()].some((key) => params.getAll(key).length !== 1) ||
      states.length !== 1 ||
      !/^[A-Za-z0-9_-]{43}$/.test(states[0]) ||
      codes.length > 1 ||
      errors.length > 1 ||
      issuers.length > 1 ||
      (issuers.length === 1 && issuers[0] !== "https://accounts.google.com") ||
      (codes.length === 1) === (errors.length === 1)
    ) {
      return appRedirect("oauth_failed");
    }

    const attempt = await claimAttempt(states[0]);
    if (!attempt) return appRedirect("oauth_failed");
    if (errors.length === 1) {
      return appRedirect(errors[0] === "access_denied" ? "cancelled" : "oauth_failed");
    }

    const code = codes[0];
    if (!code || code.length > 4096) return appRedirect("oauth_failed");

    const clientId = requiredSecret("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = requiredSecret("GOOGLE_OAUTH_CLIENT_SECRET");
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: attempt.code_verifier,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!tokenResponse.ok) return appRedirect("oauth_failed");
    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
    if (typeof tokens.id_token !== "string") return appRedirect("oauth_failed");
    await verifyGoogleIdToken(tokens.id_token, attempt.nonce, clientId);

    const ticket = randomToken();
    const now = new Date();
    const { data, error } = await getDatabaseClient().rpc(
      "create_google_oauth_ticket",
      {
        p_ticket_hash: await sha256Hex(ticket),
        p_app_challenge: attempt.app_challenge,
        p_google_id_token: tokens.id_token,
        p_now: now.toISOString(),
        p_expires_at: new Date(now.getTime() + 90 * 1000).toISOString(),
      },
    );
    if (error || data !== true) return appRedirect("oauth_failed");
    return appRedirect(undefined, ticket);
  } catch {
    return appRedirect("oauth_failed");
  }
};

export const handleGoogleOAuthRedeem = async (
  request: Request,
): Promise<Response> => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const body = await parseJsonObject(request, ["ticket", "verifier"]);
    if (
      typeof body.ticket !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(body.ticket) ||
      typeof body.verifier !== "string" ||
      !/^[A-Za-z0-9._~-]{43,128}$/.test(body.verifier)
    ) {
      throw new BrokerError(400, "invalid_request");
    }
    if (!(await checkRateLimit("redeem", 100))) {
      throw new BrokerError(429, "rate_limited");
    }

    const { data, error } = await getDatabaseClient().rpc(
      "redeem_google_oauth_ticket",
      {
        p_ticket_hash: await sha256Hex(body.ticket),
        p_app_challenge: await codeChallenge(body.verifier),
        p_now: new Date().toISOString(),
      },
    );
    if (error) throw new BrokerError(500, "service_unavailable");
    if (typeof data !== "string") {
      throw new BrokerError(410, "ticket_expired_or_used");
    }
    return jsonResponse({ idToken: data });
  } catch (error: unknown) {
    return handleFailure(error);
  }
};
