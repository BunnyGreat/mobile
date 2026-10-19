import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
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
  type PhotoFile,
} from "react-native-vision-camera";
import { File } from "expo-file-system";

type CapturedPhoto = {
  uri: string;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhotoCaptured: (photo: CapturedPhoto) => Promise<void>;
};

const photoFileUri = (path: string) =>
  path.startsWith("file://") ? path : `file://${path}`;

const deletePhotoFile = (uri: string) => {
  try {
    new File(uri).delete();
  } catch {
    if (__DEV__) console.warn("[ID Upload] Temporary camera photo cleanup failed.");
  }
};

const IdPhotoCameraModal: React.FC<Props> = ({
  visible,
  onClose,
  onPhotoCaptured,
}) => {
  const cameraRef = useRef<Camera>(null);
  const mountedRef = useRef(true);
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1920, height: 1080 } },
  ]);
  const permission = useCameraPermission();
  const [appState, setAppState] = useState(AppState.currentState ?? "active");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUsingPhoto, setIsUsingPhoto] = useState(false);

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

  useEffect(() => {
    if (!visible || permission.hasPermission) return undefined;
    let active = true;
    permission
      .requestPermission()
      .then((granted) => {
        if (active) setPermissionDenied(!granted);
      })
      .catch((error: unknown) => {
        if (__DEV__) {
          console.error("[ID Upload] Camera permission request failed.", {
            errorType: error instanceof Error ? error.name : typeof error,
          });
        }
        if (active) setPermissionError("Camera permission could not be requested.");
      });
    return () => {
      active = false;
    };
  }, [permission.hasPermission, permission.requestPermission, visible]);

  useEffect(() => {
    if (!visible) {
      setCapturedPhoto(null);
      setCameraError("");
      setPermissionError("");
      setPermissionDenied(false);
      setIsCapturing(false);
      setIsUsingPhoto(false);
    }
  }, [visible]);

  const close = useCallback(() => {
    if (capturedPhoto) deletePhotoFile(photoFileUri(capturedPhoto.path));
    setCapturedPhoto(null);
    setCameraError("");
    onClose();
  }, [capturedPhoto, onClose]);

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    setCameraError("");
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
        enableShutterSound: false,
      });
      if (!mountedRef.current) {
        deletePhotoFile(photoFileUri(photo.path));
        return;
      }
      setCapturedPhoto(photo);
    } catch (error: unknown) {
      if (__DEV__) {
        console.error("[ID Upload] ID photo capture failed.", {
          errorType: error instanceof Error ? error.name : typeof error,
        });
      }
      if (mountedRef.current) {
        setCameraError("The photo could not be captured. Please try again.");
      }
    } finally {
      if (mountedRef.current) setIsCapturing(false);
    }
  };

  const usePhoto = async () => {
    if (!capturedPhoto || isUsingPhoto) return;
    setIsUsingPhoto(true);
    setCameraError("");
    try {
      await onPhotoCaptured({
        uri: photoFileUri(capturedPhoto.path),
        width: capturedPhoto.width,
        height: capturedPhoto.height,
      });
      if (mountedRef.current) setCapturedPhoto(null);
    } catch (error: unknown) {
      if (__DEV__) {
        console.error("[ID Upload] Captured ID photo could not be processed.", {
          errorType: error instanceof Error ? error.name : typeof error,
        });
      }
      if (mountedRef.current) {
        setCameraError("The photo could not be processed. Please retake it.");
      }
    } finally {
      if (mountedRef.current) setIsUsingPhoto(false);
    }
  };

  const retakePhoto = () => {
    if (capturedPhoto) deletePhotoFile(photoFileUri(capturedPhoto.path));
    setCapturedPhoto(null);
    setCameraError("");
  };

  const cameraActive =
    visible &&
    appState === "active" &&
    permission.hasPermission &&
    !!device &&
    !capturedPhoto;
  const permissionBlocked = !permission.hasPermission && permissionDenied;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <View style={styles.screen}>
        {permission.hasPermission && device ? (
          <>
            {!capturedPhoto ? (
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                format={format}
                isActive={cameraActive}
                photo={true}
                onError={(error) => {
                  if (__DEV__) {
                    console.error("[ID Upload] Camera failed.", {
                      errorType: error.name,
                    });
                  }
                  setCameraError("The camera is unavailable. Please try again.");
                }}
              />
            ) : (
              <Image
                source={{ uri: photoFileUri(capturedPhoto.path) }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />
            )}
            <View style={styles.overlay}>
              <View style={styles.header}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Close ID camera"
                  onPress={close}
                  disabled={isUsingPhoto}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Take an ID photo</Text>
                <Text style={styles.subtitle}>
                  Keep the full ID inside the frame and make sure the text is clear.
                </Text>
              </View>
              <View style={styles.footer}>
                {cameraError ? (
                  <Text accessibilityRole="alert" style={styles.errorText}>
                    {cameraError}
                  </Text>
                ) : null}
                {capturedPhoto ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={retakePhoto}
                      disabled={isUsingPhoto}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.secondaryButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={usePhoto}
                      disabled={isUsingPhoto}
                      style={styles.primaryButton}
                    >
                      {isUsingPhoto ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Use photo</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Capture ID photo"
                    onPress={capturePhoto}
                    disabled={isCapturing}
                    style={styles.captureButton}
                  >
                    {isCapturing ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <View style={styles.captureButtonInner} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.permissionContent}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close ID camera"
              onPress={close}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Camera access needed</Text>
            <Text style={styles.permissionMessage}>
              {permission.hasPermission
                ? "A rear-facing camera is not available on this device."
                : permissionError ||
                  (permissionBlocked
                    ? "Camera access is required to take an ID photo."
                    : "Requesting camera permission...")}
            </Text>
            {permissionBlocked ? (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={() =>
                  Linking.openSettings().catch(() =>
                    setPermissionError("Settings could not be opened. Please open them manually."),
                  )
                }
              >
                <Text style={styles.primaryButtonText}>Open Settings</Text>
              </TouchableOpacity>
            ) : !permission.hasPermission ? (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={() => {
                  setPermissionError("");
                  permission.requestPermission().then(
                    (granted) => setPermissionDenied(!granted),
                    () => setPermissionError("Camera permission could not be requested."),
                  );
                }}
              >
                <Text style={styles.primaryButtonText}>Try again</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 36,
  },
  header: {
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    padding: 10,
    borderRadius: 8,
  },
  captureButton: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderRadius: 38,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  primaryButton: {
    minWidth: 132,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#155EEF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    minWidth: 112,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
    backgroundColor: "#111111",
  },
  permissionMessage: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
});

export default IdPhotoCameraModal;
