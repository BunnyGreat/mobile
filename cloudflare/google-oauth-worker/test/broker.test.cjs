const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test, before, after, beforeEach } = require("node:test");
const { DatabaseSync } = require("node:sqlite");
const { createHash, createSign, generateKeyPairSync } = require("node:crypto");
const Module = require("node:module");
const ts = require("typescript");

const workerRoot = join(__dirname, "..");
const workerPath = join(workerRoot, "src", "index.ts");
const migrationPath = join(workerRoot, "migrations", "0001_google_oauth_broker.sql");
const CLIENT_ID = "google-web-client.apps.googleusercontent.com";
const ENCRYPTION_KEY = "test-only-encryption-key-with-at-least-32-characters";
const encode = (value) => Buffer.from(value).toString("base64url");
const token = (header, claims, privateKey) => {
  const signingInput = `${encode(JSON.stringify(header))}.${encode(JSON.stringify(claims))}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(privateKey);
  return `${signingInput}.${signature.toString("base64url")}`;
};

class LocalD1Statement {
  constructor(database, query) {
    this.database = database;
    this.query = query;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  sqlAndValues() {
    const indexes = [];
    const query = this.query.replace(/\?(\d+)/g, (_placeholder, index) => {
      indexes.push(Number(index) - 1);
      return "?";
    });
    return {
      query,
      values: indexes.map((index) => this.values[index]),
    };
  }

  first() {
    const { query, values } = this.sqlAndValues();
    return Promise.resolve(
      this.database.prepare(query).get(...values) ?? null,
    );
  }

  run() {
    const { query, values } = this.sqlAndValues();
    if (/RETURNING/i.test(query)) {
      const results = this.database.prepare(query).all(...values);
      const meta = this.database.prepare("SELECT changes() AS changes").get();
      return Promise.resolve({ results, success: true, meta });
    }
    const result = this.database.prepare(query).run(...values);
    return Promise.resolve({
      results: [],
      success: true,
      meta: { changes: Number(result.changes) },
    });
  }
}

class LocalD1 {
  constructor(database) {
    this.database = database;
  }

  prepare(query) {
    return new LocalD1Statement(this.database, query);
  }

  batch(statements) {
    this.database.exec("BEGIN");
    try {
      const results = statements.map((statement) => {
        const { query, values } = statement.sqlAndValues();
        if (/RETURNING/i.test(query)) {
          const rows = this.database.prepare(query).all(...values);
          const meta = this.database.prepare("SELECT changes() AS changes").get();
          return { results: rows, success: true, meta };
        }
        const result = this.database.prepare(query).run(...values);
        return {
          results: [],
          success: true,
          meta: { changes: Number(result.changes) },
        };
      });
      this.database.exec("COMMIT");
      return Promise.resolve(results);
    } catch (error) {
      this.database.exec("ROLLBACK");
      return Promise.reject(error);
    }
  }
}

const database = new DatabaseSync(":memory:");
database.exec(readFileSync(migrationPath, "utf8"));
const d1 = new LocalD1(database);
const keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = keyPair.publicKey.export({ format: "jwk" });
publicJwk.kid = "test-key";
publicJwk.alg = "RS256";
publicJwk.use = "sig";
const env = {
  DB: d1,
  GOOGLE_OAUTH_CLIENT_ID: CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET: "test-only-secret",
  OAUTH_DATA_ENCRYPTION_KEY: ENCRYPTION_KEY,
  OAUTH_PUBLIC_BASE_URL: "https://test-account.workers.dev",
};

const workerModule = new Module(workerPath, module);
workerModule.filename = workerPath;
workerModule.paths = Module._nodeModulePaths(workerRoot);
workerModule._compile(
  ts.transpile(readFileSync(workerPath, "utf8"), {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  }),
  workerPath,
);
const worker = workerModule.exports.default;
const originalFetch = global.fetch;
const testVerifier = "0123456789abcdef".repeat(4);
const testAppChallenge = createHash("sha256")
  .update(testVerifier)
  .digest("base64url");

beforeEach(() => {
  database.exec("DELETE FROM oauth_attempts; DELETE FROM oauth_tickets; DELETE FROM oauth_rate_limits;");
  global.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      const form = new URLSearchParams(init.body);
      if (
        form.get("client_id") !== CLIENT_ID ||
        form.get("client_secret") !== env.GOOGLE_OAUTH_CLIENT_SECRET ||
        form.get("redirect_uri") !== `${env.OAUTH_PUBLIC_BASE_URL}/oauth/callback` ||
        createHash("sha256").update(form.get("code_verifier") ?? "").digest("base64url") !==
          currentAuthorizationUrl.searchParams.get("code_challenge")
      ) {
        return new Response("invalid PKCE exchange", { status: 400 });
      }
      const authorization = currentAuthorizationUrl;
      const claims = {
        iss: "https://accounts.google.com",
        aud: CLIENT_ID,
        exp: Math.floor(Date.now() / 1000) + 300,
        iat: Math.floor(Date.now() / 1000),
        nonce: authorization.searchParams.get("nonce"),
        sub: "firebase-stable-google-subject",
        email: "resident@example.test",
        email_verified: true,
      };
      return new Response(JSON.stringify({
        id_token: token({ alg: "RS256", kid: "test-key" }, claims, keyPair.privateKey),
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url === "https://www.googleapis.com/oauth2/v3/certs") {
      return new Response(JSON.stringify({ keys: [publicJwk] }), { status: 200 });
    }
    throw new Error(`Unexpected test fetch: ${url}`);
  };
});

after(() => {
  global.fetch = originalFetch;
  database.close();
});

let currentAuthorizationUrl;

const post = (path, body) => worker.fetch(
  new Request(`https://test-account.workers.dev${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }),
  env,
);

