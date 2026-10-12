import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthenticationError } from "./googleAuthenticationError";
import { getGoogleWebClientId } from "./googleOAuthConfig";

const APP_REDIRECT_URI = "barangay://oauth/google";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const GOOGLE_NONCE_HASH_PATTERN = /^[a-f0-9]{64}$/;
const BROWSER_AUTH_TIMEOUT_MS = 2 * 60 * 1000;

type StartResponse = {
  authorizationUrl?: unknown;
};

type RedeemResponse = {
  idToken?: unknown;
  nonce?: unknown;
};

const logOAuthDiagnostic = (
  stage: string,
  status: number | null,
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

class BrokerRequestError extends Error {
  constructor(
    readonly status: number | null,
    readonly category: string,
  ) {
    super(category);
  }
}

const brokerErrorCodes = new Set([
  "invalid_request",
  "method_not_allowed",
  "not_found",
  "rate_limited",
  "service_unavailable",
  "ticket_expired_or_used",
]);

const callbackErrorCategories = new Set([
  "authorization_failed",
  "attempt_expired",
  "callback_failed",
  "callback_invalid",
  "identity_rejected",
  "oauth_failed",
  "rate_limited",
  "ticket_store_failed",
  "token_exchange_failed",
  "token_response_invalid",
]);

const callbackErrorMessages: Record<string, [string, string]> = {
  authorization_failed: [
    "google_oauth_authorization_failed",
    "Google authorization was unsuccessful. Please try again.",
  ],
  attempt_expired: [
    "google_oauth_attempt_expired",
    "Google sign-in expired. Please start again.",
  ],
  callback_invalid: [
    "google_oauth_invalid_callback",
    "Google returned an invalid authorization response.",
  ],
  callback_failed: [
    "google_oauth_callback_failed",
    "Google could not complete sign-in. Please try again.",
  ],
  identity_rejected: [
    "google_oauth_identity_rejected",
    "Google identity verification failed. Please try again.",
  ],
  rate_limited: [
    "google_oauth_rate_limited",
    "Too many Google sign-in attempts. Please wait and try again.",
  ],
  ticket_store_failed: [
    "google_oauth_ticket_failed",
    "Google sign-in could not be securely completed. Please try again.",
  ],
  token_exchange_failed: [
    "google_oauth_exchange_failed",
    "Google could not complete sign-in. Check your connection and try again.",
  ],
  token_response_invalid: [
    "google_oauth_exchange_failed",
    "Google returned an invalid token response. Please try again.",
  ],
};

const getBrokerBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL;
  let url: URL;
  try {
    url = new URL(configuredUrl ?? "");
  } catch {
    logOAuthDiagnostic("broker_configuration", null, "missing_or_invalid", {
      brokerUrl: Boolean(configuredUrl),
    });
    throw new GoogleAuthenticationError(
      "google_oauth_not_configured",
      "Google Sign-In is not configured for this app.",
    );
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
    logOAuthDiagnostic("broker_configuration", null, "invalid", {
      brokerUrl: true,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_not_configured",
      "Google Sign-In is not configured for this app.",
    );
  }
  return url.origin;
};

const postJson = async <T>(
  url: string,
  body: Record<string, string>,
  stage: string,
  responseFields: string[],
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const requestFieldsPresent = Object.fromEntries(
    Object.keys(body).map((key) => [
      `request_${key}`,
      typeof body[key] === "string" && Boolean(body[key]),
    ]),
  );
  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      logOAuthDiagnostic(stage, null, "network_error", requestFieldsPresent);
      throw new BrokerRequestError(null, "network_error");
    }

    let data: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = await response.json();
      if (typeof parsed === "object" && parsed !== null) {
        data = parsed as Record<string, unknown>;
      }
    } catch {
      logOAuthDiagnostic(stage, response.status, "invalid_json", {
        ...requestFieldsPresent,
        ...Object.fromEntries(
          responseFields.map((key) => [key, false]),
        ),
      });
      throw new BrokerRequestError(response.status, "invalid_json");
    }

    const fieldsPresent = Object.fromEntries(
      [
        ...Object.entries(requestFieldsPresent),
        ...responseFields.map((key) => [
          `response_${key}`,
          typeof data?.[key] === "string" && Boolean(data[key]),
        ]),
      ],
    );
    if (!response.ok) {
      const error = typeof data?.error === "string" &&
          brokerErrorCodes.has(data.error)
        ? data.error
        : "http_error";
      logOAuthDiagnostic(stage, response.status, error, fieldsPresent);
      throw new BrokerRequestError(response.status, error);
    }
    logOAuthDiagnostic(stage, response.status, "success", fieldsPresent);
    return (data ?? {}) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const getBrokerFailure = (
  error: unknown,
  stage: "google_oauth_start_failed" | "google_oauth_ticket_invalid",
): GoogleAuthenticationError => {
  const category = error instanceof BrokerRequestError
    ? error.category
    : "request_failed";
  if (stage === "google_oauth_start_failed") {
    if (category === "rate_limited") {
      return new GoogleAuthenticationError(
        "google_oauth_rate_limited",
        "Too many Google sign-in attempts. Please wait and try again.",
      );
    }
    return new GoogleAuthenticationError(
      "google_oauth_start_failed",
      "Google Sign-In service is temporarily unavailable. Check your connection and try again.",
    );
  }
  if (category === "ticket_expired_or_used") {
    return new GoogleAuthenticationError(
      "google_oauth_ticket_expired",
      "Google sign-in expired. Please start again.",
    );
  }
  if (category === "rate_limited") {
    return new GoogleAuthenticationError(
      "google_oauth_rate_limited",
      "Too many Google sign-in attempts. Please wait and try again.",
    );
  }
  return new GoogleAuthenticationError(
    "google_oauth_ticket_invalid",
    "Google Sign-In could not verify this response. Please try again.",
  );
};

