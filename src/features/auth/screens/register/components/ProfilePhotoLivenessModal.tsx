import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
  type CameraDevice,
} from "react-native-vision-camera";
import { File } from "expo-file-system";
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
const CAPTURE_TIMEOUT_MS = 30_000;
const MIN_FACE_WIDTH = 0.1;
const DIAGNOSTIC_INTERVAL_MS = 500;
const NO_FACE_GUIDANCE =
  "No face detected. Keep your face visible in the guide.";
const PHASE_GUIDANCE: Partial<Record<LivenessPhase, string>> = {
  centering: "Center your face and look directly at the camera.",
  "look-left": "Slowly look to your left.",
  "look-right": "Slowly look to your right.",
  blinking: "Look back at the camera and blink naturally.",
  returning: "Return to the center and look directly at the camera.",
  capturing: "Liveness checks passed. Capturing your photo...",
  success: "Liveness verified. Your photo is ready.",
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
> = ({
  cameraRef,
  device,
  isActive,
  onFacesDetected,
  onError,
}) => {
  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    cameraFacing: "front",
    performanceMode: "fast",
    classificationMode: "all",
    landmarkMode: "all",
    minFaceSize: MIN_FACE_WIDTH,
    trackingEnabled: true,
  }).current;
  const format = useCameraFormat(device, [{ fps: 30 }]);
  const fps: [number, number] | undefined = (() => {
    if (!format) return undefined;
    const maxFps = Math.min(format.maxFps, 30);
    const minFps = Math.min(maxFps, Math.max(format.minFps, 15));
    return [minFps, maxFps];
  })();
  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);
  const runOnJS = useMemo(
    () =>
      Worklets.createRunOnJS(
        (facesJSON: string, frameWidth: number, frameHeight: number) => {
          try {
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
          } catch (error: unknown) {
            onError(
              error instanceof Error
                ? error
                : new Error("Face detection results could not be read."),
            );
          }
        },
      ),
    [onError, onFacesDetected],
  );
  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      runOnJS(
        JSON.stringify(detectFaces(frame)),
        frame.width,
        frame.height,
      );
    },
    [detectFaces, runOnJS],
  );

  useEffect(() => stopListeners, [stopListeners]);

  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      format={format}
      fps={fps}
      lowLightBoost={device.supportsLowLightBoost ? true : undefined}
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
  const [appState, setAppState] = useState(
    AppState.currentState ?? "active",
  );
  const cameraRef = useRef<Camera>(null);
  const challengeRef = useRef(new LivenessChallenge());

  const [phase, setPhase] = useState<LivenessPhase>("centering");
  const [guidance, setGuidance] = useState(
    "Center your face and look directly at the camera.",
  );
  const [failureMessage, setFailureMessage] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraPaused, setCameraPaused] = useState(false);

  const phaseRef = useRef<LivenessPhase>("centering");
  const guidanceRef = useRef(
    "Center your face and look directly at the camera.",
  );
  const captureStartedRef = useRef(false);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLivenessLogAtRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  const setCurrentPhase = useCallback((nextPhase: LivenessPhase) => {
    if (!mountedRef.current) return;
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const failChallenge = useCallback(
    (reason: string) => {
      challengeRef.current.fail(reason);
      if (!mountedRef.current) return;
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

  const startTimeoutTimer = useCallback(
    (
      timeoutMs = CHALLENGE_TIMEOUT_MS,
      timeoutMessage = `This step timed out. ${guidanceRef.current} Please try again.`,
    ) => {
      clearTimeoutTimer();
      timeoutRef.current = setTimeout(() => {
        failChallenge(timeoutMessage);
      }, timeoutMs);
    },
    [clearTimeoutTimer, failChallenge],
  );

  const resetChallenge = useCallback(() => {
    challengeRef.current.reset();
    captureStartedRef.current = false;
    setFailureMessage("");
    guidanceRef.current = "Center your face and look directly at the camera.";
    setGuidance(guidanceRef.current);
    setCameraPaused(false);
    setCurrentPhase("centering");
    startTimeoutTimer();
  }, [setCurrentPhase, startTimeoutTimer]);

  const captureVerifiedPhoto = useCallback(async () => {
    if (captureStartedRef.current) return;

    captureStartedRef.current = true;
    setCurrentPhase("capturing");
    startTimeoutTimer(
      CAPTURE_TIMEOUT_MS,
      "Profile photo processing timed out. Please retry.",
    );

    try {
      const camera = cameraRef.current;
      if (!camera) throw new Error("The camera is not ready.");

      const photo = await camera.takePhoto({
        flash: "off",
        enableShutterSound: false,
      });
      const photoUri = getFileUri(photo.path);
      if (!mountedRef.current) {
        try {
          new File(photoUri).delete();
        } catch {
          if (__DEV__) {
            console.warn("Unable to clean up an abandoned profile capture.");
          }
        }
        return;
      }
      setCameraPaused(true);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (!mountedRef.current) {
        try {
          new File(photoUri).delete();
        } catch {
          if (__DEV__) {
            console.warn("Unable to clean up an abandoned profile capture.");
          }
        }
        return;
      }
      await onPhotoCaptured(photoUri);
      if (!mountedRef.current) return;
      if (challengeRef.current.phase !== "capturing") return;
      clearTimeoutTimer();
      challengeRef.current.completeCapture();
      setCurrentPhase("success");
      guidanceRef.current = "Liveness verified. Your photo is ready.";
      setGuidance(guidanceRef.current);
      timeoutRef.current = setTimeout(onClose, 900);
    } catch (error: unknown) {
      if (mountedRef.current) setCameraPaused(false);
      const reason =
        error instanceof Error
          ? error.message
          : "The photo could not be captured. Please retry.";
      if (__DEV__) {
        console.error("[Liveness] Profile photo capture failed.", {
          errorType: error instanceof Error ? error.name : typeof error,
        });
      }
      failChallenge(reason);
      captureStartedRef.current = false;
    }
  }, [
    clearTimeoutTimer,
    failChallenge,
    onClose,
    onPhotoCaptured,
    setCurrentPhase,
    startTimeoutTimer,
  ]);

  const handleDetectionError = useCallback(
    (error: Error) => {
      if (__DEV__) {
        console.error("[Liveness] Camera or face detection failed.", {
          errorType: error.name,
        });
      }
      failChallenge("Face detection stopped unexpectedly. Please retry.");
    },
    [failChallenge],
  );

  const handleFacesDetected = useCallback(
    (faces: Face[], frameWidth: number, frameHeight: number) => {
      if (!mountedRef.current) return;
      const challenge = challengeRef.current;
      if (
        challenge.phase === "capturing" ||
        challenge.phase === "success" ||
        challenge.phase === "failed"
      ) {
        return;
      }

      if (faces.length === 0) {
        const update = challenge.process([], frameWidth, frameHeight);
        if (__DEV__ && Date.now() - lastLivenessLogAtRef.current >= DIAGNOSTIC_INTERVAL_MS) {
          lastLivenessLogAtRef.current = Date.now();
          console.info("[Liveness Runtime]", {
            faceCount: 0,
            frameWidth,
            frameHeight,
            ...challenge.getDiagnostics(),
          });
        }
        if (update.phase === "failed") {
          clearTimeoutTimer();
          setCurrentPhase("failed");
          setFailureMessage(
            update.failureMessage ?? "We could not see your face. Please retry.",
          );
          return;
        }
        if (guidanceRef.current !== NO_FACE_GUIDANCE) {
          guidanceRef.current = NO_FACE_GUIDANCE;
          setGuidance(NO_FACE_GUIDANCE);
        }
        return;
      }

      if (guidanceRef.current === NO_FACE_GUIDANCE) {
        const currentGuidance = PHASE_GUIDANCE[challenge.phase];
        if (currentGuidance) {
          guidanceRef.current = currentGuidance;
          setGuidance(currentGuidance);
        }
      }

      const update = challenge.process(faces, frameWidth, frameHeight);
      if (__DEV__ && Date.now() - lastLivenessLogAtRef.current >= DIAGNOSTIC_INTERVAL_MS) {
        lastLivenessLogAtRef.current = Date.now();
        console.info("[Liveness Runtime]", {
          faceCount: faces.length,
          frameWidth,
          frameHeight,
          ...challenge.getDiagnostics(),
        });
      }
      if (update.phase === "failed") {
        clearTimeoutTimer();
        setCurrentPhase("failed");
        setFailureMessage(update.failureMessage ?? "Face check failed. Please retry.");
        return;
      }

      if (update.phase !== phaseRef.current) {
        if (__DEV__) {
          console.info("[Liveness] Challenge advanced.", {
            from: phaseRef.current,
            to: update.phase,
          });
        }
        setCurrentPhase(update.phase);
        const nextGuidance = PHASE_GUIDANCE[update.phase];
        if (nextGuidance) {
          guidanceRef.current = nextGuidance;
          setGuidance(nextGuidance);
        }
      }
      if (update.shouldCapture) {
        clearTimeoutTimer();
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
          if (__DEV__) {
            console.error("[Liveness] Camera permission request failed.", {
              errorType: error instanceof Error ? error.name : typeof error,
            });
          }
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
          if (__DEV__) {
            console.error("[Liveness] Camera permission request failed.", {
              errorType: error instanceof Error ? error.name : typeof error,
            });
          }
          setPermissionError("Camera permission could not be requested.");
        },
      );
    }
    captureStartedRef.current = false;
    setFailureMessage("");
    const resumedPhase = challengeRef.current.retry();
    setCameraPaused(false);
    setCurrentPhase(resumedPhase);
    const retryInstructions: Partial<Record<LivenessPhase, string>> = {
      centering: "Center your face and look directly at the camera.",
      "look-left": "Please repeat the look-left movement.",
      "look-right": "Please repeat the look-right movement.",
      blinking: "Look back at the camera and blink naturally again.",
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
      if (__DEV__) {
        console.error("[Liveness] Could not open app settings.", {
          errorType: error instanceof Error ? error.name : typeof error,
        });
      }
      setPermissionError("Settings could not be opened. Please open them manually.");
    });
  };

  const isPermissionDenied = !permission.hasPermission && permissionDenied;
  const cameraActive =
    visible &&
    appState === "active" &&
    permission.hasPermission &&
    !!device &&
    !cameraPaused &&
    phase !== "failed";
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