const begin = async () => {
  const response = await post("/oauth/start", { appChallenge: testAppChallenge });
  assert.equal(response.status, 200);
  const data = await response.json();
  currentAuthorizationUrl = new URL(data.authorizationUrl);
  return currentAuthorizationUrl;
};

const callback = (fields, workerEnv = env) => worker.fetch(
  new Request("https://test-account.workers.dev/oauth/callback", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
  }),
  workerEnv,
);

const captureLogs = async (action) => {
  const entries = [];
  const originalInfo = console.info;
  console.info = (...args) => entries.push(args.join(" "));
  try {
    return { result: await action(), logs: entries.join("\n") };
  } finally {
    console.info = originalInfo;
  }
};

const completeGoogleFlow = async () => {
  const authorization = await begin();
  const response = await callback({
    code: "authorization-code",
    state: authorization.searchParams.get("state"),
  });
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("Location"));
  assert.equal(location.protocol, "barangay:");
  assert.equal(location.hostname, "oauth");
  assert.equal(location.pathname, "/google");
  const ticket = location.searchParams.get("ticket");
  assert.ok(ticket);
  return {
    ticket,
    verifier: testVerifier,
    googleNonce: authorization.searchParams.get("nonce"),
  };
};

test("migration creates only the broker tables and required indexes", () => {
  const tables = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
  ).all().map(({ name }) => name);
  assert.deepEqual(tables, ["oauth_attempts", "oauth_rate_limits", "oauth_tickets"]);
});

test("OAuth start returns minimal scopes, PKCE, state, and nonce", async () => {
  const authorization = await begin();
  assert.equal(authorization.searchParams.get("scope"), "openid email profile");
  assert.equal(authorization.searchParams.get("response_type"), "code");
  assert.equal(authorization.searchParams.get("response_mode"), "form_post");
  assert.equal(authorization.searchParams.get("code_challenge_method"), "S256");
  for (const key of ["state", "code_challenge"]) {
    assert.match(authorization.searchParams.get(key), /^[A-Za-z0-9_-]{43}$/);
  }
  const googleNonce = authorization.searchParams.get("nonce");
  assert.match(googleNonce, /^[a-f0-9]{64}$/);
  const attempts = database.prepare(
    "SELECT payload_ciphertext FROM oauth_attempts LIMIT 1",
  ).get();
  assert.ok(attempts.payload_ciphertext);
});

test("state mismatch never exchanges an authorization code", async () => {
  const authorization = await begin();
  const response = await callback({
    code: "authorization-code",
    state: "Z".repeat(43),
  });
  assert.equal(response.status, 302);
  assert.equal(new URL(response.headers.get("Location")).searchParams.get("error"), "attempt_expired");
  assert.notEqual(authorization.searchParams.get("state"), "Z".repeat(43));
});

test("callback form parsing failures identify the callback stage without request data", async () => {
  const entries = await captureLogs(() => worker.fetch(
    new Request("https://test-account.workers.dev/oauth/callback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: "sensitive-state", code: "sensitive-code" }),
    }),
    env,
  ));
  assert.equal(
    new URL(entries.result.headers.get("Location")).searchParams.get("error"),
    "callback_invalid",
  );
  assert.match(entries.logs, /"stage":"callback_form_parse"/);
  assert.match(entries.logs, /"status":400/);
  assert.match(entries.logs, /"category":"callback_invalid"/);
  assert.doesNotMatch(entries.logs, /sensitive-state|sensitive-code/);
});

