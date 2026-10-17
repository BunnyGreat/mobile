import assert from "node:assert/strict";
import test from "node:test";
import {
  parsePickerTarget,
  restorePendingPickerResult,
} from "./idPhotoPicker.helpers.ts";

test("restores the original front or back picker target after activity recreation", () => {
  assert.deepEqual(
    parsePickerTarget(JSON.stringify({ side: "front", source: "gallery" })),
    { side: "front", source: "gallery" },
  );
  assert.deepEqual(
    parsePickerTarget(JSON.stringify({ side: "back", source: "camera" })),
    { side: "back", source: "camera" },
  );
});

test("rejects invalid pending picker state", () => {
  assert.equal(parsePickerTarget(null), null);
  assert.equal(parsePickerTarget("not-json"), null);
  assert.equal(
    parsePickerTarget(JSON.stringify({ side: "other", source: "camera" })),
    null,
  );
});

test("retries a pending-result lookup before reporting that no result exists", async () => {
  const expected = { canceled: false, assets: [{ uri: "file:///restored.jpg" }] };
  let attempts = 0;

  const result = await restorePendingPickerResult(
    async () => {
      attempts += 1;
      return attempts === 3 ? expected : null;
    },
    async () => {},
  );

  assert.equal(result, expected);
  assert.equal(attempts, 3);
});

test("returns null rather than fabricating a result when recovery is unavailable", async () => {
  let attempts = 0;
  const result = await restorePendingPickerResult(
    async () => {
      attempts += 1;
      return null;
    },
    async () => {},
  );

  assert.equal(result, null);
  assert.equal(attempts, 5);
});
