type RegistrationOtpAuthMethod = "password" | "google";

type RegistrationOtpChallenge = {
  challengeId: string;
  createdAt: number;
  expiresAt: number;
};

type RegistrationOtpRequestBody = {
  action: "request";
  email: string;
  authMethod: RegistrationOtpAuthMethod;
};

type RegistrationOtpVerificationBody = {
  action: "verify";
  email: string;
  challengeId: string;
  otp: string;
  authMethod: RegistrationOtpAuthMethod;
};

type RegistrationOtpVerification =
  | { valid: true; emailAvailable: boolean }
  | { valid: false; reason: "invalid-code" };

type OtpRequestAction = "send" | "verify";

type OtpErrorDiagnostics = {
  action: OtpRequestAction;
  category: string;
  status: number | null;
  code: string;
  errorType: string;
  causeType: string;
  causeCode: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFunction = (value: unknown): value is (...args: never[]) => unknown =>
  typeof value === "function";

const getStringProperty = (
  value: unknown,
  property: string,
): string | undefined => {
  if (!isRecord(value)) return undefined;
  const propertyValue = value[property];
  return typeof propertyValue === "string" ? propertyValue : undefined;
};

export const createRegistrationOtpRequestBody = (
  email: string,
  authMethod: RegistrationOtpAuthMethod,
): RegistrationOtpRequestBody => ({
  action: "request",
  email,
  authMethod,
});

export const createRegistrationOtpVerificationBody = (
  email: string,
  challengeId: string,
  otp: string,
  authMethod: RegistrationOtpAuthMethod,
): RegistrationOtpVerificationBody => ({
  action: "verify",
  email,
  challengeId,
  otp,
  authMethod,
});

export const parseRegistrationOtpChallenge = (
  data: unknown,
  createdAt: number,
): RegistrationOtpChallenge => {
  if (
    !isRecord(data) ||
    data.success !== true ||
    typeof data.challengeId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      data.challengeId,
    ) ||
    typeof data.expiresAt !== "string"
  ) {
    throw new Error("The verification service returned an invalid response.");
  }

  const expiresAt = Date.parse(data.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= createdAt) {
    throw new Error("The verification service returned an invalid expiry time.");
  }
  return { challengeId: data.challengeId, createdAt, expiresAt };
};

export const parseRegistrationOtpVerification = (
  data: unknown,
  authMethod: RegistrationOtpAuthMethod,
): RegistrationOtpVerification => {
  if (!isRecord(data) || typeof data.success !== "boolean") {
    throw new Error("The verification service returned an invalid response.");
  }
  if (data.success === false && data.code === "INVALID_OTP") {
    return { valid: false, reason: "invalid-code" };
  }
  if (
    data.success !== true ||
    typeof data.emailAvailable !== "boolean" ||
    data.authMethod !== authMethod
  ) {
    throw new Error("The verification service returned an invalid response.");
  }
  return { valid: true, emailAvailable: data.emailAvailable };
};

const readResponseError = async (
  context: unknown,
): Promise<{ status?: number; code?: string; message?: string }> => {
  if (!isRecord(context)) return {};

  const status = typeof context.status === "number" ? context.status : undefined;
  let responseBody: unknown;
  try {
    const response =
      isFunction(context.clone) ? context.clone() : context;
    if (isRecord(response) && isFunction(response.json)) {
      responseBody = await response.json();
    }
  } catch {
    return { status };
  }

  if (!isRecord(responseBody)) return { status };
  const code =
    typeof responseBody.code === "string" &&
    /^[A-Z0-9_]{1,64}$/.test(responseBody.code)
      ? responseBody.code
      : undefined;
  const message =
    typeof responseBody.error === "string"
      ? responseBody.error
      : typeof responseBody.message === "string"
        ? responseBody.message
        : undefined;
  return { status, code, message };
};

const getCauseCode = (message: string | undefined): string => {
  if (!message) return "UNSPECIFIED";
  if (/network request failed|failed to fetch|networkerror/i.test(message)) {
    return "NETWORK_REQUEST_FAILED";
  }
  if (/enotfound|dns|name not resolved/i.test(message)) {
    return "DNS_LOOKUP_FAILED";
  }
  if (/econnrefused|connection refused/i.test(message)) {
    return "CONNECTION_REFUSED";
  }
  if (/timeout|timed out|aborted/i.test(message)) {
    return "REQUEST_TIMEOUT";
  }
  return "UNCLASSIFIED_FETCH_FAILURE";
};