test("Google invalid_grant is categorized without exposing provider descriptions", async () => {
  const authorization = await begin();
  const original = global.fetch;
  global.fetch = async (input, init) => {
    if (String(input) === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({
        error: "invalid_grant",
        error_description: "sensitive provider detail",
      }), { status: 400 });
    }
    return original(input, init);
  };
  let entries;
  try {
    entries = await captureLogs(() => callback({
      code: "authorization-code",
      state: authorization.searchParams.get("state"),
    }));
  } finally {
    global.fetch = original;
  }
  assert.equal(
    new URL(entries.result.headers.get("Location")).searchParams.get("error"),
    "token_exchange_failed",
  );
  assert.match(entries.logs, /"stage":"google_token_exchange"/);
  assert.match(entries.logs, /"status":400/);
  assert.match(entries.logs, /"category":"authorization_code_rejected"/);
  assert.doesNotMatch(entries.logs, /sensitive provider detail|authorization-code/);
});

test("identity claim failures are safely distinguished in diagnostics", async () => {
  const originalFetch = global.fetch;
  const originalInfo = console.info;
  const entries = [];
  console.info = (...args) => entries.push(args.join(" "));
  try {
    for (const [claim, value, category] of [
      ["iss", "https://attacker.example", "invalid_issuer"],
      ["aud", "different-client", "invalid_audience"],
      ["nonce", "wrong-nonce", "invalid_nonce"],
    ]) {
      const authorization = await begin();
      global.fetch = async (input, init) => {
        if (String(input) === "https://oauth2.googleapis.com/token") {
          const claims = {
            iss: "https://accounts.google.com",
            aud: CLIENT_ID,
            exp: Math.floor(Date.now() / 1000) + 300,
            iat: Math.floor(Date.now() / 1000),
            nonce: authorization.searchParams.get("nonce"),
            sub: "firebase-stable-google-subject",
            email: "resident@example.test",
            email_verified: true,
            [claim]: value,
          };
          return new Response(JSON.stringify({
            id_token: token(
              { alg: "RS256", kid: "test-key" },
              claims,
              keyPair.privateKey,
            ),
          }), { status: 200 });
        }
        return originalFetch(input, init);
      };
      const response = await callback({
        code: "authorization-code",
        state: authorization.searchParams.get("state"),
      });
      assert.equal(
        new URL(response.headers.get("Location")).searchParams.get("error"),
        "identity_rejected",
      );
      assert.ok(entries.some((entry) =>
        entry.includes(`"category":"${category}"`),
      ));
    }
  } finally {
    global.fetch = originalFetch;
    console.info = originalInfo;
  }
});

test("attempt storage errors identify state-claim stage without changing redirect behavior", async () => {
  const authorization = await begin();
  const failingEnv = {
    ...env,
    DB: {
      prepare(query) {
        if (/UPDATE oauth_attempts/.test(query)) {
          throw new Error("sensitive database detail");
        }
        return env.DB.prepare(query);
      },
      batch: (...args) => env.DB.batch(...args),
    },
  };
  const entries = await captureLogs(() => callback({
    code: "authorization-code",
    state: authorization.searchParams.get("state"),
  }, failingEnv));
  assert.equal(
    new URL(entries.result.headers.get("Location")).searchParams.get("error"),
    "callback_failed",
  );
  assert.match(entries.logs, /"stage":"callback_state_claim"/);
  assert.match(entries.logs, /"category":"state_claim_failed"/);
  assert.doesNotMatch(entries.logs, /sensitive database detail/);
});

test("ticket storage errors return a safe category and do not expose ticket data", async () => {
  const authorization = await begin();
  const failingEnv = {
    ...env,
    DB: {
      prepare(query) {
        if (/INSERT INTO oauth_tickets/.test(query)) {
          throw new Error("sensitive database detail");
        }
        return env.DB.prepare(query);
      },
      batch: (...args) => env.DB.batch(...args),
    },
  };
  const entries = await captureLogs(() => callback({
    code: "authorization-code",
    state: authorization.searchParams.get("state"),
  }, failingEnv));
  assert.equal(
    new URL(entries.result.headers.get("Location")).searchParams.get("error"),
    "ticket_store_failed",
  );
  assert.match(entries.logs, /"stage":"ticket_storage"/);
  assert.match(entries.logs, /"category":"ticket_store_failed"/);
  assert.doesNotMatch(entries.logs, /sensitive database detail/);
});

test("nonce mismatch rejects the Google identity and returns no ticket", async () => {
  const authorization = await begin();
  const original = global.fetch;
  global.fetch = async (input, init) => {
    if (String(input) === "https://oauth2.googleapis.com/token") {
      const form = new URLSearchParams(init.body);
      assert.ok(form.get("code_verifier"));
      return new Response(JSON.stringify({
        id_token: token({
          alg: "RS256",
          kid: "test-key",
        }, {
          iss: "https://accounts.google.com",
          aud: CLIENT_ID,
          exp: Math.floor(Date.now() / 1000) + 300,
          iat: Math.floor(Date.now() / 1000),
          nonce: "wrong-nonce",
          sub: "subject",
          email: "resident@example.test",
          email_verified: true,
        }, keyPair.privateKey),
      }), { status: 200 });
    }
    return original(input, init);
  };
  const response = await callback({
    code: "authorization-code",
    state: authorization.searchParams.get("state"),
  });
  assert.equal(new URL(response.headers.get("Location")).searchParams.get("error"), "identity_rejected");
});

