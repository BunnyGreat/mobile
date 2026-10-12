const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const Module = require("node:module");
const ts = require("typescript");

const root = join(__dirname, "..", "..", "..");
const servicesRoot = join(root, "src", "features", "auth", "services");
const firebaseRoot = join(root, "src", "services", "firebase");
const supabaseAuthPath = join(root, "src", "services", "supabase", "auth.service.ts");

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

const createResidentAuthHarness = ({
  userDocument,
  firebaseUser,
  supabaseResult = { error: null },
}) => {
  const calls = { firebase: 0, supabase: 0 };
  const firestore = {
    doc: (_db, collection, uid) => ({ collection, uid }),
    getDoc: async () => userDocument,
  };
  const errors = loadTypeScriptModule(
    join(firebaseRoot, "googleAuthenticationError.ts"),
  );
  const firebaseAuth = {
    GoogleAuthenticationError: errors.GoogleAuthenticationError,
    signInWithGoogleFirebase: async () => {
      calls.firebase += 1;
      return {
        user: firebaseUser,
        googleIdToken: "verified-google-id-token",
        supabaseNonce: "verified-oauth-nonce",
      };
    },
  };
  const supabaseAuth = {
    supabaseSignInWithGoogleIdToken: async (idToken, nonce) => {
      calls.supabase += 1;
      assert.equal(idToken, "verified-google-id-token");
      assert.equal(nonce, "verified-oauth-nonce");
      return supabaseResult;
    },
  };
  const profilePhoto = { resolveProfilePhotoUrl: async () => null };
  const { authenticateGoogleResident } = loadTypeScriptModule(
    join(servicesRoot, "google-auth.service.ts"),
    {
      "firebase/firestore": firestore,
      "../../../services/firebase/firebase": { db: {} },
      "../../../services/firebase/auth": firebaseAuth,
      "../../../services/supabase/auth.service": supabaseAuth,
      "../../profile/services/profilePhoto.service": profilePhoto,
    },
  );
  return { authenticateGoogleResident, calls };
};

const resident = {
  uid: "firebase-resident-uid",
  email: "resident@example.test",
  emailVerified: true,
  photoURL: null,
};

test("a Firebase-authenticated new Google account continues to registration", async () => {
  const harness = createResidentAuthHarness({
    firebaseUser: resident,
    userDocument: { exists: () => false },
  });
  const result = await harness.authenticateGoogleResident();

  assert.deepEqual(result, {
    type: "new-registration",
    email: "resident@example.test",
    firebaseUid: "firebase-resident-uid",
  });
  assert.equal(harness.calls.firebase, 1);
  assert.equal(harness.calls.supabase, 1);
});

test("approved Google residents retain the existing sign-in route and secondary session", async () => {
  const harness = createResidentAuthHarness({
    firebaseUser: resident,
    userDocument: {
      exists: () => true,
      data: () => ({
        status: "approved",
        role: "resident",
        personalInformation: { firstName: "Resident", lastName: "User" },
      }),
    },
  });
  const result = await harness.authenticateGoogleResident();

  assert.equal(result.type, "resident");
  assert.equal(result.user.uid, "firebase-resident-uid");
  assert.equal(result.user.status, "approved");
  assert.equal(harness.calls.supabase, 1);
});

test("an existing approved Firebase resident keeps their account when Supabase rejects Google sign-in", async () => {
  const sensitiveToken = "eyJabcdefghijk.eyJabcdefghijk.signaturevalue";
  const harness = createResidentAuthHarness({
    firebaseUser: resident,
    userDocument: {
      exists: () => true,
      data: () => ({
        status: "approved",
        role: "resident",
        personalInformation: { firstName: "Resident", lastName: "User" },
      }),
    },
    supabaseResult: {
      error: {
        code: "invalid_grant",
        status: 400,
        message: `Google token rejected: ${sensitiveToken}; refresh_token=secret-refresh-value`,
      },
    },
  });
  const originalError = console.error;
  const diagnostics = [];
  console.error = (...args) => diagnostics.push(args.join(" "));

  try {
    await assert.rejects(
      harness.authenticateGoogleResident(),
      /Unable to sign into the storage service with Google/,
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(harness.calls.firebase, 1);
  assert.equal(harness.calls.supabase, 1);
  const logs = diagnostics.join("\n");
  assert.match(logs, /"stage":"supabase_google_id_token"/);
  assert.match(logs, /"code":"invalid_grant"/);
  assert.match(logs, /"status":400/);
  assert.match(logs, /Google token rejected/);
  assert.doesNotMatch(logs, /eyJabcdefghijk|signaturevalue|secret-refresh-value/);
});

test("pending and rejected Google residents are not promoted into approved login", async () => {
  for (const status of ["pending", "rejected"]) {
    const harness = createResidentAuthHarness({
      firebaseUser: resident,
      userDocument: {
        exists: () => true,
        data: () => ({ status, role: "resident", personalInformation: {} }),
      },
    });
    const result = await harness.authenticateGoogleResident();

    assert.equal(result.type, "resident");
    assert.equal(result.user.status, status);
    assert.equal(harness.calls.supabase, 0);
  }
});

test("Supabase receives the original OAuth nonce alongside the Google ID token", async () => {
  const credentials = [];
  const { supabaseSignInWithGoogleIdToken } = loadTypeScriptModule(
    supabaseAuthPath,
    {
      "./supabase": {
        supabase: {
          auth: {
            signInWithIdToken: async (input) => {
              credentials.push(input);
              return {
                data: { session: { access_token: "session" } },
                error: null,
              };
            },
          },
        },
      },
    },
  );

  const result = await supabaseSignInWithGoogleIdToken(
    "google-id-token",
    "original-oauth-nonce",
  );

  assert.equal(result.error, undefined);
  assert.deepEqual(credentials[0], {
    provider: "google",
    token: "google-id-token",
    nonce: "original-oauth-nonce",
  });

  await supabaseSignInWithGoogleIdToken("native-google-id-token");
  assert.deepEqual(credentials[1], {
    provider: "google",
    token: "native-google-id-token",
  });
});
