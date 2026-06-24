import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import PersonalInformationForm from "../../../register/components/PersonalInformationForm";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleSubmit = (data: any) => {
    // UI-only placeholder
    console.log("Personal info submit (placeholder)", data);
    navigation.navigate("ResidenceInformation");
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.stepText}>STEP 2 OF 4</Text>
            <Text style={styles.progressText}>50% Complete</Text>
          </View>
          <View style={styles.progressBarRow}>
            <View
              style={[styles.progressSegment, styles.progressSegmentActive]}
            />
            <View
              style={[styles.progressSegment, styles.progressSegmentActive]}
            />
            <View style={styles.progressSegment} />
            <View
              style={[styles.progressSegment, styles.progressSegmentLast]}
            />
          </View>
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <Text style={styles.headerSubtitle}>
            Please provide your personal details
          </Text>
        </View>

        <View style={styles.formWrapper}>
          <PersonalInformationForm
            onSubmit={handleSubmit}
            onBack={() => navigation.goBack()}
          />
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeIconWrapper}>
            <Text style={{ fontSize: 18, color: COLORS.primary }}>🛡️</Text>
          </View>
          <Text style={styles.noticeText}>
            Your data is encrypted and protected under the Data Privacy Act of
            2012. We only use this information for official Barangay San Isidro
            services.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  inner: {
    paddingBottom: SPACING.giant || SPACING.xxxl,
  },
  centered: {
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZE.h24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
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
  progressSegmentLast: {
    backgroundColor: COLORS.border,
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
  photoSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  cameraButton: {
    position: "absolute",
    right: "31%",
    top: "42%",
    width: 33,
    height: 33,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  photoLabel: {
    marginTop: SPACING.md,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
  },
  photoActionsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  photoActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  photoActionPrimary: {
    backgroundColor: COLORS.primary,
  },
  photoActionSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoActionPrimaryText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  photoActionSecondaryText: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  formWrapper: {
    width: "100%",
  },
  noticeCard: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: "rgba(249, 246, 234, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(249, 232, 153, 0.5)",
    flexDirection: "row",
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  noticeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    lineHeight: FONT_SIZE.body14 * 1.6,
  },
});

export default PersonalInformationScreen;