test("ticket verifier challenge mismatch does not consume or reveal a ticket", async () => {
  const { ticket } = await completeGoogleFlow();
  const response = await post("/oauth/redeem", {
    ticket,
    verifier: "wrong-verifier-value-with-sufficient-length",
  });
  assert.equal(response.status, 410);
  assert.deepEqual(await response.json(), { error: "ticket_expired_or_used" });
});

test("expired attempts and tickets cannot be used", async () => {
  const authorization = await begin();
  const expiredAt = Math.floor(Date.now() / 1000) - 1;
  database.prepare("UPDATE oauth_attempts SET expires_at = ?").run(expiredAt);
  const callbackResponse = await callback({
    code: "authorization-code",
    state: authorization.searchParams.get("state"),
  });
  assert.equal(new URL(callbackResponse.headers.get("Location")).searchParams.get("error"), "attempt_expired");

  const { ticket, verifier } = await completeGoogleFlow();
  database.prepare("UPDATE oauth_tickets SET expires_at = ?").run(expiredAt);
  const redeemResponse = await post("/oauth/redeem", {
    ticket,
    verifier,
  });
  assert.equal(redeemResponse.status, 410);
});

test("malformed callbacks, including duplicate state, are rejected", async () => {
  const authorization = await begin();
  const state = authorization.searchParams.get("state");
  const response = await worker.fetch(
    new Request("https://test-account.workers.dev/oauth/callback", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `state=${state}&state=${state}&code=authorization-code`,
    }),
    env,
  );
  assert.equal(new URL(response.headers.get("Location")).searchParams.get("error"), "callback_invalid");
});

test("rate limiting blocks requests beyond the service-wide cap", async () => {
  for (let index = 0; index < 100; index += 1) {
    const response = await post("/oauth/start", { appChallenge: testAppChallenge });
    assert.equal(response.status, 200);
  }
  const response = await post("/oauth/start", { appChallenge: testAppChallenge });
  assert.equal(response.status, 429);
});

test("ticket redemption succeeds once and rejects replay, including concurrent calls", async () => {
  const { ticket, verifier, googleNonce } = await completeGoogleFlow();
  const body = { ticket, verifier };
  const responses = await Promise.all([
    post("/oauth/redeem", body),
    post("/oauth/redeem", body),
  ]);
  const statuses = responses.map((response) => response.status).sort();
  assert.deepEqual(statuses, [200, 410]);
  const success = responses.find((response) => response.status === 200);
  assert.ok(success);
  const data = await success.json();
  assert.equal(typeof data.idToken, "string");
  assert.match(data.nonce, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(
    createHash("sha256").update(data.nonce).digest("hex"),
    googleNonce,
  );

  const replay = await post("/oauth/redeem", body);
  assert.equal(replay.status, 410);
});

test("OAuth diagnostics report stage and field presence without credential values", async () => {
  const entries = [];
  const originalInfo = console.info;
  let ticket;
  let verifier;
  let nonce;
  console.info = (...args) => entries.push(args.join(" "));
  try {
    ({ ticket, verifier } = await completeGoogleFlow());
    const response = await post("/oauth/redeem", { ticket, verifier });
    assert.equal(response.status, 200);
    ({ nonce } = await response.json());
  } finally {
    console.info = originalInfo;
  }

  const logs = entries.join("\n");
  assert.match(logs, /"stage":"oauth_start"/);
  assert.match(logs, /"stage":"callback_validation"/);
  assert.match(logs, /"stage":"google_token_exchange"/);
  assert.match(logs, /"stage":"google_identity_verification"/);
  assert.match(logs, /"stage":"nonce_generation"/);
  assert.match(logs, /"stage":"google_identity_nonce"/);
  assert.match(logs, /"stage":"ticket_storage"/);
  assert.match(logs, /"stage":"ticket_redemption"/);
  assert.match(logs, /"stage":"nonce_ticket_redemption"/);
  assert.match(logs, /"matches":true/);
  assert.match(logs, /"encoding":"sha256_hex"/);
  assert.match(logs, /"googleClaimLength":64/);
  assert.match(logs, /"status":200/);
  assert.match(logs, /"fieldsPresent"/);
  assert.doesNotMatch(logs, /authorization-code/);
  assert.doesNotMatch(logs, new RegExp(ticket));
  assert.doesNotMatch(logs, new RegExp(verifier));
  assert.doesNotMatch(logs, new RegExp(nonce));
  assert.doesNotMatch(logs, new RegExp(ENCRYPTION_KEY));
  assert.doesNotMatch(logs, /id_token|client_secret/);
});