export const getOtpFunctionErrorDiagnostics = async (
  error: unknown,
  action: OtpRequestAction,
): Promise<OtpErrorDiagnostics> => {
  const context = isRecord(error) ? error.context : undefined;
  const response = await readResponseError(context);
  const errorType = getStringProperty(error, "name") ?? "UnknownError";
  const causeType = getStringProperty(context, "name") ?? "UnknownCause";
  const causeMessage = getStringProperty(context, "message");
  const causeCode = getCauseCode(causeMessage);
  const message = response.message ?? "";
  let category = "SERVICE_FAILURE";
  let code = response.code ?? "SERVICE_FAILURE";

  if (
    response.code === "INVALID_OTP_FORMAT" ||
    /invalid otp format/i.test(message)
  ) {
    category = "STALE_FUNCTION_CONTRACT";
    code = "STALE_FUNCTION_CONTRACT";
  } else if (
    response.code === "EMAIL_ALREADY_REGISTERED" ||
    response.code === "EMAIL_IN_USE"
  ) {
    category = "DUPLICATE_EMAIL";
    code = "EMAIL_ALREADY_REGISTERED";
  } else if (response.status === 429 || response.code === "RATE_LIMITED") {
    category = "RATE_LIMITED";
    code = "RATE_LIMITED";
  } else if (
    response.status === 502 ||
    response.code === "EMAIL_DELIVERY_FAILED"
  ) {
    category = "EMAIL_DELIVERY";
    code = "EMAIL_DELIVERY_FAILED";
  } else if (response.status === 401 || response.status === 403) {
    category = "SERVICE_CONFIGURATION";
    code = "SERVICE_AUTHORIZATION_FAILED";
  } else if (response.status === 404) {
    category = "SERVICE_CONFIGURATION";
    code = "FUNCTION_NOT_FOUND";
  } else if (response.status !== undefined && response.status >= 500) {
    category = "SERVICE_FAILURE";
    code = "FUNCTION_SERVER_ERROR";
  } else if (
    errorType === "FunctionsFetchError" &&
    causeCode !== "UNCLASSIFIED_FETCH_FAILURE" &&
    causeCode !== "UNSPECIFIED"
  ) {
    category = "NETWORK_FAILURE";
    code = causeCode;
  } else if (errorType === "FunctionsFetchError") {
    category = "REQUEST_FAILURE";
    code = "FETCH_FAILED";
  } else if (errorType === "FunctionsRelayError") {
    category = "SERVICE_FAILURE";
    code = "SUPABASE_RELAY_ERROR";
  } else if (response.status !== undefined) {
    category = "REQUEST_FAILURE";
    code = "FUNCTION_REQUEST_REJECTED";
  }

  return {
    action,
    category,
    status: response.status ?? null,
    code,
    errorType,
    causeType,
    causeCode,
  };
};

export const getOtpFunctionErrorMessage = (
  diagnostics: OtpErrorDiagnostics,
  action: OtpRequestAction,
): string => {
  switch (diagnostics.category) {
    case "STALE_FUNCTION_CONTRACT":
      return "Email verification needs a service update. Please try again later.";
    case "DUPLICATE_EMAIL":
      return "This email is already registered. Please sign in or use another email address.";
    case "RATE_LIMITED":
      return "Too many verification attempts. Please wait before trying again.";
    case "EMAIL_DELIVERY":
      return "We couldn't deliver a verification code. Please try again later.";
    case "NETWORK_FAILURE":
      return "A network problem prevented email verification. Check your connection and try again.";
    case "SERVICE_CONFIGURATION":
      return "Email verification is not configured correctly. Please try again later.";
    case "SERVICE_FAILURE":
      return "Email verification is temporarily unavailable. Please try again later.";
    default:
      return action === "send"
        ? "Unable to request a verification code right now. Please try again later."
        : "Unable to verify your email right now. Please try again later.";
  }
};

export const isDuplicateFirebaseEmailError = (error: unknown): boolean =>
  getStringProperty(error, "code") === "auth/email-already-in-use";

export const getDuplicateFirebaseEmailMessage = (): string =>
  "This email is already registered. Please use another email address or log in instead.";
