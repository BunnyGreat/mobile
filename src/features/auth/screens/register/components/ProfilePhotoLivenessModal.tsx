import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  runAsync,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  type CameraDevice,
} from "react-native-vision-camera";
import {
  type Face,
  type FrameFaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhotoCaptured: (uri: string) => Promise<void>;
};

type ChallengePhase = "positioning" | "turning" | "capturing" | "failed";

const CENTER_HOLD_MS = 900;
const TURN_HOLD_MS = 400;
const CHALLENGE_TIMEOUT_MS = 45_000;
const MAX_CENTER_OFFSET = 0.2;
const MIN_FACE_WIDTH = 0.15;
const MAX_FACE_WIDTH = 0.8;
const TURN_ANGLE_DEGREES = 22;
const MIN_TURN_STEP_DEGREES = 2;

const isFaceCentered = (face: Face, frameWidth: number, frameHeight: number) => {
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

const getFileUri = (path: string) =>
  path.startsWith("file://") ? path : `file://${path}`;

type ProfilePhotoDetectionCameraProps = {
  cameraRef: React.RefObject<Camera | null>;
  device: CameraDevice;
  isActive: boolean;
  onFacesDetected: (
    faces: Face[],
    frameWidth: number,
    frameHeight: number,
  ) => void;
  onError: (error: Error) => void;
};

const ProfilePhotoDetectionCamera: React.FC<
  ProfilePhotoDetectionCameraProps
> = ({ cameraRef, device, isActive, onFacesDetected, onError }) => {
  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    cameraFacing: "front",
    performanceMode: "fast",
    minFaceSize: MIN_FACE_WIDTH,
    trackingEnabled: true,
  }).current;
  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);
  const runOnJS = useMemo(
    () =>
      Worklets.createRunOnJS(
        (facesJSON: string, frameWidth: number, frameHeight: number) => {
          const faces: Face[] = JSON.parse(facesJSON);
          onFacesDetected(faces, frameWidth, frameHeight);
        },
      ),
    [onFacesDetected],
  );
  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runAsync(frame, () => {
        "worklet";
        const facesJSON = JSON.stringify(detectFaces(frame));
        runOnJS(facesJSON, frame.width, frame.height);
      });
    },
    [detectFaces, runOnJS],
  );

  useEffect(() => stopListeners, [stopListeners]);

  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      photo={true}
      frameProcessor={frameProcessor}
      onError={onError}
    />
  );
};

