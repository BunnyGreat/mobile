const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const Module = require("node:module");
const ts = require("typescript");

const root = join(__dirname, "..", "..", "..");
const authRoot = join(root, "src", "services", "firebase");
const authErrors = loadTypeScriptModule(
  join(authRoot, "googleAuthenticationError.ts"),
);
const playServicesError = loadTypeScriptModule(
  join(authRoot, "googlePlayServicesError.ts"),
);

function loadTypeScriptModule(path, mockedImports = {}) {
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
}

const createHarness = ({
  platform = "android",
  availabilityError,
  signInError,
  browserError,
  signInResponse = {
    type: "success",
    data: {
      user: {
        id: "native-google-user-id",
        name: "Resident",
        email: "resident@example.test",
        photo: null,
        familyName: null,
        givenName: null,
      },
      scopes: [],
      idToken: "native-google-id-token",
      serverAuthCode: null,
    },
  },
  firebaseError,
} = {}) => {
  const counts = {
    hasPlayServices: 0,
    signOut: 0,
    signIn: 0,
    firebase: 0,
    browser: 0,
    playServicesOptions: [],
  };
  const user = {
    email: "resident@example.test",
    emailVerified: true,
    providerData: [{ providerId: "google.com" }],
  };
  const GoogleSignin = {
    configure: () => {},
    hasPlayServices: async (options) => {
      counts.hasPlayServices += 1;
      counts.playServicesOptions.push(options);
      if (availabilityError) throw availabilityError;
      return true;
    },
    signOut: async () => {
      counts.signOut += 1;
    },
    signIn: async () => {
      counts.signIn += 1;
      if (signInError) throw signInError;
      return signInResponse;
    },
  };
  const firebaseAuth = {
    GoogleAuthProvider: {
      credential: (idToken) => ({ idToken }),
    },
    signInWithCredential: async (_auth, credential) => {
      counts.firebase += 1;
      if (firebaseError) throw firebaseError;
      return {
        user: {
          ...user,
          firebaseCredentialToken: credential.idToken,
        },
      };
    },
  };
  const mockedImports = {
    "firebase/auth": firebaseAuth,
    "@react-native-google-signin/google-signin": {
      GoogleSignin,
      statusCodes: {
        SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
        PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
      },
    },
    "react-native": { Platform: { OS: platform } },
    "./firebase": { auth: {} },
    "./googleAuthenticationError": authErrors,
    "./googleOAuthConfig": { getGoogleWebClientId: () => "web-client-id" },
    "./googleOAuthFallback": {
      signInWithGoogleBrowserFallback: async () => {
        counts.browser += 1;
        if (browserError) throw browserError;
        return {
          idToken: "browser-google-id-token",
          nonce: "browser-oauth-nonce",
        };
      },
    },
    "./googlePlayServicesError": playServicesError,
  };
  const { signInWithGoogleFirebase } = loadTypeScriptModule(
    join(authRoot, "auth.ts"),
    mockedImports,
  );
  return { counts, signInWithGoogleFirebase };
};

test("certified-device native sign-in remains primary and reaches Firebase", async () => {
  const harness = createHarness();
  const result = await harness.signInWithGoogleFirebase();

  assert.equal(result.googleIdToken, "native-google-id-token");
  assert.equal(result.supabaseNonce, undefined);
  assert.equal(harness.counts.browser, 0);
  assert.equal(harness.counts.signIn, 1);
  assert.equal(harness.counts.firebase, 1);
  assert.deepEqual(harness.counts.playServicesOptions, [
    { showPlayServicesUpdateDialog: false },
  ]);
});

test("uncertified-device availability status 9 invokes browser and Firebase", async () => {
  const harness = createHarness({
    availabilityError: {
      code: "PLAY_SERVICES_NOT_AVAILABLE",
      message: "Google Play Services are not available (status=9)",
    },
  });
  const result = await harness.signInWithGoogleFirebase();

  assert.equal(result.googleIdToken, "browser-google-id-token");
  assert.equal(result.supabaseNonce, "browser-oauth-nonce");
  assert.equal(result.user.firebaseCredentialToken, "browser-google-id-token");
  assert.equal(harness.counts.browser, 1);
  assert.equal(harness.counts.signIn, 0);
  assert.equal(harness.counts.firebase, 1);
  assert.deepEqual(harness.counts.playServicesOptions, [
    { showPlayServicesUpdateDialog: false },
  ]);
});

test("browser OAuth errors are preserved instead of replaced with native Play Services errors", async () => {
  const browserError = new authErrors.GoogleAuthenticationError(
    "google_oauth_callback_failed",
    "Google authorization failed.",
  );
  const harness = createHarness({
    availabilityError: {
      code: "PLAY_SERVICES_NOT_AVAILABLE",
      message: "Google Play Services are not available (status=9)",
    },
    browserError,
  });

  await assert.rejects(
    harness.signInWithGoogleFirebase(),
    (error) => error === browserError,
  );
  assert.equal(harness.counts.browser, 1);
  assert.equal(harness.counts.firebase, 0);
});

test("SERVICE_INVALID from native sign-in invokes browser fallback", async () => {
  const harness = createHarness({
    signInError: {
      code: "SERVICE_INVALID",
      message: "Google Play Services rejected this device",
    },
  });
  const result = await harness.signInWithGoogleFirebase();

  assert.equal(result.googleIdToken, "browser-google-id-token");
  assert.equal(result.supabaseNonce, "browser-oauth-nonce");
  assert.equal(harness.counts.browser, 1);
  assert.equal(harness.counts.firebase, 1);
});

