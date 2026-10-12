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
import {
  getDetectionFrameDimensions,
  LivenessChallenge,
  type LivenessPhase,
} from "./livenessChallenge";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhotoCaptured: (uri: string) => Promise<void>;
};

const CHALLENGE_TIMEOUT_MS = 90_000;
const MIN_FACE_WIDTH = 0.15;

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
    classificationMode: "all",
    landmarkMode: "all",
    minFaceSize: MIN_FACE_WIDTH,
    trackingEnabled: true,
  }).current;
  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);
  const runOnJS = useMemo(
    () =>
      Worklets.createRunOnJS(
        (facesJSON: string, frameWidth: number, frameHeight: number) => {
          const faces: Face[] = JSON.parse(facesJSON);
          const detectionDimensions = getDetectionFrameDimensions(
            frameWidth,
            frameHeight,
          );
          onFacesDetected(
            faces,
            detectionDimensions.width,
            detectionDimensions.height,
          );
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
      outputOrientation="preview"
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
  const challengeRef = useRef(new LivenessChallenge());

  const [phase, setPhase] = useState<LivenessPhase>("centering");
  const [guidance, setGuidance] = useState(
    "Center your face and look directly at the camera.",
  );
  const [failureMessage, setFailureMessage] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const phaseRef = useRef<LivenessPhase>("centering");
  const guidanceRef = useRef("Center your face and look directly at the camera.");
  const captureStartedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCurrentPhase = useCallback((nextPhase: LivenessPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const failChallenge = useCallback(
    (reason: string) => {
      challengeRef.current.fail(reason);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setCurrentPhase("failed");
      setFailureMessage(challengeRef.current.failureMessage);
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
      failChallenge(`This step timed out. ${guidanceRef.current} Please try again.`);
    }, CHALLENGE_TIMEOUT_MS);
  }, [clearTimeoutTimer, failChallenge]);

  const resetChallenge = useCallback(() => {
    challengeRef.current.reset();
    captureStartedRef.current = false;
    setFailureMessage("");
    guidanceRef.current = "Center your face and look directly at the camera.";
    setGuidance(guidanceRef.current);
    setCurrentPhase("centering");
    startTimeoutTimer();
  }, [setCurrentPhase, startTimeoutTimer]);

  const captureVerifiedPhoto = useCallback(async () => {
    if (captureStartedRef.current) return;

    captureStartedRef.current = true;
    setCurrentPhase("capturing");

    try {
      const camera = cameraRef.current;
      if (!camera) throw new Error("The camera is not ready.");

      const photo = await camera.takePhoto({
        flash: "off",
        enableShutterSound: false,
      });
      await onPhotoCaptured(getFileUri(photo.path));
      clearTimeoutTimer();
      challengeRef.current.completeCapture();
      setCurrentPhase("success");
      guidanceRef.current = "Liveness verified. Your photo is ready.";
      setGuidance(guidanceRef.current);
      timeoutRef.current = setTimeout(onClose, 900);
    } catch (error: unknown) {
      const reason =
        error instanceof Error
          ? error.message
          : "The photo could not be captured. Please retry.";
      console.error("Profile photo capture failed.", error);
      failChallenge(reason);
      captureStartedRef.current = false;
    }
  }, [
    clearTimeoutTimer,
    failChallenge,
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
      const challenge = challengeRef.current;
      if (
        challenge.phase === "capturing" ||
        challenge.phase === "success" ||
        challenge.phase === "failed"
      ) {
        return;
      }

      if (faces.length === 0) {
        const noFaceMessage =
          "No face detected. Keep your face visible in the guide.";
        if (guidanceRef.current !== noFaceMessage) {
          guidanceRef.current = noFaceMessage;
          setGuidance(noFaceMessage);
        }
        return;
      }

      const update = challenge.process(faces, frameWidth, frameHeight);
      if (update.phase === "failed") {
        clearTimeoutTimer();
        setCurrentPhase("failed");
        setFailureMessage(update.failureMessage ?? "Face check failed. Please retry.");
        return;
      }

      if (update.phase !== phaseRef.current) {
        setCurrentPhase(update.phase);
        const messages: Partial<Record<LivenessPhase, string>> = {
          centering: "Center your face and look directly at the camera.",
          "look-left": "Slowly look to your left.",
          "look-right": "Slowly look to your right.",
          blinking: "Please blink naturally.",
          returning: "Return to the center and look directly at the camera.",
          capturing: "Liveness checks passed. Capturing your photo...",
          success: "Liveness verified. Your photo is ready.",
        };
        const nextGuidance = messages[update.phase];
        if (nextGuidance) {
          guidanceRef.current = nextGuidance;
          setGuidance(nextGuidance);
        }
      }
      if (update.shouldCapture) {
        void captureVerifiedPhoto();
      }
    },
    [
      captureVerifiedPhoto,
      clearTimeoutTimer,
      setCurrentPhase,
    ],
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
    captureStartedRef.current = false;
    setFailureMessage("");
    const resumedPhase = challengeRef.current.retry();
    setCurrentPhase(resumedPhase);
    const retryInstructions: Partial<Record<LivenessPhase, string>> = {
      centering: "Center your face and look directly at the camera.",
      "look-left": "Please repeat the look-left movement.",
      "look-right": "Please repeat the look-right movement.",
      blinking: "Please blink naturally again.",
      returning: "Return to the center and look directly at the camera.",
      capturing: "Liveness checks passed. Capturing your photo...",
    };
    guidanceRef.current =
      retryInstructions[resumedPhase] ??
      "Continue the liveness check where it stopped.";
    setGuidance(guidanceRef.current);
    startTimeoutTimer();
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

  const steps = [
    "Center face",
    "Look left",
    "Look right",
    "Blink",
    "Return center",
    "Capture",
  ];
  const activeStepIndex =
    phase === "centering"
      ? 0
      : phase === "look-left"
        ? 1
        : phase === "look-right"
          ? 2
          : phase === "blinking"
            ? 3
            : phase === "returning"
              ? 4
              : 5;
  const instruction =
    phase === "failed"
      ? failureMessage
      : phase === "capturing"
        ? "Liveness checks passed. Capturing your photo..."
        : guidance;
  const displayedStepIndex =
    phase === "failed"
      ? challengeRef.current.failedAtPhase === "centering"
        ? 0
        : challengeRef.current.failedAtPhase === "look-left"
          ? 1
          : challengeRef.current.failedAtPhase === "look-right"
            ? 2
            : challengeRef.current.failedAtPhase === "blinking"
              ? 3
              : challengeRef.current.failedAtPhase === "returning"
                ? 4
                : 5
      : activeStepIndex;

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
                  Complete each step while keeping your face visible and inside
                  the guide.
                </Text>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressTitle}>
                  {phase === "success"
                    ? "All steps complete"
                    : `Step ${Math.min(displayedStepIndex + 1, steps.length)} of ${steps.length}`}
                </Text>
                <View style={styles.progressSteps}>
                  {steps.map((step, index) => (
                    <View
                      key={step}
                      accessibilityLabel={`${step}: ${
                        index < displayedStepIndex || phase === "success"
                          ? "complete"
                          : index === displayedStepIndex
                            ? "in progress"
                            : "not started"
                      }`}
                      style={[
                        styles.progressStep,
                        index < displayedStepIndex && styles.progressStepComplete,
                        index === displayedStepIndex &&
                          phase !== "failed" &&
                          phase !== "success" &&
                          styles.progressStepActive,
                        phase === "success" && styles.progressStepComplete,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.activeStepLabel}>
                  {steps[displayedStepIndex]}
                </Text>
              </View>

              <View
                accessibilityLabel="Face position guide"
                style={[
                  styles.faceGuide,
                  phase !== "failed" && styles.faceGuideActive,
                ]}
              />

              <View style={styles.footer}>
                <Text accessibilityLiveRegion="polite" style={styles.message}>
                  {instruction}
                </Text>
                {phase !== "failed" && phase !== "success" ? (
                  <ActivityIndicator
                    accessibilityLabel="Checking liveness step"
                    color="#FFFFFF"
                    style={styles.loader}
                  />
                ) : null}
                {phase === "success" ? (
                  <Text style={styles.successMark}>✓</Text>
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
  progressSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
  },
  progressTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  progressSteps: {
    width: "100%",
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  progressStep: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  progressStepActive: {
    backgroundColor: "#F0C75E",
  },
  progressStepComplete: {
    backgroundColor: "#54D68A",
  },
  activeStepLabel: {
    marginTop: 8,
    color: "#F0F3F5",
    fontSize: 12,
    fontWeight: "600",
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
  successMark: {
    marginTop: 6,
    color: "#54D68A",
    fontSize: 30,
    fontWeight: "700",
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
