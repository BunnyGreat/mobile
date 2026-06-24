import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import AppButton from "../../../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../../theme";

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

const UploadIdForm: React.FC<Props> = ({ onNext, onBack }) => {
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleUploadFront = () => {
    console.log("Upload front ID");
  };

  const handleUploadBack = () => {
    console.log("Upload back ID");
  };

  const handleSubmit = () => {
    if (onNext) onNext();
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
        <Text style={styles.fieldLabel}>Front Side of ID</Text>
        <TouchableOpacity
          style={[styles.uploadField, frontUri && styles.uploadFieldActive]}
          activeOpacity={0.8}
          onPress={handleUploadFront}
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
      </View>

      {/* Back Side of ID */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Back Side of ID</Text>
        <TouchableOpacity
          style={[styles.uploadField, backUri && styles.uploadFieldActive]}
          activeOpacity={0.8}
          onPress={handleUploadBack}
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
      </View>

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
          onPress={() => setChecked(!checked)}
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
      </View>

      {/* Bottom Actions */}
      <View style={styles.actionsRow}>
        <AppButton
          label="Create Account"
          onPress={handleSubmit}
          variant="primary"
          fullWidth
          disabled={!checked || !frontUri || !backUri}
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
