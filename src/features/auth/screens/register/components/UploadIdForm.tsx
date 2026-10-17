import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { File } from "expo-file-system";
import AppButton from "../../../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../../theme";
import IdPhotoCameraModal from "./IdPhotoCameraModal";
import {
  parsePickerTarget,
  PENDING_PICKER_KEY,
  restorePendingPickerResult,
  type PickerTarget,
} from "./idPhotoPicker.helpers";

import type { RegistrationDocuments } from "../types/register.types";

const MAX_IMAGE_DIMENSION = 1920;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type PickerImageAsset = {
  uri: string;
  width: number;
  height: number;
};

const removeTemporaryImage = (uri: string) => {
  try {
    new File(uri).delete();
  } catch {
    if (__DEV__) {
      console.warn("[ID Upload] Temporary image cleanup failed.");
    }
  }
};

type Props = {
  onNext?: (data: RegistrationDocuments) => void;
  onBack?: () => void;
  isLoading?: boolean;
};

const UploadIdForm: React.FC<Props> = ({ onNext, onBack, isLoading }) => {
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<PickerTarget | null>(null);
  const [isCameraCaptureVisible, setIsCameraCaptureVisible] = useState(false);
  const pickerInProgressRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setTargetError = (target: PickerTarget, message: string) => {
    if (target.side === "front") setFrontError(message);
    else setBackError(message);
  };

  const processSelectedImage = useCallback(
    async (asset: PickerImageAsset, target: PickerTarget) => {
      if (
        !asset.uri ||
        !Number.isFinite(asset.width) ||
        !Number.isFinite(asset.height) ||
        asset.width <= 0 ||
        asset.height <= 0
      ) {
        if (target.source === "camera" && asset.uri.startsWith("file://")) {
          removeTemporaryImage(asset.uri);
        }
        throw new Error("The selected image is unavailable or invalid.");
      }

      const resizeAction =
        Math.max(asset.width, asset.height) > MAX_IMAGE_DIMENSION
          ? [
              {
                resize:
                  asset.width >= asset.height
                    ? { width: MAX_IMAGE_DIMENSION }
                    : { height: MAX_IMAGE_DIMENSION },
              },
            ]
          : [];
      let processedUri: string | null = null;
      let accepted = false;
      try {
        const processedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          resizeAction,
          {
            compress: 0.82,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );
        processedUri = processedImage.uri;

        if (
          !processedImage.uri ||
          processedImage.width <= 0 ||
          processedImage.height <= 0
        ) {
          throw new Error("The selected image could not be processed.");
        }

        const imageSize = new File(processedImage.uri).size;
        if (!Number.isFinite(imageSize)) {
          throw new Error("The selected image size could not be read.");
        }
        if (imageSize > MAX_IMAGE_SIZE) {
          throw new Error("The image must be 5MB or less.");
        }

        if (!mountedRef.current) return;
        if (target.side === "front") setFrontUri(processedImage.uri);
        else setBackUri(processedImage.uri);
        setTargetError(target, "");
        accepted = true;
      } catch (error: unknown) {
        if (__DEV__) {
          console.warn("[ID Upload] Image processing failed.", {
            errorType: error instanceof Error ? error.name : typeof error,
          });
        }
        if (mountedRef.current) {
          setTargetError(
            target,
            "Could not process this image. Please retake it or choose another.",
          );
        }
      } finally {
        if (target.source === "camera" && asset.uri.startsWith("file://")) {
          removeTemporaryImage(asset.uri);
        }
        if (processedUri && !accepted) removeTemporaryImage(processedUri);
      }
    },
    [],
  );

  const processPickerResult = useCallback(
    async (
      result:
        | ImagePicker.ImagePickerResult
        | ImagePicker.ImagePickerErrorResult,
      target: PickerTarget,
    ) => {
      if ("code" in result) {
        if (__DEV__) {
          console.warn("[ID Upload] Image picker returned an error.", {
            errorCode: result.code,
          });
        }
        if (mountedRef.current) {
          setTargetError(
            target,
            "The image library could not return the photo. Please try again.",
          );
        }
        return;
      }
      if (result.canceled || !mountedRef.current) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        throw new Error("The selected image is unavailable or invalid.");
      }
      await processSelectedImage(
        { uri: asset.uri, width: asset.width, height: asset.height },
        target,
      );
    },
    [processSelectedImage],
  );

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    let active = true;

    const recoverPendingPickerResult = async () => {
      let rawTarget: string | null;
      try {
        rawTarget = await AsyncStorage.getItem(PENDING_PICKER_KEY);
      } catch (error: unknown) {
        if (__DEV__) {
          console.warn("[ID Upload] Unable to read pending picker state.", {
            errorType: error instanceof Error ? error.name : typeof error,
          });
        }
        return;
      }
      if (!rawTarget || !active || pickerInProgressRef.current) return;

      const target = parsePickerTarget(rawTarget);
      if (!target) {
        if (__DEV__) console.warn("[ID Upload] Pending picker target was invalid.");
        try {
          await AsyncStorage.removeItem(PENDING_PICKER_KEY);
        } catch (error: unknown) {
          if (__DEV__) {
            console.warn("[ID Upload] Unable to clear invalid picker state.", {
              errorType: error instanceof Error ? error.name : typeof error,
            });
          }
        }
        return;
      }

      pickerInProgressRef.current = true;
      setIsPickingImage(true);
      try {
        const result = await restorePendingPickerResult(() =>
          ImagePicker.getPendingResultAsync(),
        );
        if (!result) {
          if (active) {
            setTargetError(
              target,
              "The photo could not be restored. Please take the ID photo again.",
            );
          }
          if (__DEV__) {
            console.warn("[ID Upload] No pending result was available to restore.");
          }
          return;
        }
        await processPickerResult(result, target);
      } catch (error: unknown) {
        if (__DEV__) {
          console.warn("[ID Upload] Pending image recovery failed.", {
            errorType: error instanceof Error ? error.name : typeof error,
          });
        }
        if (active) {
          setTargetError(
            target,
            "The photo could not be restored. Please take the ID photo again.",
          );
        }
      } finally {
        try {
          await AsyncStorage.removeItem(PENDING_PICKER_KEY);
        } catch (error: unknown) {
          if (__DEV__) {
            console.warn("[ID Upload] Unable to clear pending picker state.", {
              errorType: error instanceof Error ? error.name : typeof error,
            });
          }
        }
        pickerInProgressRef.current = false;
        if (active) setIsPickingImage(false);
      }
    };

    void recoverPendingPickerResult();
    return () => {
      active = false;
    };
  }, [processPickerResult]);

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Gallery access is required to select ID photos.",
      );
      return false;
    }
    return true;
  };

  const pickImage = async (target: PickerTarget) => {
    if (pickerInProgressRef.current) return;
    pickerInProgressRef.current = true;
    if (mountedRef.current) setIsPickingImage(true);

    if (target.source === "camera") {
      setCameraTarget(target);
      setIsCameraCaptureVisible(true);
      return;
    }

    try {
      const hasPermission = await requestGalleryPermission();

      if (!hasPermission || !mountedRef.current) return;

      await AsyncStorage.setItem(PENDING_PICKER_KEY, JSON.stringify(target));
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
      });

      await processPickerResult(result, target);
    } catch (error: unknown) {
      if (__DEV__) {
        console.warn("[ID Upload] Image library launch failed.", {
          errorType: error instanceof Error ? error.name : typeof error,
        });
      }
      if (mountedRef.current) {
        setTargetError(
          target,
          "Could not open the image library. Please try again.",
        );
      }
    } finally {
      try {
        await AsyncStorage.removeItem(PENDING_PICKER_KEY);
      } catch (error: unknown) {
        if (__DEV__) {
          console.warn("[ID Upload] Unable to clear picker state.", {
            errorType: error instanceof Error ? error.name : typeof error,
          });
        }
      }
      pickerInProgressRef.current = false;
      if (mountedRef.current) setIsPickingImage(false);
    }
  };

  const closeCameraCapture = () => {
    setIsCameraCaptureVisible(false);
    setCameraTarget(null);
    pickerInProgressRef.current = false;
    if (mountedRef.current) setIsPickingImage(false);
  };

  const handleCameraPhotoCaptured = async (photo: PickerImageAsset) => {
    const target = cameraTarget;
    if (!target) {
      removeTemporaryImage(photo.uri);
      return;
    }
    await processSelectedImage(photo, target);
    closeCameraCapture();
  };

  const showUploadOptions = (
    title: string,
    side: PickerTarget["side"],
  ) => {
    if (pickerInProgressRef.current || isPickingImage || isLoading) return;
    Alert.alert(title, "Choose image source", [
      {
        text: "Gallery",
        onPress: () => pickImage({ side, source: "gallery" }),
      },
      {
        text: "Camera",
        onPress: () => pickImage({ side, source: "camera" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleUploadFront = () => {
    showUploadOptions("Upload Front Side of ID", "front");
  };

  const handleUploadBack = () => {
    showUploadOptions("Upload Back Side of ID", "back");
  };

  const handleSubmit = () => {
    if (isLoading || isPickingImage) {
      return;
    }

    const frontValidation = frontUri ? "" : "Front side of ID is required.";
    const backValidation = backUri ? "" : "Back side of ID is required.";
    const checkboxValidation = checked
      ? ""
      : "You must confirm that the information is true.";

    setFrontError(frontValidation);
    setBackError(backValidation);
    setCheckboxError(checkboxValidation);

    if (!frontValidation && !backValidation && !checkboxValidation) {
      if (onNext)
        onNext({
          frontIdUri: frontUri,
          backIdUri: backUri,
        });
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>STEP 4 OF 4</Text>
          <Text style={styles.progressText}>100% Complete</Text>
        </View>
        <View style={styles.progressBarRow}>
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
          <View
            style={[styles.progressSegment, styles.progressSegmentActive]}
          />
        </View>
      </View>

      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Upload Identification</Text>
        <Text style={styles.headerSubtitle}>
          Please upload a valid government-issued ID for identity verification.
        </Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationBox}>
        <Image
          source={require("../../../../../../assets/images/ScanId.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Scan Title + Subtitle (centered below illustration) */}
      <View style={styles.scanSection}>
        <Text style={styles.scanTitle}>Scan Your ID</Text>
        <Text style={styles.scanSubtitle}>
          Ensure your National ID or Voter's ID is{"\n"}clearly visible and
          within the frame.
        </Text>
      </View>

      {/* Front Side of ID */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Front Side of ID
          <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.uploadField, frontUri && styles.uploadFieldActive]}
          activeOpacity={0.8}
          onPress={handleUploadFront}
          disabled={isPickingImage || isLoading}
        >
          {frontUri ? (
            <Image
              source={{ uri: frontUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.uploadFieldContent}>
              <View style={styles.uploadIconWrapper}>
                <Image
                  source={require("../../../../../../assets/icons/upload.png")}
                  style={styles.uploadIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.uploadTitle}>Tap to Upload</Text>
              <Text style={styles.uploadHint}>
                Upload a clear photo of your ID
              </Text>
              <Text style={styles.uploadHelper}>JPG or PNG</Text>
            </View>
          )}
        </TouchableOpacity>
        {frontError ? <Text style={styles.errorText}>{frontError}</Text> : null}
      </View>

      {/* Back Side of ID */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Back Side of ID
          <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.uploadField, backUri && styles.uploadFieldActive]}
          activeOpacity={0.8}
          onPress={handleUploadBack}
          disabled={isPickingImage || isLoading}
        >
          {backUri ? (
            <Image
              source={{ uri: backUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.uploadFieldContent}>
              <View style={styles.uploadIconWrapper}>
                <Image
                  source={require("../../../../../../assets/icons/upload.png")}
                  style={styles.uploadIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.uploadTitle}>Tap to Upload</Text>
              <Text style={styles.uploadHint}>
                Upload a clear photo of your ID
              </Text>
              <Text style={styles.uploadHelper}>JPG or PNG</Text>
            </View>
          )}
        </TouchableOpacity>
        {backError ? <Text style={styles.errorText}>{backError}</Text> : null}
      </View>

      {isPickingImage ? (
        <View style={styles.processingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.processingText}>Processing image...</Text>
        </View>
      ) : null}

      {/* Accepted IDs Card */}
      <View style={styles.noticeCard}>
        <View style={styles.noticeIconWrapper}>
          <Image
            source={require("../../../../../../assets/icons/notice.png")}
            style={styles.noticeIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.noticeText}>
          Accepted IDs: National ID, Passport, Driver's License, or Barangay ID.
        </Text>
      </View>

      {/* Declaration Checkbox */}
      <View style={styles.checkboxSection}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          activeOpacity={0.8}
          onPress={() => {
            setChecked((prev) => !prev);
            if (!checked) setCheckboxError("");
          }}
        >
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I certify that all information provided is true and accurate. I
            understand that providing false information is a punishable offense
            under local ordinance.
          </Text>
        </TouchableOpacity>
        {checkboxError ? (
          <Text style={styles.errorText}>{checkboxError}</Text>
        ) : null}
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsRow}>
        <AppButton
          label="Create Account"
          onPress={handleSubmit}
          variant="primary"
          fullWidth
          disabled={
            isLoading || isPickingImage || !checked || !frontUri || !backUri
          }
          loading={isLoading}
          style={styles.nextButton}
        />
      </View>

      <TouchableOpacity onPress={onBack} style={styles.backButtonTouch}>
        <Text style={styles.backText}>← Back to Previous Step</Text>
      </TouchableOpacity>

      <View style={styles.securityFooter}>
        <Image
          source={require("../../../../../../assets/icons/shield-check.png")}
          style={styles.securityIcon}
          resizeMode="contain"
        />
        <Text style={styles.securityText}>256-bit Encrypted Connection</Text>
      </View>

      <Text style={styles.copyText}>
        © 2026 Barangay San Isidro. All rights reserved.
      </Text>

      <IdPhotoCameraModal
        visible={isCameraCaptureVisible}
        onClose={closeCameraCapture}
        onPhotoCaptured={handleCameraPhotoCaptured}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  uploadSectionLabel: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  headerSection: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h28 || 24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body16 * 1.5,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  uploadField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    minHeight: 170,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadFieldActive: {
    borderColor: COLORS.primary,
  },
  uploadFieldContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  uploadIcon: {
    width: 24,
    height: 24,
  },
  uploadTitle: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  uploadHint: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  uploadHelper: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
  },
  progressText: {
    color: COLORS.paragraph,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
  },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  previewImage: {
    width: "100%",
    height: 140,
  },
  illustrationBox: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  illustration: {
    width: "70%",
    height: "70%",
  },
  scanSection: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  scanTitle: {
    fontSize: FONT_SIZE.h24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  scanSubtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body14 * 1.6,
    textAlign: "center",
  },
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  securityIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.success,
  },
  securityText: {
    fontSize: FONT_SIZE.h16,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
  },
  required: {
    color: COLORS.danger,
  },
  errorText: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  processingText: {
    color: COLORS.paragraph,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
  },
  noticeCard: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: "rgba(225, 227, 228, 1)",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  noticeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  noticeIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  noticeText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body14 * 1.6,
    flexShrink: 1,
  },
  checkboxSection: {
    marginBottom: SPACING.lg,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.white,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body14 * 1.6,
  },
  actionsRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  nextButton: {
    borderRadius: 16,
  },
  backButtonTouch: {
    marginBottom: SPACING.lg,
    alignSelf: "center",
  },
  backText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  copyText: {
    textAlign: "center",
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});

export default UploadIdForm;
