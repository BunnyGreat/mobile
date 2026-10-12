const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test, beforeEach, afterEach } = require("node:test");
const Module = require("node:module");
const ts = require("typescript");

const root = join(__dirname, "..", "..", "..");
const authRoot = join(root, "src", "services", "firebase");
const unavailableCode = "PLAY_SERVICES_NOT_AVAILABLE";
const testNonce = "N".repeat(43);
const workerOrigin =
  "https://barangay-google-oauth.nadurajohnlloyd8.workers.dev";
const originalFetch = global.fetch;
const originalSetTimeout = global.setTimeout;
const originalConsoleInfo = console.info;
const originalEndpoint = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL;
const originalModuleLoad = Module._load;
let browserOpenCount;
let browserResult;
let dismissCount;
let requestBodies;
let diagnosticLogs;
let fallback;
let GoogleAuthenticationError;

const loadTypeScriptModule = (path, mockedImports = {}) => {
  const loadedModule = new Module(path, module);
  loadedModule.filename = path;
  loadedModule.paths = Module._nodeModulePaths(join(path, ".."));
  const originalRequire = loadedModule.require.bind(loadedModule);
  loadedModule.require = (request) =>
    Object.prototype.hasOwnProperty.call(mockedImports, request)
      ? mockedImports[request]
      : originalRequire(request);
  loadedModule._compile(
    ts.transpile(readFileSync(path, "utf8"), {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    }),
    path,
  );
  return loadedModule.exports;
};

const playServicesError = loadTypeScriptModule(
  join(authRoot, "googlePlayServicesError.ts"),
);
const authErrors = loadTypeScriptModule(
  join(authRoot, "googleAuthenticationError.ts"),
);
const classify = (error) =>
  playServicesError.isGooglePlayServicesUnavailableError(
    error,
    unavailableCode,
  );

beforeEach(() => {
  browserOpenCount = 0;
  browserResult = { type: "cancel" };
  dismissCount = 0;
  requestBodies = [];
  diagnosticLogs = [];
  console.info = (...args) => diagnosticLogs.push(args.join(" "));
  process.env.EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL = workerOrigin;
  const crypto = {
    getRandomBytesAsync: async (length) => new Uint8Array(length).fill(7),
    digestStringAsync: async (_algorithm, value) =>
      createHash("sha256").update(value).digest("base64"),
    CryptoDigestAlgorithm: { SHA256: "SHA-256" },
    CryptoEncoding: { BASE64: "base64" },
  };
  const browser = {
    openAuthSessionAsync: async () => {
      browserOpenCount += 1;
      return browserResult;
    },
    dismissAuthSession: () => {
      dismissCount += 1;
    },
  };
  const config = { getGoogleWebClientId: () => "web-client-id" };

  Module._load = function (request, parent, isMain) {
    if (request === "expo-crypto") return crypto;
    if (request === "expo-web-browser") return browser;
    if (
      request === "./googleOAuthConfig" &&
      parent?.filename?.endsWith("googleOAuthFallback.ts")
    ) {
      return config;
    }
    if (
      request === "./googleAuthenticationError" &&
      parent?.filename?.endsWith("googleOAuthFallback.ts")
    ) {
      return authErrors;
    }
    return originalModuleLoad.call(this, request, parent, isMain);
  };

  const fallbackPath = join(authRoot, "googleOAuthFallback.ts");
  const exports = loadTypeScriptModule(fallbackPath);
  fallback = exports.signInWithGoogleBrowserFallback;
  GoogleAuthenticationError = authErrors.GoogleAuthenticationError;
});

afterEach(() => {
  global.fetch = originalFetch;
  global.setTimeout = originalSetTimeout;
  console.info = originalConsoleInfo;
  Module._load = originalModuleLoad;
  if (originalEndpoint === undefined) {
    delete process.env.EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL;
  } else {
    process.env.EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL = originalEndpoint;
  }
});

test("recognizes the installed native Play Services error code", () => {
  assert.equal(classify({ code: unavailableCode }), true);
});

test("recognizes SERVICE_INVALID and the installed native status-9 diagnostic", () => {
  assert.equal(classify({ code: "SERVICE_INVALID" }), true);
  assert.equal(
    classify({ code: "9", message: "Google Play Services status code 9" }),
    true,
  );
  assert.equal(
    classify({ code: "12500", message: "Google Play Services: SERVICE_INVALID" }),
    true,
  );
  assert.equal(
    classify({
      code: unavailableCode,
      message: "Google Play Services are not available (status=9)",
    }),
    true,
  );
  assert.equal(
    classify({
      code: unavailableCode,
      message:
        "Google Play Services status code: 9\nGoogle Play Services status: SERVICE_INVALID",
    }),
    true,
  );
});

