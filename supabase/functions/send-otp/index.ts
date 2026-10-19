import { createClient } from "npm:@supabase/supabase-js@2";
import { sendOtpEmail } from "../_shared/sendOtpEmail.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
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

type RegistrationAuthMethod = "password" | "google";

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const OTP_TTL_MS = 5 * 60 * 1000;
const encoder = new TextEncoder();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

let databaseClient: ReturnType<typeof createClient> | undefined;
let cachedServiceAccount: ServiceAccount | undefined;
let cachedAccessToken: { value: string; expiresAt: number } | undefined;

const jsonResponse = (body: unknown, status = 200) =>
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
  if (!value) throw new Error(`Required server configuration is unavailable.`);
  return value;
};

const getDatabaseClient = () => {
  if (!databaseClient) {
    databaseClient = createClient(
      requiredSecret("SUPABASE_URL"),
      requiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return databaseClient;
};

const toBase64Url = (value: string | Uint8Array): string => {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const getServiceAccount = (): ServiceAccount => {
  if (cachedServiceAccount) return cachedServiceAccount;
  const parsed = JSON.parse(
    requiredSecret("FIREBASE_SERVICE_ACCOUNT_JSON"),
  ) as Partial<ServiceAccount>;
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error("Firebase Admin configuration is incomplete.");
  }
  cachedServiceAccount = {
    project_id: parsed.project_id,
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri ?? "https://oauth2.googleapis.com/token",
  };
  return cachedServiceAccount;
};

const getFirebaseAccessToken = async (): Promise<string> => {
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
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${toBase64Url(new Uint8Array(signature))}`,
    }),
  });
  const result = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!response.ok || !result.access_token) {
    console.error("[send-otp] Firebase Admin authorization failed", response.status);
    throw new Error("Firebase Admin authorization failed.");
  }
  cachedAccessToken = {
    value: result.access_token,
    expiresAt: now + (result.expires_in ?? 3600),
  };
  return cachedAccessToken.value;
};

const findFirebaseAccount = async (email: string): Promise<boolean> => {
  const account = getServiceAccount();
  const accessToken = await getFirebaseAccessToken();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(account.project_id)}/accounts:lookup`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: [email] }),
    },
  );
  const payload = (await response.json()) as FirebaseUserLookup;
  if (!response.ok) {
    if (
      response.status === 400 &&
      payload.error?.message === "EMAIL_NOT_FOUND"
    ) {
      return false;
    }
    console.error("[send-otp] Firebase account lookup failed", response.status);
    throw new Error("Firebase account lookup failed.");
  }
  return Boolean(payload.users?.length);
};

const isRegistrationEmailAvailable = async (
  database: ReturnType<typeof createClient>,
  email: string,
): Promise<boolean> => {
  const firebaseAccountExists = await findFirebaseAccount(email);
  const { data: supabaseAccountExists, error: supabaseLookupError } =
    await database.rpc("registration_email_exists", { p_email: email });
  if (supabaseLookupError || typeof supabaseAccountExists !== "boolean") {
    console.error("[send-otp] Supabase account lookup failed.");
    throw new Error("Supabase account lookup failed.");
  }
  return !firebaseAccountExists && !supabaseAccountExists;
};

const keyedHash = async (value: string): Promise<string> => {
  const pepper = requiredSecret("RESET_OTP_PEPPER");
  if (encoder.encode(pepper).byteLength < 32) {
    throw new Error("The OTP signing configuration is invalid.");
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

const isEmail = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const getClientAddress = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwarded?.split(",").at(-1)?.trim() ??
    "unknown"
  );
};

