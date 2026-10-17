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

export type LivenessDiagnostics = {
  phase: LivenessPhase;
  rawYaw: number | null;
  smoothedYaw: number | null;
  baselineYaw: number | null;
  yawDelta: number | null;
  leftFrames: number;
  rightFrames: number;
  missingFaceFrames: number;
  faceAccepted: boolean | null;
  faceRejectionReason: "off-center" | "invalid-pose" | null;
  faceCenterX: number | null;
  faceCenterY: number | null;
  faceWidthRatio: number | null;
  rollAngle: number | null;
  pitchAngle: number | null;
};

const MAX_CENTER_OFFSET = 0.2;
const MAX_TURN_CENTER_OFFSET = 0.35;
const MAX_BLINK_CENTER_OFFSET = 0.3;
const MIN_FACE_WIDTH = 0.1;
const MAX_FACE_WIDTH = 0.8;
const TURN_ANGLE_DEGREES = 10;
// ML Kit yaw is camera-relative; positive yaw maps to the user's left in the mirrored front preview.
const LOOK_LEFT_YAW_DIRECTION = 1;
const LOOK_RIGHT_YAW_DIRECTION = -1;
const MAX_UPRIGHT_ROLL_DEGREES = 15;
const MAX_TURN_ROLL_DEGREES = 25;
const MAX_TURN_YAW_DEGREES = 55;
const MAX_STRAIGHT_YAW_DEGREES = 15;
const MAX_STRAIGHT_PITCH_DEGREES = 20;
const EYE_OPEN_THRESHOLD = 0.7;
const EYE_CLOSED_THRESHOLD = 0.3;
const CENTER_CONFIRMATION_FRAMES = 2;
const TURN_CONFIRMATION_FRAMES = 3;
const EYE_CONFIRMATION_FRAMES = 2;
const MAX_MISSING_FACE_FRAMES = 2;
const MAX_BLINK_MISSING_FACE_FRAMES = 30;
const MAX_FACE_LOSS_FRAMES = 90;
const YAW_SMOOTHING_ALPHA = 0.65;

export const getDetectionFrameDimensions = (
  frameWidth: number,
  frameHeight: number,
): { width: number; height: number } => ({
  width: frameHeight,
  height: frameWidth,
});

const isFaceInGuide = (
  face: LivenessFace,
  frameWidth: number,
  frameHeight: number,
  maxCenterOffset: number,
): boolean => {
  if (frameWidth <= 0 || frameHeight <= 0) return false;

  const centerX = (face.bounds.x + face.bounds.width / 2) / frameWidth;
  const centerY = (face.bounds.y + face.bounds.height / 2) / frameHeight;
  const faceWidth = face.bounds.width / frameWidth;

  return (
    Math.abs(centerX - 0.5) <= maxCenterOffset &&
    Math.abs(centerY - 0.5) <= maxCenterOffset &&
    faceWidth >= MIN_FACE_WIDTH &&
    faceWidth <= MAX_FACE_WIDTH
  );
};

const isFaceUpright = (
  face: LivenessFace,
  maxRollDegrees = MAX_UPRIGHT_ROLL_DEGREES,
  maxYawDegrees = Number.POSITIVE_INFINITY,
): boolean =>
  Number.isFinite(face.yawAngle) &&
  Number.isFinite(face.pitchAngle) &&
  Number.isFinite(face.rollAngle) &&
  Math.abs(face.rollAngle) <= maxRollDegrees &&
  Math.abs(face.yawAngle) <= maxYawDegrees;

const isFaceLookingForward = (face: LivenessFace): boolean =>
  Math.abs(face.yawAngle) <= MAX_STRAIGHT_YAW_DEGREES &&
  Math.abs(face.pitchAngle) <= MAX_STRAIGHT_PITCH_DEGREES;

export class LivenessChallenge {
  phase: LivenessPhase = "centering";
  failureMessage = "";

