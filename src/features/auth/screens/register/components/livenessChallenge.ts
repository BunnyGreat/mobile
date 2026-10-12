export type LivenessPhase =
  | "centering"
  | "look-left"
  | "look-right"
  | "blinking"
  | "returning"
  | "capturing"
  | "success"
  | "failed";

export type LivenessFace = {
  bounds: { x: number; y: number; width: number; height: number };
  yawAngle: number;
  pitchAngle: number;
  rollAngle: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
};

export type LivenessUpdate = {
  phase: LivenessPhase;
  shouldCapture: boolean;
  failureMessage?: string;
};

const MAX_CENTER_OFFSET = 0.2;
const MIN_FACE_WIDTH = 0.15;
const MAX_FACE_WIDTH = 0.8;
const TURN_ANGLE_DEGREES = 22;
const MAX_UPRIGHT_ROLL_DEGREES = 15;
const MAX_STRAIGHT_YAW_DEGREES = 15;
const MAX_STRAIGHT_PITCH_DEGREES = 20;
const EYE_OPEN_THRESHOLD = 0.7;
const EYE_CLOSED_THRESHOLD = 0.3;
const CENTER_CONFIRMATION_FRAMES = 2;
const TURN_CONFIRMATION_FRAMES = 2;
const EYE_CONFIRMATION_FRAMES = 2;

export const getDetectionFrameDimensions = (
  frameWidth: number,
  frameHeight: number,
): { width: number; height: number } => ({
  width: frameHeight,
  height: frameWidth,
});

const isFaceCentered = (
  face: LivenessFace,
  frameWidth: number,
  frameHeight: number,
): boolean => {
  if (frameWidth <= 0 || frameHeight <= 0) return false;

  const centerX = (face.bounds.x + face.bounds.width / 2) / frameWidth;
  const centerY = (face.bounds.y + face.bounds.height / 2) / frameHeight;
  const faceWidth = face.bounds.width / frameWidth;

  return (
    Math.abs(centerX - 0.5) <= MAX_CENTER_OFFSET &&
    Math.abs(centerY - 0.5) <= MAX_CENTER_OFFSET &&
    faceWidth >= MIN_FACE_WIDTH &&
    faceWidth <= MAX_FACE_WIDTH
  );
};

const isFaceUpright = (face: LivenessFace): boolean =>
  Number.isFinite(face.yawAngle) &&
  Number.isFinite(face.pitchAngle) &&
  Number.isFinite(face.rollAngle) &&
  Math.abs(face.rollAngle) <= MAX_UPRIGHT_ROLL_DEGREES;

const isFaceLookingForward = (face: LivenessFace): boolean =>
  Math.abs(face.yawAngle) <= MAX_STRAIGHT_YAW_DEGREES &&
  Math.abs(face.pitchAngle) <= MAX_STRAIGHT_PITCH_DEGREES;

export class LivenessChallenge {
  phase: LivenessPhase = "centering";
  failureMessage = "";

  private baselineYaw: number | null = null;
  private firstTurnYaw: number | null = null;
  private centerFrames = 0;
  private leftFrames = 0;
  private rightFrames = 0;
  private openEyeFrames = 0;
  private closedEyeFrames = 0;
  private sawOpenEyes = false;
  private sawClosedEyes = false;
  private phaseBeforeFailure: LivenessPhase = "centering";

  reset(): void {
    this.phase = "centering";
    this.failureMessage = "";
    this.baselineYaw = null;
    this.firstTurnYaw = null;
    this.clearStepFrames();
    this.sawOpenEyes = false;
    this.sawClosedEyes = false;
    this.phaseBeforeFailure = "centering";
  }

  fail(message: string): void {
    if (this.phase === "success" || this.phase === "failed") {
      return;
    }
    this.phaseBeforeFailure = this.phase;
    this.phase = "failed";
    this.failureMessage = message;
  }

  retry(): LivenessPhase {
    if (this.phase !== "failed") return this.phase;

    this.phase = this.phaseBeforeFailure;
    this.failureMessage = "";
    this.clearStepFrames();
    if (this.phase === "centering") this.baselineYaw = null;
    if (this.phase === "blinking") {
      this.sawOpenEyes = false;
      this.sawClosedEyes = false;
    }
    if (this.phase === "capturing") this.phase = "returning";
    return this.phase;
  }

  completeCapture(): void {
    if (this.phase === "capturing") this.phase = "success";
  }

  get failedAtPhase(): LivenessPhase {
    return this.phaseBeforeFailure;
  }

