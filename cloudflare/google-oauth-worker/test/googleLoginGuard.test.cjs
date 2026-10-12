const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const Module = require("node:module");
const ts = require("typescript");

const helperPath = join(
  __dirname,
  "..",
  "..",
  "..",
  "src",
  "features",
  "auth",
  "services",
  "singleFlightAction.ts",
);
const helperModule = new Module(helperPath, module);
helperModule.filename = helperPath;
helperModule.paths = Module._nodeModulePaths(join(helperPath, ".."));
helperModule._compile(
  ts.transpile(readFileSync(helperPath, "utf8"), {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  }),
  helperPath,
);
const { runSingleFlightAction } = helperModule.exports;

test("rapid repeat taps start one sign-in and clear loading when it finishes", async () => {
  const guard = { current: false };
  const loading = [];
  let completeAction;
  let actionCount = 0;
  const action = () => {
    actionCount += 1;
    return new Promise((resolve) => {
      completeAction = resolve;
    });
  };

  const first = runSingleFlightAction(guard, (value) => loading.push(value), action);
  const second = await runSingleFlightAction(
    guard,
    (value) => loading.push(value),
    action,
  );

  assert.equal(second, undefined);
  assert.equal(actionCount, 1);
  assert.deepEqual(loading, [true]);
  completeAction("complete");
  assert.equal(await first, "complete");
  assert.deepEqual(loading, [true, false]);
  assert.equal(guard.current, false);
});

test("loading and the repeat-tap guard clear after a sign-in failure", async () => {
  const guard = { current: false };
  const loading = [];
  const failure = new Error("sign-in failed");

  await assert.rejects(
    runSingleFlightAction(
      guard,
      (value) => loading.push(value),
      async () => {
        throw failure;
      },
    ),
    failure,
  );

  assert.deepEqual(loading, [true, false]);
  assert.equal(guard.current, false);
});

test("cancellation, timeout, and network errors clear loading and allow retry", async () => {
  const guard = { current: false };
  const loading = [];

  for (const code of [
    "google_sign_in_cancelled",
    "google_oauth_timeout",
    "google_oauth_start_failed",
  ]) {
    const failure = Object.assign(new Error(code), { code });
    await assert.rejects(
      runSingleFlightAction(
        guard,
        (value) => loading.push(value),
        async () => {
          throw failure;
        },
      ),
      failure,
    );
    assert.equal(guard.current, false);
    assert.equal(loading.at(-1), false);
  }

  const result = await runSingleFlightAction(
    guard,
    (value) => loading.push(value),
    async () => "retried",
  );
  assert.equal(result, "retried");
  assert.equal(guard.current, false);
  assert.deepEqual(loading, [
    true, false,
    true, false,
    true, false,
    true, false,
  ]);
});