const createVerifier = async (): Promise<string> =>
  Array.from(await Crypto.getRandomBytesAsync(32), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

const createChallenge = async (verifier: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return digest.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const parseCallback = (url: string): string => {
  logOAuthDiagnostic("browser_callback", null, "received", {
    url: Boolean(url),
  });
  let callback: URL;
  try {
    callback = new URL(url);
  } catch {
    logOAuthDiagnostic("callback_parse", null, "invalid_url", {
      url: Boolean(url),
    });
    throw new GoogleAuthenticationError(
      "google_oauth_invalid_callback",
      "Google Sign-In returned an invalid response.",
    );
  }

  if (
    callback.protocol !== "barangay:" ||
    callback.hostname !== "oauth" ||
    callback.pathname !== "/google" ||
    callback.username ||
    callback.password ||
    callback.port ||
    callback.hash
  ) {
    logOAuthDiagnostic("callback_parse", null, "invalid_destination", {
      scheme: callback.protocol === "barangay:",
      host: callback.hostname === "oauth",
      path: callback.pathname === "/google",
      fragmentAbsent: !callback.hash,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_invalid_callback",
      "Google Sign-In returned an invalid response.",
    );
  }

  const ticketValues = callback.searchParams.getAll("ticket");
  const errorValues = callback.searchParams.getAll("error");
  const entries = [...callback.searchParams.keys()];
  const hasOneTicket =
    entries.length === 1 &&
    entries[0] === "ticket" &&
    ticketValues.length === 1 &&
    errorValues.length === 0;

  if (hasOneTicket) {
    const ticket = ticketValues[0];
    if (ticket && TOKEN_PATTERN.test(ticket)) {
      logOAuthDiagnostic("callback_parse", null, "success", {
        ticket: true,
        error: false,
      });
      return ticket;
    }
  }

  if (
    ticketValues.length === 0 &&
    errorValues.length === 1 &&
    entries.length === 1
  ) {
    if (errorValues[0] === "cancelled") {
      logOAuthDiagnostic("callback_parse", null, "cancelled", {
        ticket: false,
        error: true,
      });
      throw new GoogleAuthenticationError(
        "google_sign_in_cancelled",
        "Google Sign-In was cancelled.",
      );
    }
    if (errorValues[0] === "oauth_failed") {
      logOAuthDiagnostic("callback_parse", null, "oauth_failed", {
        ticket: false,
        error: true,
      });
      throw new GoogleAuthenticationError(
        "google_oauth_callback_failed",
        "Google could not complete sign-in. Please try again.",
      );
    }
    const callbackError = errorValues[0];
    const knownCallbackError = callbackErrorCategories.has(callbackError);
    logOAuthDiagnostic(
      "callback_parse",
      null,
      knownCallbackError ? callbackError : "unknown_callback_error",
      { ticket: false, error: true },
    );
    if (callbackError === "cancelled") {
      throw new GoogleAuthenticationError(
        "google_sign_in_cancelled",
        "Google Sign-In was cancelled.",
      );
    }
    if (callbackError === "oauth_failed") {
      throw new GoogleAuthenticationError(
        "google_oauth_callback_failed",
        "Google could not complete sign-in. Please try again.",
      );
    }
    const callbackFailure = callbackErrorMessages[callbackError];
    if (callbackFailure) {
      throw new GoogleAuthenticationError(...callbackFailure);
    }
  }

  logOAuthDiagnostic("callback_parse", null, "invalid_fields", {
    ticket: ticketValues.length === 1,
    error: errorValues.length === 1,
  });
  throw new GoogleAuthenticationError(
    "google_oauth_invalid_callback",
    "Google Sign-In returned an invalid response.",
  );
};

export type GoogleBrowserSignInResult = {
  idToken: string;
  nonce: string;
};

export const signInWithGoogleBrowserFallback = async (): Promise<GoogleBrowserSignInResult> => {
  const verifier = await createVerifier();
  const appChallenge = await createChallenge(verifier);
  const brokerBaseUrl = getBrokerBaseUrl();
  let startData: StartResponse | null;
  try {
    startData = await postJson<StartResponse>(
      `${brokerBaseUrl}/oauth/start`,
      { appChallenge },
      "oauth_start",
      ["authorizationUrl"],
    );
  } catch (error: unknown) {
    throw getBrokerFailure(error, "google_oauth_start_failed");
  }

  if (typeof startData?.authorizationUrl !== "string") {
    logOAuthDiagnostic("oauth_start", 200, "missing_authorization_url", {
      authorizationUrl: false,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_start_failed",
      "Google Sign-In service is temporarily unavailable. Check your connection and try again.",
    );
  }

  let authorizationUrl: URL;
  try {
    authorizationUrl = new URL(startData.authorizationUrl);
  } catch {
    logOAuthDiagnostic("authorization_url_validation", 200, "invalid_url", {
      authorizationUrl: true,
      validUrl: false,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_invalid_authorization_url",
      "Google Sign-In returned an invalid authorization request.",
    );
  }
  if (
    authorizationUrl.protocol !== "https:" ||
    authorizationUrl.hostname !== "accounts.google.com" ||
    authorizationUrl.pathname !== "/o/oauth2/v2/auth" ||
    authorizationUrl.username ||
    authorizationUrl.password ||
    authorizationUrl.hash ||
    authorizationUrl.searchParams.get("redirect_uri") !==
      `${brokerBaseUrl}/oauth/callback` ||
    authorizationUrl.searchParams.get("client_id") !== getGoogleWebClientId() ||
    authorizationUrl.searchParams.get("response_type") !== "code" ||
    authorizationUrl.searchParams.get("scope") !== "openid email profile" ||
    authorizationUrl.searchParams.get("response_mode") !== "form_post" ||
    authorizationUrl.searchParams.get("code_challenge_method") !== "S256" ||
    [...authorizationUrl.searchParams.keys()].length !== 9 ||
    [...authorizationUrl.searchParams.keys()].some(
      (key) =>
        ![
          "client_id",
          "redirect_uri",
          "response_type",
          "scope",
          "response_mode",
          "state",
          "nonce",
          "code_challenge",
          "code_challenge_method",
        ].includes(key),
    ) ||
    ["client_id", "redirect_uri", "response_type", "scope", "response_mode",
      "state", "nonce", "code_challenge", "code_challenge_method"].some(
      (key) => authorizationUrl.searchParams.getAll(key).length !== 1,
    ) ||
    !TOKEN_PATTERN.test(authorizationUrl.searchParams.get("state") ?? "") ||
    !GOOGLE_NONCE_HASH_PATTERN.test(
      authorizationUrl.searchParams.get("nonce") ?? "",
    ) ||
    !TOKEN_PATTERN.test(
      authorizationUrl.searchParams.get("code_challenge") ?? "",
    )
  ) {
    logOAuthDiagnostic("authorization_url_validation", null, "invalid_url", {
      authorizationUrl: true,
      requiredParameters: false,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_invalid_authorization_url",
      "Google Sign-In returned an invalid authorization request.",
    );
  }

  let browserResult: WebBrowser.WebBrowserAuthSessionResult;
  let browserTimeout: ReturnType<typeof setTimeout> | undefined;
  try {
    browserResult = await Promise.race([
      WebBrowser.openAuthSessionAsync(
        authorizationUrl.toString(),
        APP_REDIRECT_URI,
      ),
      new Promise<never>((_, reject) => {
        browserTimeout = setTimeout(
          () =>
            {
              WebBrowser.dismissAuthSession();
              reject(
                new GoogleAuthenticationError(
                  "google_oauth_timeout",
                  "Google Sign-In took too long. Please try again.",
                ),
              );
            },
          BROWSER_AUTH_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (error: unknown) {
    if (error instanceof GoogleAuthenticationError) {
      logOAuthDiagnostic("browser_session", null, error.code, {
        authorizationUrl: true,
        returnUrl: true,
      });
      throw error;
    }
    logOAuthDiagnostic("browser_session", null, "browser_error", {
      authorizationUrl: true,
      returnUrl: true,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_browser_failed",
      "Unable to open Google Sign-In. Please try again.",
    );
  } finally {
    if (browserTimeout !== undefined) clearTimeout(browserTimeout);
  }

  logOAuthDiagnostic(
    "browser_session",
    null,
    browserResult.type,
    { url: browserResult.type === "success" && Boolean(browserResult.url) },
  );
  if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
    throw new GoogleAuthenticationError(
      "google_sign_in_cancelled",
      "Google Sign-In was cancelled.",
    );
  }
  if (browserResult.type !== "success") {
    throw new GoogleAuthenticationError(
      "google_oauth_browser_failed",
      "Unable to complete Google Sign-In. Please try again.",
    );
  }

  const ticket = parseCallback(browserResult.url);
  let redeemData: RedeemResponse | null;
  try {
    redeemData = await postJson<RedeemResponse>(
      `${brokerBaseUrl}/oauth/redeem`,
      { ticket, verifier },
      "oauth_redeem",
      ["idToken", "nonce"],
    );
  } catch (error: unknown) {
    throw getBrokerFailure(error, "google_oauth_ticket_invalid");
  }

  if (
    typeof redeemData?.idToken !== "string" ||
    redeemData.idToken.split(".").length !== 3 ||
    redeemData.idToken.split(".").some((part) => part.length === 0) ||
    typeof redeemData.nonce !== "string" ||
    !TOKEN_PATTERN.test(redeemData.nonce)
  ) {
    logOAuthDiagnostic("oauth_redeem", 200, "invalid_id_token_shape", {
      idToken: typeof redeemData?.idToken === "string" &&
        redeemData.idToken.length > 0,
      nonce: typeof redeemData?.nonce === "string" &&
        Boolean(redeemData.nonce),
      threeSegments: typeof redeemData?.idToken === "string" &&
        redeemData.idToken.split(".").length === 3,
    });
    throw new GoogleAuthenticationError(
      "google_oauth_ticket_invalid",
      "Google Sign-In expired or could not be verified. Please try again.",
    );
  }

  logOAuthDiagnostic("oauth_redeem", 200, "id_token_received", {
    idToken: true,
    nonce: true,
  });
  logNonceDiagnostic("nonce_mobile_handoff", {
    encoding: "original",
    nonceLength: redeemData.nonce.length,
    matchesExpectedLength: redeemData.nonce.length === 43,
  });
  return { idToken: redeemData.idToken, nonce: redeemData.nonce };
};