  process(
    faces: LivenessFace[],
    frameWidth: number,
    frameHeight: number,
  ): LivenessUpdate {
    if (
      this.phase === "capturing" ||
      this.phase === "success" ||
      this.phase === "failed"
    ) {
      return { phase: this.phase, shouldCapture: false };
    }

    if (faces.length > 1) {
      this.fail(
        "More than one face was detected. Make sure you are alone in the frame, then retry.",
      );
      return {
        phase: this.phase,
        shouldCapture: false,
        failureMessage: this.failureMessage,
      };
    }

    if (faces.length === 0) {
      this.clearStepFrames();
      if (this.phase === "blinking") this.sawClosedEyes = false;
      return { phase: this.phase, shouldCapture: false };
    }

    const face = faces[0];
    if (
      !isFaceCentered(face, frameWidth, frameHeight) ||
      !isFaceUpright(face)
    ) {
      this.clearStepFrames();
      return { phase: this.phase, shouldCapture: false };
    }

    if (this.phase === "centering" || this.phase === "returning") {
      if (!isFaceLookingForward(face)) {
        this.centerFrames = 0;
        return { phase: this.phase, shouldCapture: false };
      }

      this.centerFrames += 1;
      if (this.centerFrames < CENTER_CONFIRMATION_FRAMES) {
        return { phase: this.phase, shouldCapture: false };
      }

      if (this.phase === "centering") {
        this.baselineYaw = face.yawAngle;
        this.phase = "look-left";
      } else {
        this.phase = "capturing";
        return { phase: this.phase, shouldCapture: true };
      }
      this.clearStepFrames();
      return { phase: this.phase, shouldCapture: false };
    }

    if (this.baselineYaw === null) {
      this.fail("We could not establish a starting position. Please retry.");
      return {
        phase: this.phase,
        shouldCapture: false,
        failureMessage: this.failureMessage,
      };
    }

    const yawDelta = face.yawAngle - this.baselineYaw;
    if (this.phase === "look-left") {
      this.leftFrames =
        yawDelta >= TURN_ANGLE_DEGREES ? this.leftFrames + 1 : 0;
      if (this.leftFrames >= TURN_CONFIRMATION_FRAMES) {
        this.firstTurnYaw = face.yawAngle;
        this.phase = "look-right";
        this.clearStepFrames();
      }
      return { phase: this.phase, shouldCapture: false };
    }

    if (this.phase === "look-right") {
      const turnedOpposite =
        yawDelta <= -TURN_ANGLE_DEGREES &&
        this.firstTurnYaw !== null &&
        Math.abs(face.yawAngle - this.firstTurnYaw) >= TURN_ANGLE_DEGREES;
      this.rightFrames = turnedOpposite ? this.rightFrames + 1 : 0;
      if (this.rightFrames >= TURN_CONFIRMATION_FRAMES) {
        this.phase = "blinking";
        this.clearStepFrames();
        this.sawOpenEyes = false;
        this.sawClosedEyes = false;
      }
      return { phase: this.phase, shouldCapture: false };
    }

    if (this.phase === "blinking") {
      if (!isFaceLookingForward(face)) {
        this.openEyeFrames = 0;
        this.closedEyeFrames = 0;
        this.sawClosedEyes = false;
        return { phase: this.phase, shouldCapture: false };
      }

      const leftEye = face.leftEyeOpenProbability;
      const rightEye = face.rightEyeOpenProbability;
      if (
        !Number.isFinite(leftEye) ||
        !Number.isFinite(rightEye) ||
        leftEye < 0 ||
        rightEye < 0 ||
        leftEye > 1 ||
        rightEye > 1
      ) {
        this.openEyeFrames = 0;
        this.closedEyeFrames = 0;
        this.sawClosedEyes = false;
        return { phase: this.phase, shouldCapture: false };
      }

      const eyesOpen =
        leftEye >= EYE_OPEN_THRESHOLD && rightEye >= EYE_OPEN_THRESHOLD;
      const eyesClosed =
        leftEye <= EYE_CLOSED_THRESHOLD && rightEye <= EYE_CLOSED_THRESHOLD;

      if (eyesOpen) {
        this.openEyeFrames += 1;
        this.closedEyeFrames = 0;
        if (this.openEyeFrames >= EYE_CONFIRMATION_FRAMES) {
          if (this.sawClosedEyes) {
            this.phase = "returning";
            this.clearStepFrames();
            this.sawOpenEyes = false;
            this.sawClosedEyes = false;
          } else {
            this.sawOpenEyes = true;
          }
        }
      } else if (eyesClosed && this.sawOpenEyes) {
        this.closedEyeFrames += 1;
        this.openEyeFrames = 0;
        if (this.closedEyeFrames >= EYE_CONFIRMATION_FRAMES) {
          this.sawClosedEyes = true;
        }
      } else {
        this.openEyeFrames = 0;
        this.closedEyeFrames = 0;
      }
    }

    return { phase: this.phase, shouldCapture: false };
  }

  private clearStepFrames(): void {
    this.centerFrames = 0;
    this.leftFrames = 0;
    this.rightFrames = 0;
    this.openEyeFrames = 0;
    this.closedEyeFrames = 0;
  }
}