test("does not classify cancellation or unrelated failures for fallback", () => {
  assert.equal(classify({ code: "SIGN_IN_CANCELLED" }), false);
  assert.equal(classify({ code: "auth/invalid-credential" }), false);
  assert.equal(classify({ code: "9", message: "Unrelated status=9" }), false);
  assert.equal(classify({ code: "9", message: "SERVICE_INVALID" }), false);
});

test("opens the browser session after the broker returns a valid authorization URL", async () => {
  global.fetch = async (_url, options) => {
    requestBodies.push(JSON.parse(options.body));
    return new Response(JSON.stringify({
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
          client_id: "web-client-id",
          redirect_uri: `${workerOrigin}/oauth/callback`,
          response_type: "code",
          scope: "openid email profile",
          response_mode: "form_post",
          state: "A".repeat(43),
          nonce: "b".repeat(64),
          code_challenge: "C".repeat(43),
          code_challenge_method: "S256",
        }),
    }), { status: 200 });
  };

  await assert.rejects(fallback(), (error) =>
    error instanceof GoogleAuthenticationError &&
    error.code === "google_sign_in_cancelled",
  );
  assert.equal(browserOpenCount, 1);
  assert.deepEqual(requestBodies.map((body) => Object.keys(body)), [
    ["appChallenge"],
  ]);
});

test("a successful browser callback redeems one ticket and returns one ID token", async () => {
  const ticket = "T".repeat(43);
  browserResult = {
    type: "success",
    url: `barangay://oauth/google?ticket=${ticket}`,
  };
  global.fetch = async (url, options) => {
    requestBodies.push(JSON.parse(options.body));
    if (String(url).endsWith("/oauth/start")) {
      return new Response(JSON.stringify({
        authorizationUrl:
          "https://accounts.google.com/o/oauth2/v2/auth?" +
          new URLSearchParams({
            client_id: "web-client-id",
            redirect_uri: `${workerOrigin}/oauth/callback`,
            response_type: "code",
            scope: "openid email profile",
            response_mode: "form_post",
            state: "A".repeat(43),
            nonce: "b".repeat(64),
            code_challenge: "C".repeat(43),
            code_challenge_method: "S256",
          }),
      }), { status: 200 });
    }
    return new Response(JSON.stringify({
      idToken: "header.payload.signature",
      nonce: testNonce,
    }), { status: 200 });
  };

  assert.deepEqual(await fallback(), {
    idToken: "header.payload.signature",
    nonce: testNonce,
  });
  assert.equal(browserOpenCount, 1);
  assert.deepEqual(requestBodies.map((body) => Object.keys(body)), [
    ["appChallenge"],
    ["ticket", "verifier"],
  ]);
  assert.equal(requestBodies[1].ticket, ticket);
  const logs = diagnosticLogs.join("\n");
  assert.match(logs, /"stage":"oauth_start"/);
  assert.match(logs, /"stage":"browser_session"/);
  assert.match(logs, /"stage":"callback_parse"/);
  assert.match(logs, /"stage":"oauth_redeem"/);
  assert.match(logs, /"stage":"nonce_mobile_handoff"/);
  assert.match(logs, /"nonceLength":43/);
  assert.match(logs, /"category":"id_token_received"/);
  assert.doesNotMatch(logs, new RegExp(ticket));
  assert.doesNotMatch(logs, /header\.payload\.signature/);
  assert.doesNotMatch(logs, new RegExp(testNonce));
  assert.doesNotMatch(logs, new RegExp("07".repeat(32)));
});

test("Worker callback failure redirect is reported as OAuth failure, not malformed response", async () => {
  browserResult = {
    type: "success",
    url: "barangay://oauth/google?error=oauth_failed",
  };
  global.fetch = async () =>
    new Response(JSON.stringify({
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
          client_id: "web-client-id",
          redirect_uri: `${workerOrigin}/oauth/callback`,
          response_type: "code",
          scope: "openid email profile",
          response_mode: "form_post",
          state: "A".repeat(43),
          nonce: "b".repeat(64),
          code_challenge: "C".repeat(43),
          code_challenge_method: "S256",
        }),
    }), { status: 200 });

  await assert.rejects(fallback(), (error) =>
    error instanceof GoogleAuthenticationError &&
    error.code === "google_oauth_callback_failed" &&
    /could not complete sign-in/i.test(error.message),
  );
  assert.equal(browserOpenCount, 1);
});