const ProfilePhotoLivenessModal: React.FC<Props> = ({
  visible,
  onClose,
  onPhotoCaptured,
}) => {
  const device = useCameraDevice("front");
  const permission = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  const [phase, setPhase] = useState<ChallengePhase>("positioning");
  const [message, setMessage] = useState(
    "Center your face inside the guide and look straight at the camera.",
  );
  const [failureMessage, setFailureMessage] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const phaseRef = useRef<ChallengePhase>("positioning");
  const centerStartedAtRef = useRef<number | null>(null);
  const baselineYawRef = useRef<number | null>(null);
  const previousYawDeltaRef = useRef<number | null>(null);
  const turnStartedAtRef = useRef<number | null>(null);
  const turnFrameCountRef = useRef(0);
  const captureStartedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCurrentPhase = useCallback((nextPhase: ChallengePhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const failChallenge = useCallback(
    (reason: string) => {
      if (phaseRef.current === "capturing" || phaseRef.current === "failed") {
        return;
      }
      setCurrentPhase("failed");
      setFailureMessage(reason);
    },
    [setCurrentPhase],
  );

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimeoutTimer = useCallback(() => {
    clearTimeoutTimer();
    timeoutRef.current = setTimeout(() => {
      failChallenge(
        "The movement check timed out. Retry when you are ready.",
      );
    }, CHALLENGE_TIMEOUT_MS);
  }, [clearTimeoutTimer, failChallenge]);

  const resetChallenge = useCallback(() => {
    centerStartedAtRef.current = null;
    baselineYawRef.current = null;
    previousYawDeltaRef.current = null;
    turnStartedAtRef.current = null;
    turnFrameCountRef.current = 0;
    captureStartedRef.current = false;
    setFailureMessage("");
    setCurrentPhase("positioning");
    setMessage(
      "Center your face inside the guide and look straight at the camera.",
    );
    startTimeoutTimer();
  }, [setCurrentPhase, startTimeoutTimer]);

  const captureVerifiedPhoto = useCallback(async () => {
    if (captureStartedRef.current) return;

    captureStartedRef.current = true;
    setCurrentPhase("capturing");
    setMessage("Movement check passed. Capturing your profile photo...");

    try {
      const camera = cameraRef.current;
      if (!camera) throw new Error("The camera is not ready.");

      const photo = await camera.takePhoto({
        flash: "off",
        enableShutterSound: false,
      });
      await onPhotoCaptured(getFileUri(photo.path));
      clearTimeoutTimer();
      onClose();
    } catch (error: unknown) {
      const reason =
        error instanceof Error
          ? error.message
          : "The photo could not be captured. Please retry.";
      console.error("Profile photo capture failed.", error);
      captureStartedRef.current = false;
      setCurrentPhase("failed");
      setFailureMessage(reason);
    }
  }, [
    clearTimeoutTimer,
    onClose,
    onPhotoCaptured,
    setCurrentPhase,
  ]);

  const handleDetectionError = useCallback(
    (error: Error) => {
      console.error("Profile camera or face detection failed.", error);
      failChallenge("Face detection stopped unexpectedly. Please retry.");
    },
    [failChallenge],
  );

  const handleFacesDetected = useCallback(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      if (phaseRef.current === "capturing" || phaseRef.current === "failed") {
        return;
      }

      if (faces.length > 1) {
        failChallenge(
          "More than one face was detected. Make sure you are alone in the frame, then retry.",
        );
        return;
      }

      if (faces.length === 0) {
        centerStartedAtRef.current = null;
        baselineYawRef.current = null;
        previousYawDeltaRef.current = null;
        turnStartedAtRef.current = null;
        turnFrameCountRef.current = 0;
        if (phaseRef.current === "turning") {
          failChallenge(
            "Your face left the guide during the challenge. Please retry.",
          );
        } else {
          setMessage("No face detected. Center your face inside the guide.");
        }
        return;
      }

      const face = faces[0];
      if (!isFaceCentered(face, frameWidth, frameHeight)) {
        centerStartedAtRef.current = null;
        baselineYawRef.current = null;
        previousYawDeltaRef.current = null;
        turnStartedAtRef.current = null;
        turnFrameCountRef.current = 0;
        if (phaseRef.current === "turning") {
          failChallenge(
            "Keep your face near the center while turning, then retry.",
          );
        } else {
          setMessage("Move closer and center your face inside the guide.");
        }
        return;
      }

      const now = Date.now();
      if (phaseRef.current === "positioning") {
        if (Math.abs(face.yawAngle) > 15) {
          centerStartedAtRef.current = null;
          baselineYawRef.current = null;
          previousYawDeltaRef.current = null;
          setMessage("Look straight at the camera and hold still.");
          return;
        }

        if (centerStartedAtRef.current === null) {
          centerStartedAtRef.current = now;
          baselineYawRef.current = face.yawAngle;
          setMessage("Hold still while we check your position...");
          return;
        }

        if (now - centerStartedAtRef.current >= CENTER_HOLD_MS) {
          setCurrentPhase("turning");
          previousYawDeltaRef.current = 0;
          turnStartedAtRef.current = null;
          turnFrameCountRef.current = 0;
          setMessage("Slowly turn your head to either side.");
        }
        return;
      }

      const baselineYaw = baselineYawRef.current;
      if (baselineYaw === null) {
        failChallenge("We could not establish a starting position. Please retry.");
        return;
      }

      const yawDelta = Math.abs(face.yawAngle - baselineYaw);
      const previousYawDelta = previousYawDeltaRef.current;
      if (
        previousYawDelta !== null &&
        yawDelta - previousYawDelta >= MIN_TURN_STEP_DEGREES
      ) {
        if (turnStartedAtRef.current === null) {
          turnStartedAtRef.current = now;
        }
        turnFrameCountRef.current += 1;
      } else if (
        previousYawDelta !== null &&
        previousYawDelta - yawDelta >= MIN_TURN_STEP_DEGREES
      ) {
        turnStartedAtRef.current = null;
        turnFrameCountRef.current = 0;
      }
      previousYawDeltaRef.current = yawDelta;

      if (
        yawDelta >= TURN_ANGLE_DEGREES &&
        turnFrameCountRef.current >= 2 &&
        turnStartedAtRef.current !== null &&
        now - turnStartedAtRef.current >= TURN_HOLD_MS
      ) {
        void captureVerifiedPhoto();
      }
    },
    [captureVerifiedPhoto, failChallenge, setCurrentPhase],
  );

  useEffect(() => {
    if (!visible) return;
    resetChallenge();
    return clearTimeoutTimer;
  }, [clearTimeoutTimer, resetChallenge, visible]);

  useEffect(() => {
    if (!visible || permission.hasPermission) {
      return;
    }

    let active = true;
    permission
      .requestPermission()
      .then((granted) => {
        if (active) setPermissionDenied(!granted);
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Camera permission request failed.", error);
          setPermissionError("Camera permission could not be requested.");
        }
      });

    return () => {
      active = false;
    };
  }, [
    permission.hasPermission,
    permission.requestPermission,
    visible,
  ]);

  const handleRetry = () => {
    setPermissionError("");
    setPermissionDenied(false);
    if (!permission.hasPermission) {
      permission.requestPermission().then(
        (granted) => setPermissionDenied(!granted),
        (error: unknown) => {
          console.error("Camera permission request failed.", error);
          setPermissionError("Camera permission could not be requested.");
        },
      );
    }
    resetChallenge();
  };

  const openSettings = () => {
    Linking.openSettings().catch((error: unknown) => {
      console.error("Could not open app settings.", error);
      setPermissionError("Settings could not be opened. Please open them manually.");
    });
  };

  const isPermissionDenied = !permission.hasPermission && permissionDenied;
  const cameraActive =
    visible && permission.hasPermission && !!device && phase !== "failed";
  const closeCamera = () => {
    if (phaseRef.current !== "capturing") {
      clearTimeoutTimer();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={closeCamera}
    >
      <View style={styles.screen}>
        {visible && permission.hasPermission && device ? (
          <>
            <ProfilePhotoDetectionCamera
              cameraRef={cameraRef}
              device={device}
              isActive={cameraActive}
              onFacesDetected={handleFacesDetected}
              onError={handleDetectionError}
            />
            <View style={styles.overlay}>
              <View style={styles.header}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Close camera"
                  style={styles.closeButton}
                  onPress={closeCamera}
                  disabled={phase === "capturing"}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Verify your profile photo</Text>
                <Text style={styles.subtitle}>
                  Center one face in the guide, then slowly turn your head to
                  either side.
                </Text>
              </View>

              <View
                accessibilityLabel="Face position guide"
                style={[
                  styles.faceGuide,
                  phase === "turning" && styles.faceGuideActive,
                ]}
              />

              <View style={styles.footer}>
                <Text accessibilityLiveRegion="polite" style={styles.message}>
                  {phase === "failed" ? failureMessage : message}
                </Text>
                {phase === "capturing" ? (
                  <ActivityIndicator
                    accessibilityLabel="Capturing profile photo"
                    color="#FFFFFF"
                    style={styles.loader}
                  />
                ) : null}
                {phase === "failed" ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.primaryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.primaryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={styles.disclaimer}>
                  This is a basic movement check, not identity verification.
                  Your camera frames are processed on this device.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.permissionContent}>
            <Text style={styles.title}>Camera access needed</Text>
            <Text style={styles.permissionMessage}>
              {permission.hasPermission
                ? "A front-facing camera is not available on this device."
                : permissionError ||
                  (isPermissionDenied
                    ? "Camera access is required to complete the profile-photo movement check."
                    : "Requesting camera permission...")}
            </Text>
            {isPermissionDenied ? (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={openSettings}
              >
                <Text style={styles.primaryButtonText}>Open Settings</Text>
              </TouchableOpacity>
            ) : null}
            {permission.hasPermission && !device ? (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={onClose}
              >
                <Text style={styles.primaryButtonText}>Close</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 8,
  },
  closeButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    marginTop: 22,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    maxWidth: 310,
    color: "#F0F3F5",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  faceGuide: {
    width: 258,
    height: 330,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 150,
    backgroundColor: "transparent",
  },
  faceGuideActive: {
    borderColor: "#54D68A",
  },
  footer: {
    width: "100%",
    minHeight: 130,
    alignItems: "center",
  },
  message: {
    minHeight: 44,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
  },
  loader: {
    marginTop: 8,
  },
  primaryButton: {
    minWidth: 160,
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#146C43",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 16,
    padding: 12,
  },
  secondaryButtonText: {
    color: "#146C43",
    fontSize: 15,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: 18,
    maxWidth: 320,
    color: "#E1E5E8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    backgroundColor: "#FFFFFF",
  },
  permissionMessage: {
    maxWidth: 320,
    marginTop: 12,
    color: "#46515A",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});

export default ProfilePhotoLivenessModal;
