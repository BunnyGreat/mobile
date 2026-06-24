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
    // Placeholder for camera/gallery action
    console.log("Upload front ID");
  };

  const handleUploadBack = () => {
    // Placeholder for camera/gallery action
    console.log("Upload back ID");
  };

  const handleSubmit = () => {
    if (onNext) onNext();
  };

  return (
    <View style={styles.container}>
      {/* Front ID Upload Card */}
      <View style={styles.uploadSectionLabel}>
        <Text style={styles.sectionTitle}>Front Side of ID</Text>
      </View>

      <TouchableOpacity
        style={[styles.uploadCard, frontUri && styles.uploadCardWithImage]}
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
          <View style={styles.uploadCardContent}>
            <Image
              source={require("../../../../../assets/icons/upload.png")}
              style={styles.uploadIcon}
              resizeMode="contain"
            />
            <Text style={styles.uploadPrompt}>Tap to upload</Text>
            <Text style={styles.uploadSubtext}>
              Supported formats: JPG, PNG
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Back ID Upload Card */}
      <View style={[styles.uploadSectionLabel, { marginTop: SPACING.lg }]}>
        <Text style={styles.sectionTitle}>Back Side of ID</Text>
      </View>

      <TouchableOpacity
        style={[styles.uploadCard, backUri && styles.uploadCardWithImage]}
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
          <View style={styles.uploadCardContent}>
            <Image
              source={require("../../../../../assets/icons/upload.png")}
              style={styles.uploadIcon}
              resizeMode="contain"
            />
            <Text style={styles.uploadPrompt}>Tap to upload</Text>
            <Text style={styles.uploadSubtext}>
              Supported formats: JPG, PNG
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleUploadFront}
        >
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleUploadBack}
        >
          <Text style={styles.actionButtonText}>Choose From Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Notice */}
      <View style={styles.verificationCard}>
        <View style={styles.verificationCardHeader}>
          <Image
            source={require("../../../../../assets/icons/info.png")}
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
            I certify that all information and documents submitted are authentic
            and belong to me.
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
          disabled={!checked || !frontUri || !backUri}
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
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    marginBottom: SPACING.md,
  },
  uploadCardWithImage: {
    borderStyle: "solid",
  },
  uploadCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    width: 32,
    height: 32,
    marginBottom: SPACING.md,
  },
  uploadPrompt: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  uploadSubtext: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  previewImage: {
    width: "100%",
    height: 140,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
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