test("safe Worker callback failure categories map to specific retry guidance", async () => {
  const cases = [
    ["authorization_failed", "google_oauth_authorization_failed"],
    ["attempt_expired", "google_oauth_attempt_expired"],
    ["callback_invalid", "google_oauth_invalid_callback"],
    ["callback_failed", "google_oauth_callback_failed"],
    ["identity_rejected", "google_oauth_identity_rejected"],
    ["rate_limited", "google_oauth_rate_limited"],
    ["ticket_store_failed", "google_oauth_ticket_failed"],
    ["token_exchange_failed", "google_oauth_exchange_failed"],
    ["token_response_invalid", "google_oauth_exchange_failed"],
  ];

  global.fetch = async () =>
    new Response(JSON.stringify({
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
          client_id: "web-client-id",
          redirect_uri: `${workerOrigin}/oauth/callback`,
          response_type: "code",
          scope: "openid email profile",
          response_mode: "form_post",
          state: "A".repeat(43),
          nonce: "b".repeat(64),
          code_challenge: "C".repeat(43),
          code_challenge_method: "S256",
        }),
    }), { status: 200 });

  for (const [callbackError, expectedCode] of cases) {
    browserResult = {
      type: "success",
      url: `barangay://oauth/google?error=${callbackError}`,
    };
    await assert.rejects(fallback(), (error) =>
      error instanceof GoogleAuthenticationError &&
      error.code === expectedCode,
    );
  }
  assert.equal(browserOpenCount, cases.length);
});

test("browser cancellation allows a later sign-in retry", async () => {
  global.fetch = async () =>
    new Response(JSON.stringify({
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
          client_id: "web-client-id",
          redirect_uri: `${workerOrigin}/oauth/callback`,
          response_type: "code",
          scope: "openid email profile",
          response_mode: "form_post",
          state: "A".repeat(43),
          nonce: "b".repeat(64),
          code_challenge: "C".repeat(43),
          code_challenge_method: "S256",
        }),
    }), { status: 200 });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await assert.rejects(fallback(), (error) =>
      error instanceof GoogleAuthenticationError &&
      error.code === "google_sign_in_cancelled",
    );
  }
  assert.equal(browserOpenCount, 2);
});

test("browser timeout dismisses the auth session and reports a retryable error", async () => {
  browserResult = new Promise(() => {});
  global.fetch = async () =>
    new Response(JSON.stringify({
      authorizationUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
          client_id: "web-client-id",
          redirect_uri: `${workerOrigin}/oauth/callback`,
          response_type: "code",
          scope: "openid email profile",
          response_mode: "form_post",
          state: "A".repeat(43),
          nonce: "b".repeat(64),
          code_challenge: "C".repeat(43),
          code_challenge_method: "S256",
        }),
    }), { status: 200 });
  const realSetTimeout = global.setTimeout;
  global.setTimeout = (callback, delay, ...args) =>
    realSetTimeout(callback, delay === 120000 ? 0 : delay, ...args);

  await assert.rejects(fallback(), (error) =>
    error instanceof GoogleAuthenticationError &&
    error.code === "google_oauth_timeout",
  );
  assert.equal(browserOpenCount, 1);
  assert.equal(dismissCount, 1);
});

test("shows a clear service-unavailable error when the broker cannot be reached", async () => {
  global.fetch = async () => {
    throw new TypeError("Network request failed");
  };

  await assert.rejects(fallback(), (error) =>
    error instanceof GoogleAuthenticationError &&
    error.code === "google_oauth_start_failed" &&
    /service is temporarily unavailable/i.test(error.message),
  );
  assert.equal(browserOpenCount, 0);
});

test("rejects a missing broker URL without opening a browser session", async () => {
  delete process.env.EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL;

  await assert.rejects(fallback(), (error) =>
    error instanceof GoogleAuthenticationError &&
    error.code === "google_oauth_not_configured" &&
    /not configured/i.test(error.message),
  );
  assert.equal(browserOpenCount, 0);
});
