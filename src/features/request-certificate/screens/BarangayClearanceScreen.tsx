import React, { useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { AppButton, AppInput, ScreenContainer } from "../../../components";
import { useProfileStore } from "../../../features/profile/store/profile.store";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import { CLEARANCE_PURPOSES } from "../constants/clearancePurposes";
import { CLEARANCE_REQUIREMENTS } from "../constants/requirements";
import { ReadOnlyField } from "../components/common/ReadOnlyField";
import type { RootStackParamList } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const SectionBlock: React.FC<{
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isFirst?: boolean;
}> = ({ icon, title, subtitle, children, isFirst = false }) => (
  <View style={[styles.sectionBlock, isFirst && styles.sectionBlockFirst]}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBadge}>
        <Feather name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={styles.sectionTitleGroup}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => <ReadOnlyField label={label} value={value} />;

const BarangayClearanceScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfileStore((state) => state.profile);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const { purpose, setPurpose, errors, isSubmitting, submitRequest } =
    useCertificateRequest();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const address = profile
    ? `${profile.residenceInformation.houseNumber} ${profile.residenceInformation.street}, ${profile.residenceInformation.purok}, ${profile.residenceInformation.barangay}, ${profile.residenceInformation.municipality}, ${profile.residenceInformation.province}`
    : "";

  const fullName = profile
    ? [
        profile.personalInformation.firstName,
        profile.personalInformation.middleName,
        profile.personalInformation.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={COLORS.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barangay Clearance</Text>
      </View>

      <ScreenContainer scrollable contentContainerStyle={styles.scrollContent}>
        <SectionBlock
          icon="user"
          title="Applicant Information"
          subtitle="Pre-filled from your registered profile"
          isFirst={true}
        >
          <InfoRow label="Full Name" value={fullName} />
          <InfoRow label="Complete Address" value={address} />
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <InfoRow
                label="Date of Birth"
                value={profile?.personalInformation.dateOfBirth ?? ""}
              />
            </View>
            <View style={styles.rowHalf}>
              <InfoRow
                label="Place of Birth"
                value={profile?.personalInformation.birthplace ?? ""}
              />
            </View>
          </View>
          <InfoRow
            label="Contact Number"
            value={profile?.personalInformation.contactNumber ?? ""}
          />
        </SectionBlock>

        <SectionBlock
          icon="file-text"
          title="Purpose of Request"
          subtitle="What will you use this clearance for?"
        >
          <View style={styles.purposeChips}>
            {CLEARANCE_PURPOSES.map((purposeOption) => {
              const isSelected = purpose === purposeOption;
              return (
                <TouchableOpacity
                  key={purposeOption}
                  activeOpacity={0.7}
                  onPress={() => setPurpose(purposeOption)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {purposeOption}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppInput
            label="Custom Purpose"
            value={purpose}
            onChangeText={setPurpose}
            multiline
            placeholder="Enter the purpose of this request..."
            error={errors.purpose}
            containerStyle={{ marginBottom: 0 }}
            inputStyle={styles.purposeInput}
          />
        </SectionBlock>

        <SectionBlock icon="check-circle" title="Required Documents">
          {CLEARANCE_REQUIREMENTS.length ? (
            <View style={styles.requirementsList}>
              {CLEARANCE_REQUIREMENTS.map((requirement, index) => (
                <View key={requirement} style={styles.requirementRow}>
                  <View style={styles.requirementNumber}>
                    <Text style={styles.requirementNumberText}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyRequirements}>
              <Feather
                name="check-circle"
                size={24}
                color={COLORS.success}
                style={{ marginBottom: SPACING.sm }}
              />
              <Text style={styles.emptyRequirementsText}>
                No additional documents required
              </Text>
            </View>
          )}
        </SectionBlock>

        <View style={styles.submitSection}>
          <AppButton
            label="Submit Request"
            onPress={async () => {
              const requestId = await submitRequest();
              if (!requestId) {
                return;
              }

              Alert.alert(
                "Request Submitted",
                "Your Barangay Clearance request has been submitted successfully.",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      navigation.navigate("MainTabs", { screen: "Status" }),
                  },
                ],
              );
            }}
            disabled={isSubmitting}
            size="lg"
          />
        </View>
      </ScreenContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    paddingRight: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.h18,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  scrollContent: {
    paddingBottom: SPACING.giant,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xxl + 4,
  },
  sectionBlock: {
    marginBottom: SPACING.xxl + 4,
  },
  sectionBlockFirst: {
    marginTop: SPACING.sm,
  },
  sectionContent: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}0D`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.h16,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    marginTop: 2,
    lineHeight: 17,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  rowHalf: {
    flex: 1,
  },
  purposeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.heading,
    lineHeight: 17,
  },
  chipTextSelected: {
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.white,
  },
  purposeInput: {
    textAlignVertical: "top",
  },
  requirementsList: {
    gap: SPACING.md,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: SPACING.md,
  },
  requirementNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}12`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
    marginTop: 0,
  },
  requirementNumberText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  requirementText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: 20,
    paddingTop: 2,
  },
  emptyRequirements: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyRequirementsText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.placeholder,
    textAlign: "center",
  },
  submitSection: {
    marginTop: SPACING.xl,
  },
});

export default BarangayClearanceScreen;
