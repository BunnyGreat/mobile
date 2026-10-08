import { createClient } from "npm:@supabase/supabase-js@2";
import { sendOtpEmail } from "../_shared/sendOtpEmail.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type FirebaseUserLookup = {
  users?: Array<{ localId?: string; email?: string }>;
  error?: { message?: string };
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type SupabaseAuthUser = {
  id: string;
  email?: string;
};

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const encoder = new TextEncoder();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

let cachedServiceAccount: ServiceAccount | null = null;
let cachedAccessToken: { value: string; expiresAt: number } | null = null;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const requiredSecret = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing Edge Function secret: ${name}`);
  return value;
};

const getDatabaseClient = () =>
  createClient(
    requiredSecret("SUPABASE_URL"),
    requiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

const getServiceAccount = (): ServiceAccount => {
  if (cachedServiceAccount) return cachedServiceAccount;

  const parsed = JSON.parse(
    requiredSecret("FIREBASE_SERVICE_ACCOUNT_JSON"),
  ) as Partial<ServiceAccount>;
  if (
    !parsed.project_id ||
    !parsed.client_email ||
    !parsed.private_key
  ) {
    throw new Error("Firebase service account secret is incomplete.");
  }

  cachedServiceAccount = {
    project_id: parsed.project_id,
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri ?? "https://oauth2.googleapis.com/token",
  };
  return cachedServiceAccount;
};

const toBase64Url = (value: string | Uint8Array): string => {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const getGoogleAccessToken = async (): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) {
    return cachedAccessToken.value;
  }

  const account = getServiceAccount();
  const tokenUri = account.token_uri!;
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = toBase64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: tokenUri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const pem = account.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binaryKey = atob(pem);
  const keyBytes = Uint8Array.from(binaryKey, (character) =>
    character.charCodeAt(0),
  );
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    encoder.encode(signingInput),
  );
  const assertion = `${signingInput}.${toBase64Url(new Uint8Array(signature))}`;
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !result.access_token) {
    console.error("[password-reset] Google OAuth token request failed", response.status);
    throw new Error("Firebase authorization failed.");
  }

  cachedAccessToken = {
    value: result.access_token,
    expiresAt: now + (result.expires_in ?? 3600),
  };
  return cachedAccessToken.value;
};

const firebaseAdminRequest = async (
  path: string,
  body: Record<string, string | string[]>,
): Promise<Response> => {
  const account = getServiceAccount();
  const accessToken = await getGoogleAccessToken();
  return fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(account.project_id)}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
};

const findFirebaseUid = async (email: string): Promise<string | null> => {
  const response = await firebaseAdminRequest("accounts:lookup", {
    email: [email],
  });
  const payload = (await response.json()) as FirebaseUserLookup;

  if (!response.ok) {
    if (response.status === 400 && payload.error?.message === "EMAIL_NOT_FOUND") {
      return null;
    }
    console.error("[password-reset] Firebase account lookup failed", response.status);
    throw new Error("Firebase account lookup failed.");
  }

  return payload.users?.[0]?.localId ?? null;
};

const findFirebaseEmail = async (firebaseUid: string): Promise<string> => {
  const response = await firebaseAdminRequest("accounts:lookup", {
    localId: [firebaseUid],
  });
  const payload = (await response.json()) as FirebaseUserLookup;
  if (!response.ok) {
    console.error("[password-reset] Firebase account lookup failed", response.status);
    throw new Error("Firebase account lookup failed.");
  }

  const email = payload.users?.[0]?.email;
  if (!email) throw new Error("Firebase account has no email address.");
  return email;
};

const makeOtp = (): string => {
  const range = 0x100000000;
  const limit = Math.floor(range / 1_000_000) * 1_000_000;
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  let value = limit;

  while (value >= limit) {
    crypto.getRandomValues(bytes);
    value = view.getUint32(0, false);
  }

  return String(value % 1_000_000).padStart(6, "0");
};

const keyedHash = async (value: string): Promise<string> => {
  const pepper = requiredSecret("RESET_OTP_PEPPER");
  if (encoder.encode(pepper).byteLength < 32) {
    throw new Error("RESET_OTP_PEPPER must contain at least 32 bytes.");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const isEmail = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getClientAddress = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwarded?.split(",").at(-1)?.trim() ??
    "unknown"
  );
};

const invalidateChallenge = async (
  database: ReturnType<typeof createClient>,
  challengeId: string,
) => {
  const { error } = await database.rpc("invalidate_password_reset_challenge", {
    p_id: challengeId,
    p_now: new Date().toISOString(),
  });
  if (error) throw new Error("Unable to invalidate failed OTP challenge.");
};

const requestOtp = async (
  request: Request,
  database: ReturnType<typeof createClient>,
  email: string,
) => {
  const now = Date.now();
  const emailKey = await keyedHash(`email:${email}`);
  const { data: allowed, error: rateError } = await database.rpc(
    "consume_password_reset_rate_limit",
    {
      p_email_key: await keyedHash(`request-email:${email}`),
      p_ip_key: await keyedHash(`request-ip:${getClientAddress(request)}`),
      p_now: new Date(now).toISOString(),
    },
  );
  if (rateError) throw new Error("Unable to check password reset request limit.");
  if (allowed !== true) {
    throw new ApiError(
      429,
      "Too many requests. Please wait before requesting another code.",
      "RATE_LIMITED",
    );
  }

  const firebaseUid = await findFirebaseUid(email);
  const challengeId = crypto.randomUUID();
  const otp = makeOtp();
  const expiresAt = now + OTP_TTL_MS;
  const { error: storeError } = await database.rpc(
    "store_password_reset_challenge",
    {
      p_id: challengeId,
      p_firebase_uid: firebaseUid,
      p_email_key: emailKey,
      p_otp_hash: await keyedHash(`otp:${challengeId}:${otp}`),
      p_expires_at: new Date(expiresAt).toISOString(),
      p_now: new Date(now).toISOString(),
    },
  );
  if (storeError) throw new Error("Unable to save password reset challenge.");

  if (firebaseUid) {
    EdgeRuntime.waitUntil(
      sendOtpEmail(email, otp, "password-reset").then(async (result) => {
        if (!result.success) {
          console.error("[password-reset] OTP email delivery failed.");
          await invalidateChallenge(database, challengeId);
        }
      }).catch(async (error: unknown) => {
        console.error(
          "[password-reset] OTP delivery task failed:",
          error instanceof Error ? error.message : "Unknown error",
        );
        await invalidateChallenge(database, challengeId);
      }),
    );
  }

  return jsonResponse({
    success: true,
    challengeId,
    expiresAt,
    message: "If the email is associated with an account, a code has been sent.",
  });
};

const verifyOtp = async (
  database: ReturnType<typeof createClient>,
  challengeId: string,
  otp: string,
) => {
  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(400, "The code is invalid or expired.", "INVALID_OTP");
  }

  const resetAuthorization = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  const { data: verified, error } = await database.rpc(
    "verify_password_reset_otp",
    {
      p_challenge_id: challengeId,
      p_otp_hash: await keyedHash(`otp:${challengeId}:${otp}`),
      p_token_hash: await keyedHash(`reset-token:${resetAuthorization}`),
      p_token_expires_at: new Date(now + RESET_TOKEN_TTL_MS).toISOString(),
      p_now: new Date(now).toISOString(),
    },
  );
  if (error) throw new Error("Unable to verify password reset code.");
  if (verified !== true) {
    throw new ApiError(400, "The code is invalid or expired.", "INVALID_OTP");
  }

  return jsonResponse({ success: true, resetAuthorization });
};

const changeFirebasePassword = async (
  firebaseUid: string,
  password: string,
) => {
  const response = await firebaseAdminRequest("accounts:update", {
    localId: firebaseUid,
    password,
  });
  if (!response.ok) {
    console.error("[password-reset] Firebase password update failed", response.status);
    throw new ApiError(
      502,
      "Password could not be updated. Request a new code and try again.",
      "PASSWORD_UPDATE_FAILED",
    );
  }
};

const findSupabaseUserId = async (
  database: ReturnType<typeof createClient>,
  email: string,
): Promise<string> => {
  const normalizedEmail = email.trim().toLowerCase();
  const perPage = 1000;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await database.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      console.error("[password-reset] Supabase account lookup failed");
      throw new ApiError(
        502,
        "Unable to synchronize the app account password.",
        "SUPABASE_ACCOUNT_LOOKUP_FAILED",
      );
    }

    const matchingUser = (data.users as SupabaseAuthUser[]).find(
      (user) => user.email?.trim().toLowerCase() === normalizedEmail,
    );
    if (matchingUser) return matchingUser.id;
    if (data.users.length < perPage) break;
  }

  throw new ApiError(
    409,
    "No matching app account was found. The password was not changed.",
    "SUPABASE_ACCOUNT_NOT_FOUND",
  );
};

const changeSupabasePassword = async (
  database: ReturnType<typeof createClient>,
  supabaseUserId: string,
  password: string,
) => {
  const { error } = await database.auth.admin.updateUserById(supabaseUserId, {
    password,
  });
  if (error) {
    console.error("[password-reset] Supabase password update failed");
    throw new ApiError(
      502,
      "Firebase password changed, but the app account password could not be synchronized. Contact support before retrying.",
      "SUPABASE_PASSWORD_SYNC_FAILED",
    );
  }
};

const resetPassword = async (
  database: ReturnType<typeof createClient>,
  resetAuthorization: string,
  password: string,
) => {
  if (
    password.length < 8 ||
    password.length > 4096 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and include uppercase, lowercase, and numeric characters.",
      "INVALID_PASSWORD",
    );
  }

  const { data: firebaseUid, error } = await database.rpc(
    "claim_password_reset_token",
    {
      p_token_hash: await keyedHash(`reset-token:${resetAuthorization}`),
      p_now: new Date().toISOString(),
    },
  );
  if (error) throw new Error("Unable to validate password reset authorization.");
  if (typeof firebaseUid !== "string" || !firebaseUid) {
    throw new ApiError(
      401,
      "Reset authorization is invalid or expired. Request a new code.",
      "RESET_AUTHORIZATION_INVALID",
    );
  }

  const firebaseEmail = await findFirebaseEmail(firebaseUid);
  const supabaseUserId = await findSupabaseUserId(database, firebaseEmail);
  await changeFirebasePassword(firebaseUid, password);
  await changeSupabasePassword(database, supabaseUserId, password);
  return jsonResponse({ success: true });
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action;
    const database = getDatabaseClient();

    if (action === "request") {
      if (!isEmail(body.email)) {
        throw new ApiError(400, "Enter a valid email address.", "INVALID_EMAIL");
      }
      return await requestOtp(request, database, body.email.trim().toLowerCase());
    }

    if (action === "verify") {
      if (!isUuid(body.challengeId) || typeof body.otp !== "string") {
        throw new ApiError(400, "The code is invalid or expired.", "INVALID_OTP");
      }
      return await verifyOtp(database, body.challengeId, body.otp);
    }

    if (action === "reset") {
      if (
        typeof body.resetAuthorization !== "string" ||
        !/^[A-Za-z0-9_-]{43}$/.test(body.resetAuthorization) ||
        typeof body.password !== "string"
      ) {
        throw new ApiError(
          401,
          "Reset authorization is invalid or expired. Request a new code.",
          "RESET_AUTHORIZATION_INVALID",
        );
      }
      return await resetPassword(
        database,
        body.resetAuthorization,
        body.password,
      );
    }

    throw new ApiError(400, "Invalid password reset action.", "INVALID_ACTION");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return jsonResponse(
        { error: error.message, code: error.code },
        error.status,
      );
    }
    console.error(
      "[password-reset] Request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonResponse(
      { error: "Unable to process the password reset request." },
      500,
    );
  }
});
