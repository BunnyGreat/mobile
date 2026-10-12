import assert from "node:assert/strict";
import test from "node:test";
import {
  getDetectionFrameDimensions,
  LivenessChallenge,
} from "./livenessChallenge.ts";

const frame = (yawAngle = 0, eyes = 0.9) => ({
  bounds: { x: 252, y: 440, width: 216, height: 400 },
  yawAngle,
  pitchAngle: 0,
  rollAngle: 0,
  leftEyeOpenProbability: eyes,
  rightEyeOpenProbability: eyes,
});

const feed = (challenge, face = frame()) =>
  challenge.process([face], 720, 1280);

const completeHeadTurns = (challenge) => {
  feed(challenge);
  feed(challenge);
  assert.equal(challenge.phase, "look-left");
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-left");
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "look-right");
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "blinking");
};

test("uses the face detector's rotated image dimensions", () => {
  assert.deepEqual(getDetectionFrameDimensions(1280, 720), {
    width: 720,
    height: 1280,
  });
});

test("advances turns after two qualifying frames and rejects a noisy spike", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  assert.equal(challenge.phase, "look-left");

  feed(challenge, frame(25));
  feed(challenge, frame(0));
  assert.equal(challenge.phase, "look-left");

  feed(challenge, frame(25));
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");

  feed(challenge, frame(-25));
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "blinking");
});

test("requires an open-closed-reopened blink before returning to center", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);

  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));
  assert.equal(challenge.phase, "blinking");

  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  assert.equal(challenge.phase, "blinking");

  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));
  assert.equal(challenge.phase, "blinking");

  feed(challenge, frame(0, 0.9));
  assert.equal(challenge.phase, "blinking");
  feed(challenge, frame(0, 0.9));
  assert.equal(challenge.phase, "returning");
});

test("a brief missing detection preserves the active step and requires fresh frames", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");

  challenge.process([], 720, 1280);
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "look-right");
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "blinking");
});

test("retry resumes the failed step without clearing completed turns", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  challenge.fail("camera interrupted");
  assert.equal(challenge.phase, "failed");
  assert.equal(challenge.failedAtPhase, "look-right");
  assert.equal(challenge.retry(), "look-right");

  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "look-right");
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "blinking");
});

test("capture starts immediately after two centered frames and only once", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  assert.equal(challenge.phase, "returning");

  feed(challenge);
  const capture = feed(challenge);
  assert.equal(capture.phase, "capturing");
  assert.equal(capture.shouldCapture, true);
  assert.equal(feed(challenge).shouldCapture, false);

  challenge.completeCapture();
  assert.equal(challenge.phase, "success");
  assert.equal(feed(challenge).shouldCapture, false);
});
