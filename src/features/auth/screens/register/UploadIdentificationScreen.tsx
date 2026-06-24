import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import UploadIdForm from "./components/UploadIdForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const UploadIdentificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    console.log("Upload identification submit (placeholder)");
    navigation.navigate("RegistrationSuccess");
  };

  const handleBack = () => {
    navigation.navigate("ResidenceInformation");
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
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

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../../assets/icons/id-card.png")}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Upload Identification</Text>
          <Text style={styles.headerSubtitle}>
            Please upload a valid government-issued ID for verification.
          </Text>
        </View>
      </View>

      {/* Accepted IDs Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Image
            source={require("../../../../assets/icons/shield.png")}
            resizeMode="contain"
            style={styles.infoCardIcon}
          />
          <Text style={styles.infoCardTitle}>Accepted IDs</Text>
        </View>
        <Text style={styles.infoCardItem}>• National ID (PhilSys)</Text>
        <Text style={styles.infoCardItem}>• Voter's ID</Text>
        <Text style={styles.infoCardItem}>• Driver's License</Text>
        <Text style={styles.infoCardItem}>• Passport</Text>
        <Text style={styles.infoCardItem}>• PhilHealth ID</Text>
      </View>

      {/* Upload Form */}
      <UploadIdForm onNext={handleNext} onBack={handleBack} />

      {/* Privacy Notice */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Data Protection</Text>
        <Text style={styles.privacyText}>
          Your uploaded documents are encrypted and securely stored. These
          documents are used only for identity verification and residency
          validation.
        </Text>
      </View>

      {/* Security Footer */}
      <View style={styles.securityFooter}>
        <Text style={styles.securityText}>🔒 256-bit Encrypted Connection</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
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
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: SPACING.lg,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h20,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  infoCard: {
    backgroundColor: "rgba(249, 246, 234, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(249, 232, 153, 0.5)",
    borderRadius: SPACING.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoCardIcon: {
    width: 24,
    height: 24,
  },
  infoCardTitle: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  infoCardItem: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    marginBottom: SPACING.xs,
    lineHeight: FONT_SIZE.body12 * 1.5,
  },
  privacyCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  privacyTitle: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
  },
  privacyText: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body12 * 1.6,
  },
  securityFooter: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  securityText: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.primary,
  },
});

export default UploadIdentificationScreen;
