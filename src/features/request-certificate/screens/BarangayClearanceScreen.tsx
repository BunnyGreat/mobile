import React, { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { AppButton } from "../../../components";
import { useProfileStore } from "../../../features/profile/store/profile.store";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import { CLEARANCE_PURPOSES } from "../constants/clearancePurposes";
import {
  CertificateSection,
  RequiredDocuments,
} from "../components/common/CertificateSections";
import { ReadOnlyField } from "../components/common/ReadOnlyField";
import type { RootStackParamList } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CertificateSection
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
        </CertificateSection>

        <CertificateSection
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

          {errors.purpose ? (
            <Text style={styles.purposeError}>{errors.purpose}</Text>
          ) : null}
        </CertificateSection>

        <RequiredDocuments />

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
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.giant + SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.xxl + 4,
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
  purposeError: {
    marginTop: -SPACING.md,
    marginBottom: SPACING.md,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.danger,
  },
  submitSection: {
    marginTop: SPACING.xl,
  },
});

export default BarangayClearanceScreen;
