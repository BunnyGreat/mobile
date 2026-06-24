import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import AppButton from "../../../../../components/ui/AppButton";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../../theme";

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

const UploadIdForm: React.FC<Props> = ({ onNext, onBack }) => {
  const [idUri, setIdUri] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleUploadId = () => {
    // Placeholder for camera/gallery action
    console.log("Upload ID");
  };

  const handleSubmit = () => {
    if (onNext) onNext();
  };

  return (
    <View style={styles.container}>
      {/* Upload Document Label */}
      <View style={styles.uploadSectionLabel}>
        <Text style={styles.sectionTitle}>UPLOAD DOCUMENT</Text>
      </View>

      {/* ID Upload Card */}
      <TouchableOpacity
        style={[styles.uploadCard, idUri && styles.uploadCardWithImage]}
        activeOpacity={0.8}
        onPress={handleUploadId}
      >
        {idUri ? (
          <Image
            source={{ uri: idUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.uploadCardContent}>
            <View style={styles.uploadIconContainer}>
              <Image
                source={require("../../../../../../assets/icons/upload.png")}
                style={styles.uploadIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.uploadPrompt}>Click to upload</Text>
            <Text style={styles.uploadSubtext}>
              or drag and drop your scanned ID{"\n"}(JPG, PNG, PDF)
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Verification Notice */}
      <View style={styles.verificationCard}>
        <View style={styles.verificationCardHeader}>
          <Image
            source={require("../../../../../../assets/icons/shield-check.png")}
            style={styles.verificationIcon}
            resizeMode="contain"
          />
          <Text style={styles.verificationTitle}>Important</Text>
        </View>
        <Text style={styles.verificationText}>
          Ensure that all text and information on your ID are clearly visible
          before submission.
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

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <AppButton
          label="Create Account"
          onPress={handleSubmit}
          variant="primary"
          fullWidth
          disabled={!checked || !idUri}
        />
      </View>

      <TouchableOpacity
        style={styles.backButtonContainer}
        activeOpacity={0.8}
        onPress={onBack}
      >
        <Text style={styles.backText}>← Back to Previous Step</Text>
      </TouchableOpacity>
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
  uploadCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    marginBottom: SPACING.lg,
  },
  uploadCardWithImage: {
    borderStyle: "solid",
  },
  uploadCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  uploadIcon: {
    width: 24,
    height: 24,
  },
  uploadPrompt: {
    fontSize: FONT_SIZE.h20,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  uploadSubtext: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: FONT_SIZE.body12 * 1.5,
  },
  previewImage: {
    width: "100%",
    height: 140,
  },
  verificationCard: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  verificationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  verificationIcon: {
    width: 20,
    height: 20,
  },
  verificationTitle: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  verificationText: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body12 * 1.5,
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
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body12 * 1.6,
  },
  actionsRow: {
    marginBottom: SPACING.md,
  },
  backButtonContainer: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  backText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
});

export default UploadIdForm;
