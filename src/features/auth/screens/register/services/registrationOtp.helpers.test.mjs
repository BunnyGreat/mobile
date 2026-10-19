import assert from "node:assert/strict";
import test from "node:test";
import {
  createRegistrationOtpRequestBody,
  createRegistrationOtpVerificationBody,
  getDuplicateFirebaseEmailMessage,
  getOtpFunctionErrorDiagnostics,
  getOtpFunctionErrorMessage,
  isDuplicateFirebaseEmailError,
  parseRegistrationOtpChallenge,
  parseRegistrationOtpVerification,
} from "./registrationOtp.helpers.ts";
import { validateRegistrationCredentials } from "../schema/register.schema.ts";

test("builds the request payload expected by the send-otp Edge Function", () => {
  assert.deepEqual(
    createRegistrationOtpRequestBody("resident@example.com", "password"),
    {
      action: "request",
      email: "resident@example.com",
      authMethod: "password",
    },
  );
  assert.deepEqual(
    createRegistrationOtpVerificationBody(
      "resident@example.com",
      "6e2a1264-a813-4d44-8c77-74c7a523a04e",
      "012345",
      "password",
    ),
    {
      action: "verify",
      email: "resident@example.com",
      challengeId: "6e2a1264-a813-4d44-8c77-74c7a523a04e",
      otp: "012345",
      authMethod: "password",
    },
  );
});

test("validates registration email and matching password credentials", () => {
  const valid = validateRegistrationCredentials({
    email: "resident@example.com",
    password: "Resident123!",
    confirmPassword: "Resident123!",
  });
  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.errors, {
    email: "",
    password: "",
    confirmPassword: "",
  });

  const mismatch = validateRegistrationCredentials({
    email: "resident@example.com",
    password: "Resident123!",
    confirmPassword: "Resident123?",
  });
  assert.equal(mismatch.isValid, false);
  assert.match(mismatch.errors.confirmPassword, /do not match/i);

  const invalid = validateRegistrationCredentials({
    email: "invalid",
    password: "weak",
    confirmPassword: "weak",
  });
  assert.equal(invalid.isValid, false);
  assert.match(invalid.errors.email, /valid email/i);
  assert.match(invalid.errors.password, /at least 8/i);
});

test("parses a successful OTP request response", () => {
  const createdAt = Date.now();
  const result = parseRegistrationOtpChallenge(
    {
      success: true,
      challengeId: "6e2a1264-a813-4d44-8c77-74c7a523a04e",
      expiresAt: new Date(createdAt + 60_000).toISOString(),
    },
    createdAt,
  );
  assert.equal(result.challengeId, "6e2a1264-a813-4d44-8c77-74c7a523a04e");
  assert.ok(result.expiresAt > createdAt);
});

test("rejects invalid OTP request responses and expired challenges", () => {
  assert.throws(
    () => parseRegistrationOtpChallenge({ success: false }, Date.now()),
    /invalid response/i,
  );
  const createdAt = Date.now();
  assert.throws(
    () =>
      parseRegistrationOtpChallenge(
        {
          success: true,
          challengeId: "6e2a1264-a813-4d44-8c77-74c7a523a04e",
          expiresAt: new Date(createdAt - 1).toISOString(),
        },
        createdAt,
      ),
    /expiry time/i,
  );
});

test("keeps duplicate-account details behind successful OTP verification", () => {
  assert.deepEqual(
    parseRegistrationOtpVerification(
      {
        success: true,
        authMethod: "password",
        emailAvailable: false,
      },
      "password",
    ),
    { valid: true, emailAvailable: false },
  );
  assert.deepEqual(
    parseRegistrationOtpVerification(
      { success: false, code: "INVALID_OTP" },
      "password",
    ),
    { valid: false, reason: "invalid-code" },
  );
});

test("classifies the deployed legacy OTP contract as a service update requirement", async () => {
  const response = {
    status: 400,
    clone() {
      return {
        json: async () => ({
          success: false,
          error: "Invalid OTP format.",
        }),
      };
    },
  };
  const diagnostics = await getOtpFunctionErrorDiagnostics(
    { name: "FunctionsHttpError", context: response },
    "send",
  );
  assert.equal(diagnostics.status, 400);
  assert.equal(diagnostics.code, "STALE_FUNCTION_CONTRACT");
  assert.match(
    getOtpFunctionErrorMessage(diagnostics, "send"),
    /service update/i,
  );
});

test("distinguishes confirmed network errors from unspecified request failures", async () => {
  const networkDiagnostics = await getOtpFunctionErrorDiagnostics(
    {
      name: "FunctionsFetchError",
      context: { name: "TypeError", message: "Network request failed" },
    },
    "send",
  );
  assert.equal(networkDiagnostics.category, "NETWORK_FAILURE");
  assert.match(
    getOtpFunctionErrorMessage(networkDiagnostics, "send"),
    /network problem/i,
  );

  const unknownDiagnostics = await getOtpFunctionErrorDiagnostics(
    { name: "FunctionsFetchError", context: {} },
    "send",
  );
  assert.equal(unknownDiagnostics.category, "REQUEST_FAILURE");
  assert.doesNotMatch(
    getOtpFunctionErrorMessage(unknownDiagnostics, "send"),
    /network|connection/i,
  );
});

test("classifies HTTP server failures without surfacing raw server text", async () => {
  const diagnostics = await getOtpFunctionErrorDiagnostics(
    {
      name: "FunctionsHttpError",
      context: {
        status: 500,
        clone() {
          return {
            json: async () => ({
              error: "Sensitive server internals",
            }),
          };
        },
      },
    },
    "verify",
  );
  assert.equal(diagnostics.category, "SERVICE_FAILURE");
  assert.equal(
    getOtpFunctionErrorMessage(diagnostics, "verify"),
    "Email verification is temporarily unavailable. Please try again later.",
  );
});

test("reports unavailable registration email without treating it as a network failure", async () => {
  const diagnostics = await getOtpFunctionErrorDiagnostics(
    {
      name: "FunctionsHttpError",
      context: {
        status: 409,
        clone() {
          return {
            json: async () => ({
              success: false,
              code: "EMAIL_ALREADY_REGISTERED",
              error:
                "This email is already registered. Please sign in or use another email address.",
            }),
          };
        },
      },
    },
    "send",
  );

  assert.equal(diagnostics.category, "DUPLICATE_EMAIL");
  assert.equal(diagnostics.code, "EMAIL_ALREADY_REGISTERED");
  assert.match(
    getOtpFunctionErrorMessage(diagnostics, "send"),
    /already registered/i,
  );
  assert.doesNotMatch(
    getOtpFunctionErrorMessage(diagnostics, "send"),
    /network|connection/i,
  );
});

test("recognizes final Firebase duplicate-email errors", () => {
  assert.equal(
    isDuplicateFirebaseEmailError({
      code: "auth/email-already-in-use",
    }),
    true,
  );
  assert.equal(
    isDuplicateFirebaseEmailError({ code: "auth/network-error" }),
    false,
  );
  assert.match(getDuplicateFirebaseEmailMessage(), /already registered/i);
});