  private baselineYaw: number | null = null;
  private firstTurnYaw: number | null = null;
  private smoothedYaw: number | null = null;
  private missingFaceFrames = 0;
  private centerFrames = 0;
  private leftFrames = 0;
  private rightFrames = 0;
  private openEyeFrames = 0;
  private closedEyeFrames = 0;
  private sawOpenEyes = false;
  private sawClosedEyes = false;
  private lastRawYaw: number | null = null;
  private lastFaceAccepted: boolean | null = null;
  private lastFaceRejectionReason: LivenessDiagnostics["faceRejectionReason"] =
    null;
  private lastFaceCenterX: number | null = null;
  private lastFaceCenterY: number | null = null;
  private lastFaceWidthRatio: number | null = null;
  private lastRollAngle: number | null = null;
  private lastPitchAngle: number | null = null;
  private phaseBeforeFailure: LivenessPhase = "centering";

  reset(): void {
    this.phase = "centering";
    this.failureMessage = "";
    this.baselineYaw = null;
    this.firstTurnYaw = null;
    this.smoothedYaw = null;
    this.missingFaceFrames = 0;
    this.lastRawYaw = null;
    this.lastFaceAccepted = null;
    this.lastFaceRejectionReason = null;
    this.lastFaceCenterX = null;
    this.lastFaceCenterY = null;
    this.lastFaceWidthRatio = null;
    this.lastRollAngle = null;
    this.lastPitchAngle = null;
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
    this.smoothedYaw = null;
    this.missingFaceFrames = 0;
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

  getDiagnostics(): LivenessDiagnostics {
    return {
      phase: this.phase,
      rawYaw: this.lastRawYaw,
      smoothedYaw: this.smoothedYaw,
      baselineYaw: this.baselineYaw,
      yawDelta:
        this.smoothedYaw === null || this.baselineYaw === null
          ? null
          : this.smoothedYaw - this.baselineYaw,
      leftFrames: this.leftFrames,
      rightFrames: this.rightFrames,
      missingFaceFrames: this.missingFaceFrames,
      faceAccepted: this.lastFaceAccepted,
      faceRejectionReason: this.lastFaceRejectionReason,
      faceCenterX: this.lastFaceCenterX,
      faceCenterY: this.lastFaceCenterY,
      faceWidthRatio: this.lastFaceWidthRatio,
      rollAngle: this.lastRollAngle,
      pitchAngle: this.lastPitchAngle,
    };
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
      this.lastRawYaw = null;
      this.lastFaceAccepted = false;
      this.lastFaceRejectionReason = "invalid-pose";
      this.clearStepFrames();
      this.smoothedYaw = null;
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
      this.lastRawYaw = null;
      this.lastFaceAccepted = null;
      this.lastFaceRejectionReason = null;
      this.lastFaceCenterX = null;
      this.lastFaceCenterY = null;
      this.lastFaceWidthRatio = null;
      this.lastRollAngle = null;
      this.lastPitchAngle = null;
      this.missingFaceFrames += 1;
      if (
        this.phase === "blinking" &&
        this.missingFaceFrames > MAX_BLINK_MISSING_FACE_FRAMES
      ) {
        this.clearStepFrames();
        this.sawOpenEyes = false;
        this.sawClosedEyes = false;
      } else if (
        this.phase !== "blinking" &&
        this.missingFaceFrames > MAX_MISSING_FACE_FRAMES
      ) {
        this.clearStepFrames();
        this.smoothedYaw = null;
      }
      if (this.missingFaceFrames >= MAX_FACE_LOSS_FRAMES) {
        this.fail(
          "We could not see your face. Move back into the guide, then try again.",
        );
        return {
          phase: this.phase,
          shouldCapture: false,
          failureMessage: this.failureMessage,
        };
      }
      return { phase: this.phase, shouldCapture: false };
    }

    this.missingFaceFrames = 0;
    const face = faces[0];
    this.lastRawYaw = Number.isFinite(face.yawAngle) ? face.yawAngle : null;
    this.lastFaceCenterX =
      frameWidth > 0
        ? (face.bounds.x + face.bounds.width / 2) / frameWidth
        : null;
    this.lastFaceCenterY =
      frameHeight > 0
        ? (face.bounds.y + face.bounds.height / 2) / frameHeight
        : null;
    this.lastFaceWidthRatio =
      frameWidth > 0 ? face.bounds.width / frameWidth : null;
    this.lastRollAngle = Number.isFinite(face.rollAngle) ? face.rollAngle : null;
    this.lastPitchAngle = Number.isFinite(face.pitchAngle)
      ? face.pitchAngle
      : null;
    const isTurnPhase =
      this.phase === "look-left" || this.phase === "look-right";
    const faceCentered = isFaceInGuide(
      face,
      frameWidth,
      frameHeight,
      isTurnPhase
        ? MAX_TURN_CENTER_OFFSET
        : this.phase === "blinking"
          ? MAX_BLINK_CENTER_OFFSET
          : MAX_CENTER_OFFSET,
    );
    const faceUpright = isFaceUpright(
      face,
      isTurnPhase ? MAX_TURN_ROLL_DEGREES : MAX_UPRIGHT_ROLL_DEGREES,
      isTurnPhase ? MAX_TURN_YAW_DEGREES : Number.POSITIVE_INFINITY,
    );
    this.lastFaceAccepted = faceCentered && faceUpright;
    this.lastFaceRejectionReason = this.lastFaceAccepted
      ? null
      : !faceCentered
        ? "off-center"
        : "invalid-pose";
    if (!this.lastFaceAccepted) {
      this.clearStepFrames();
      this.smoothedYaw = null;
      if (this.phase === "blinking") {
        this.sawOpenEyes = false;
        this.sawClosedEyes = false;
      }
      return { phase: this.phase, shouldCapture: false };
    }

    this.smoothedYaw =
      this.smoothedYaw === null
        ? face.yawAngle
        : this.smoothedYaw +
          YAW_SMOOTHING_ALPHA * (face.yawAngle - this.smoothedYaw);

    if (this.phase === "centering" || this.phase === "returning") {
      const smoothedFace = { ...face, yawAngle: this.smoothedYaw };
      if (!isFaceLookingForward(smoothedFace)) {
        this.centerFrames = 0;
        return { phase: this.phase, shouldCapture: false };
      }

      this.centerFrames += 1;
      if (this.centerFrames < CENTER_CONFIRMATION_FRAMES) {
        return { phase: this.phase, shouldCapture: false };
      }

      if (this.phase === "centering") {
        this.baselineYaw = this.smoothedYaw;
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

    const yawDelta = this.smoothedYaw - this.baselineYaw;
    if (this.phase === "look-left") {
      const directedYawDelta = yawDelta * LOOK_LEFT_YAW_DIRECTION;
      this.leftFrames =
        directedYawDelta >= TURN_ANGLE_DEGREES
          ? this.leftFrames + 1
          : this.leftFrames > 0 &&
              directedYawDelta >= TURN_ANGLE_DEGREES * 0.8
            ? this.leftFrames
            : 0;
      if (this.leftFrames >= TURN_CONFIRMATION_FRAMES) {
        this.firstTurnYaw = this.smoothedYaw;
        this.phase = "look-right";
        this.clearStepFrames();
      }
      return { phase: this.phase, shouldCapture: false };
    }

    if (this.phase === "look-right") {
      const directedYawDelta = yawDelta * LOOK_RIGHT_YAW_DIRECTION;
      const turnedOpposite =
        directedYawDelta >= TURN_ANGLE_DEGREES &&
        this.firstTurnYaw !== null &&
        Math.abs(this.smoothedYaw - this.firstTurnYaw) >= TURN_ANGLE_DEGREES;
      this.rightFrames = turnedOpposite
        ? this.rightFrames + 1
        : this.rightFrames > 0 &&
            directedYawDelta >= TURN_ANGLE_DEGREES * 0.8 &&
            this.firstTurnYaw !== null &&
            Math.abs(this.smoothedYaw - this.firstTurnYaw) >=
              TURN_ANGLE_DEGREES * 0.8
          ? this.rightFrames
          : 0;
      if (this.rightFrames >= TURN_CONFIRMATION_FRAMES) {
        this.phase = "blinking";
        this.clearStepFrames();
        this.smoothedYaw = null;
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
            this.smoothedYaw = null;
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
