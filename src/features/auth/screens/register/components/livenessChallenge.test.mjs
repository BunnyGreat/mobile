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
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");
  feed(challenge, frame(-25));
  feed(challenge, frame(-25));
  feed(challenge, frame(-25));
  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "blinking");
};

const completeBlink = (challenge) => {
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
};

test("maps front-camera yaw direction to the instructed left and right turns", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  assert.equal(challenge.phase, "look-left");

  for (let index = 0; index < 6; index += 1) {
    feed(challenge, frame(-25));
  }
  assert.equal(challenge.phase, "look-left");

  for (let index = 0; index < 6; index += 1) {
    feed(challenge, frame(16));
  }
  assert.equal(challenge.phase, "look-right");
  for (let index = 0; index < 8; index += 1) {
    feed(challenge, frame(-16));
  }
  assert.equal(challenge.phase, "blinking");
});

test("uses the face detector's rotated image dimensions", () => {
  assert.deepEqual(getDetectionFrameDimensions(1280, 720), {
    width: 720,
    height: 1280,
  });
});

test("uses a smoothed realistic turn angle and rejects a noisy spike", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  assert.equal(challenge.phase, "look-left");

  feed(challenge, frame(25));
  feed(challenge, frame(0));
  assert.equal(challenge.phase, "look-left");

  for (let index = 0; index < 5; index += 1) {
    feed(challenge, frame(16));
  }
  assert.equal(challenge.phase, "look-right");
});

test("accepts sustained ordinary head turns but rejects insufficient movement", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);

  for (let index = 0; index < 8; index += 1) {
    feed(challenge, frame(8));
  }
  assert.equal(challenge.phase, "look-left");

  for (let index = 0; index < 8; index += 1) {
    feed(challenge, frame(12));
  }
  assert.equal(challenge.phase, "look-right");
});

test("accepts turned faces within the wider movement guide without weakening center checks", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  assert.equal(challenge.phase, "look-left");

  const naturallyShiftedTurn = {
    ...frame(16),
    bounds: { x: 420, y: 440, width: 216, height: 400 },
    rollAngle: 20,
  };
  feed(challenge, naturallyShiftedTurn);
  feed(challenge, naturallyShiftedTurn);
  feed(challenge, naturallyShiftedTurn);
  assert.equal(challenge.phase, "look-right");

  challenge.reset();
  const offCenterFace = {
    ...frame(),
    bounds: { x: 468, y: 440, width: 216, height: 400 },
  };
  feed(challenge, offCenterFace);
  feed(challenge, offCenterFace);
  assert.equal(challenge.phase, "centering");
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

test("accepts a genuine blink when the face shifts slightly during the blink step", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);
  const slightlyShifted = (eyes) => ({
    ...frame(11.008, eyes),
    bounds: { x: 432, y: 440, width: 216, height: 400 },
  });

  feed(challenge, slightlyShifted(0.9));
  feed(challenge, slightlyShifted(0.9));
  feed(challenge, slightlyShifted(0.1));
  feed(challenge, slightlyShifted(0.1));
  feed(challenge, slightlyShifted(0.9));
  feed(challenge, slightlyShifted(0.9));

  assert.equal(challenge.phase, "returning");
  assert.equal(challenge.getDiagnostics().faceAccepted, true);
});

test("invalid or unavailable eye probabilities cannot complete a blink", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, Number.NaN));
  feed(challenge, frame(0, Number.NaN));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, Number.NaN));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));

  assert.equal(challenge.phase, "blinking");
});

test("preserves a detected blink across a brief face-detector dropout", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));

  for (let index = 0; index < 20; index += 1) {
    challenge.process([], 720, 1280);
  }
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));

  assert.equal(challenge.phase, "returning");
});

test("requires a new complete blink after a longer face dropout", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));

  for (let index = 0; index < 31; index += 1) {
    challenge.process([], 720, 1280);
  }
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  assert.equal(challenge.phase, "blinking");

  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.1));
  feed(challenge, frame(0, 0.9));
  feed(challenge, frame(0, 0.9));
  assert.equal(challenge.phase, "returning");
});

test("fails with a retryable message when the face remains lost", () => {
  const challenge = new LivenessChallenge();
  completeHeadTurns(challenge);

  let update;
  for (let index = 0; index < 90; index += 1) {
    update = challenge.process([], 720, 1280);
  }

  assert.equal(update.phase, "failed");
  assert.match(update.failureMessage, /could not see your face/i);
  assert.equal(challenge.retry(), "blinking");
});

test("brief missing detections preserve partial turn evidence without advancing", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-left");

  challenge.process([], 720, 1280);
  challenge.process([], 720, 1280);
  assert.equal(challenge.phase, "look-left");

  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");
});

test("a longer detection dropout clears partial turn evidence but keeps the phase", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(25));
  feed(challenge, frame(25));

  challenge.process([], 720, 1280);
  challenge.process([], 720, 1280);
  challenge.process([], 720, 1280);
  assert.equal(challenge.phase, "look-left");

  feed(challenge, frame(25));
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-left");
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");
});

test("reset clears phase and pending turn evidence", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(25));
  feed(challenge, frame(25));

  challenge.reset();
  assert.equal(challenge.phase, "centering");
  feed(challenge);
  feed(challenge);
  assert.equal(challenge.phase, "look-left");
  for (let index = 0; index < 6; index += 1) {
    feed(challenge, frame(-25));
  }
  assert.equal(challenge.phase, "look-left");
});

test("invalid pose data cannot advance a challenge and multiple faces fail safely", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(Number.NaN));
  assert.equal(challenge.phase, "look-left");
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  assert.equal(challenge.phase, "look-right");

  const multipleFaces = challenge.process(
    [frame(-25), frame(-25)],
    720,
    1280,
  );
  assert.equal(multipleFaces.phase, "failed");
  assert.match(multipleFaces.failureMessage, /more than one face/i);
});

test("diagnostics expose pose progression without retaining image or landmark data", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(16));

  const diagnostics = challenge.getDiagnostics();
  assert.equal(diagnostics.phase, "look-left");
  assert.equal(diagnostics.rawYaw, 16);
  assert.ok(typeof diagnostics.smoothedYaw === "number");
  assert.equal(diagnostics.baselineYaw, 0);
  assert.equal(diagnostics.faceAccepted, true);
  assert.equal("landmarks" in diagnostics, false);
  assert.equal("image" in diagnostics, false);
});

test("retry resumes the failed step without clearing completed turns", () => {
  const challenge = new LivenessChallenge();
  feed(challenge);
  feed(challenge);
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  feed(challenge, frame(25));
  challenge.fail("camera interrupted");
  assert.equal(challenge.phase, "failed");
  assert.equal(challenge.failedAtPhase, "look-right");
  assert.equal(challenge.retry(), "look-right");

  feed(challenge, frame(-25));
  assert.equal(challenge.phase, "look-right");
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