const requestOtp = async (
  request: Request,
  email: string,
  authMethod: RegistrationAuthMethod,
) => {
  const database = getDatabaseClient();
  const now = Date.now();
  const { data: allowed, error: rateError } = await database.rpc(
    "consume_password_reset_rate_limit",
    {
      p_email_key: await keyedHash(`registration-request-email:${email}`),
      p_ip_key: await keyedHash(
        `registration-request-ip:${getClientAddress(request)}`,
      ),
      p_now: new Date(now).toISOString(),
    },
  );
  if (rateError) throw new Error("Unable to check verification request limits.");
  if (allowed !== true) {
    throw new ApiError(
      429,
      "RATE_LIMITED",
      "Too many requests. Please wait before requesting another code.",
    );
  }

  if (
    authMethod === "password" &&
    !(await isRegistrationEmailAvailable(database, email))
  ) {
    throw new ApiError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "This email is already registered. Please sign in or use another email address.",
    );
  }

  const challengeId = crypto.randomUUID();
  const otp = makeOtp();
  const expiresAt = now + OTP_TTL_MS;
  const { data: stored, error: storeError } = await database.rpc(
    "store_registration_email_challenge",
    {
      p_id: challengeId,
      p_email_key: await keyedHash(`email:${email}`),
      p_otp_hash: await keyedHash(`registration-otp:${challengeId}:${otp}`),
      p_auth_method: authMethod,
      p_expires_at: new Date(expiresAt).toISOString(),
      p_now: new Date(now).toISOString(),
    },
  );
  if (storeError || stored !== true) {
    throw new Error("Unable to save the email verification challenge.");
  }

  const delivery = await sendOtpEmail(email, otp, "registration");
  if (!delivery.success) {
    const { error: invalidateError } = await database.rpc(
      "invalidate_registration_email_challenge",
      { p_id: challengeId, p_now: new Date().toISOString() },
    );
    if (invalidateError) {
      console.error("[send-otp] Failed to invalidate undelivered challenge.");
    }
    throw new ApiError(
      502,
      "EMAIL_DELIVERY_FAILED",
      "Unable to send a verification code. Please try again later.",
    );
  }

  return jsonResponse({
    success: true,
    challengeId,
    expiresAt: new Date(expiresAt).toISOString(),
  });
};

const verifyOtp = async (
  email: string,
  challengeId: string,
  otp: string,
) => {
  if (!/^\d{6}$/.test(otp)) {
    return jsonResponse({
      success: false,
      code: "INVALID_OTP",
      error: "The code is invalid or expired.",
    });
  }

  const database = getDatabaseClient();
  const { data: authMethod, error } = await database.rpc(
    "verify_registration_email_challenge",
    {
      p_id: challengeId,
      p_email_key: await keyedHash(`email:${email}`),
      p_otp_hash: await keyedHash(`registration-otp:${challengeId}:${otp}`),
      p_now: new Date().toISOString(),
    },
  );
  if (error) throw new Error("Unable to verify the email challenge.");
  if (authMethod !== "password" && authMethod !== "google") {
    return jsonResponse({
      success: false,
      code: "INVALID_OTP",
      error: "The code is invalid or expired.",
    });
  }

  let emailAvailable = true;
  if (authMethod === "password") {
    emailAvailable = await isRegistrationEmailAvailable(database, email);
  }
  return jsonResponse({ success: true, authMethod, emailAvailable });
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed." }, 405);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action;
    if (action === "request") {
      const email = isEmail(body.email) ? body.email.trim().toLowerCase() : "";
      const authMethod = body.authMethod;
      if (!email) {
        throw new ApiError(400, "INVALID_EMAIL", "Enter a valid email address.");
      }
      if (authMethod !== "password" && authMethod !== "google") {
        throw new ApiError(400, "INVALID_REQUEST", "Invalid registration request.");
      }
      return await requestOtp(request, email, authMethod);
    }

    if (action === "verify") {
      const email = isEmail(body.email) ? body.email.trim().toLowerCase() : "";
      if (!email || !isUuid(body.challengeId) || typeof body.otp !== "string") {
        throw new ApiError(400, "INVALID_REQUEST", "The verification request is invalid.");
      }
      return await verifyOtp(email, body.challengeId, body.otp);
    }

    throw new ApiError(400, "INVALID_ACTION", "Invalid verification request.");
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return jsonResponse(
        { success: false, code: error.code, error: error.message },
        error.status,
      );
    }
    console.error(
      "[send-otp] Request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonResponse(
      {
        success: false,
        error: "Unable to process email verification. Please try again.",
      },
      500,
    );
  }
});