test("user cancellation does not invoke browser fallback", async () => {
  const harness = createHarness({
    signInResponse: { type: "cancelled", data: null },
  });

  await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
    error instanceof authErrors.GoogleAuthenticationError &&
    error.code === "google_sign_in_cancelled",
  );
  assert.equal(harness.counts.browser, 0);
  assert.equal(harness.counts.firebase, 0);
});

test("unrelated native and network errors do not invoke browser fallback", async () => {
  const harness = createHarness({
    availabilityError: new TypeError("Network request failed"),
  });

  await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
    error instanceof authErrors.GoogleAuthenticationError &&
    error.code === "google_sign_in_failed",
  );
  assert.equal(harness.counts.browser, 0);
  assert.equal(harness.counts.signIn, 0);
});

test("native sign-in failures log the stage and safe provider code only", async () => {
  const harness = createHarness({
    signInError: {
      code: "DEVELOPER_ERROR",
      message: "authorization token=must-not-be-logged",
    },
  });
  const originalError = console.error;
  const diagnostics = [];
  console.error = (...args) => diagnostics.push(args.join(" "));
  try {
    await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
      error instanceof authErrors.GoogleAuthenticationError &&
      error.code === "google_sign_in_failed",
    );
  } finally {
    console.error = originalError;
  }

  const log = diagnostics.join("\n");
  assert.match(log, /"stage":"native_sign_in"/);
  assert.match(log, /"errorCode":"DEVELOPER_ERROR"/);
  assert.doesNotMatch(log, /must-not-be-logged|native-google-id-token|eyJ/);
  assert.equal(harness.counts.browser, 0);
});

test("native account selection logs token presence without account data or token values", async () => {
  const harness = createHarness({
    firebaseError: { code: "auth/invalid-credential" },
  });
  const originalInfo = console.info;
  const originalError = console.error;
  const diagnostics = [];
  console.info = (...args) => diagnostics.push(args.join(" "));
  console.error = (...args) => diagnostics.push(args.join(" "));
  try {
    await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
      error instanceof authErrors.GoogleAuthenticationError &&
      error.code === "google_firebase_token_rejected",
    );
  } finally {
    console.info = originalInfo;
    console.error = originalError;
  }

  const log = diagnostics.join("\n");
  assert.match(log, /"stage":"native_sign_in","status":null,"category":"account_selected"/);
  assert.match(log, /"idToken":true/);
  assert.match(log, /"stage":"firebase_credential_exchange","status":null,"category":"started"/);
  assert.match(log, /"stage":"firebase_auth","status":null,"category":"token_rejected"/);
  assert.match(log, /"errorCode":"auth\/invalid-credential"/);
  assert.doesNotMatch(
    log,
    /native-google-id-token|native-google-user-id|resident@example\.test|eyJ[A-Za-z0-9_-]+\./,
  );
  assert.equal(harness.counts.browser, 0);
});

test("missing native ID token is logged without invoking the browser fallback", async () => {
  const harness = createHarness({
    signInResponse: {
      type: "success",
      data: {
        user: { id: "native-google-user-id", email: "resident@example.test" },
        idToken: null,
      },
    },
  });
  const originalInfo = console.info;
  const originalError = console.error;
  const diagnostics = [];
  console.info = (...args) => diagnostics.push(args.join(" "));
  console.error = (...args) => diagnostics.push(args.join(" "));
  try {
    await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
      error instanceof authErrors.GoogleAuthenticationError &&
      error.code === "google_token_missing",
    );
  } finally {
    console.info = originalInfo;
    console.error = originalError;
  }

  const log = diagnostics.join("\n");
  assert.match(log, /"category":"account_selected"/);
  assert.match(log, /"idToken":false/);
  assert.match(log, /"errorCode":"google_token_missing"/);
  assert.doesNotMatch(log, /native-google-user-id|resident@example\.test/);
  assert.equal(harness.counts.firebase, 0);
  assert.equal(harness.counts.browser, 0);
});

test("Firebase credential errors do not re-enter browser fallback", async () => {
  const harness = createHarness({
    firebaseError: { code: "auth/invalid-credential" },
  });

  const originalInfo = console.info;
  const originalError = console.error;
  const diagnostics = [];
  console.info = (...args) => diagnostics.push(args.join(" "));
  console.error = (...args) => diagnostics.push(args.join(" "));
  try {
    await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
      error instanceof authErrors.GoogleAuthenticationError &&
      error.code === "google_firebase_token_rejected",
    );
  } finally {
    console.info = originalInfo;
    console.error = originalError;
  }

  assert.equal(harness.counts.browser, 0);
  assert.equal(harness.counts.signIn, 1);
  assert.equal(harness.counts.firebase, 1);
  const log = diagnostics.join("\n");
  assert.match(log, /"stage":"firebase_auth"/);
  assert.match(log, /"errorCode":"auth\/invalid-credential"/);
  assert.doesNotMatch(log, /native-google-id-token|eyJ[A-Za-z0-9_-]+\./);
});

test("Firebase network errors get a specific retryable message", async () => {
  const harness = createHarness({
    firebaseError: { code: "auth/network-request-failed" },
  });

  await assert.rejects(harness.signInWithGoogleFirebase(), (error) =>
    error instanceof authErrors.GoogleAuthenticationError &&
    error.code === "google_firebase_network_failed",
  );
  assert.equal(harness.counts.browser, 0);
  assert.equal(harness.counts.firebase, 1);
});
