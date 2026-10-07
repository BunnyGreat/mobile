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
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { AppButton, AppInput } from "../../../components";
import { useProfileStore } from "../../../features/profile/store/profile.store";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import type {
  CertificateFamilyInformation,
} from "../services/barangayClearance.service";
import { INDIGENCY_PURPOSES } from "../constants/indigencyPurposes";
import {
  CertificateSection,
  RequiredDocuments,
} from "../components/common/CertificateSections";
import { ReadOnlyField } from "../components/common/ReadOnlyField";
import type { RootStackParamList } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const CertificateOfIndigencyScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, "CertificateOfIndigency">>();
  const isRelativeRequest = route.params?.mode === "relative";
  const profile = useProfileStore((state) => state.profile);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const { purpose, setPurpose, errors, isSubmitting, submitRequest } =
    useCertificateRequest();
  const [familyName, setFamilyName] = React.useState("");
  const [familyRelationship, setFamilyRelationship] = React.useState("");
  const [whereItWillBeUsed, setWhereItWillBeUsed] = React.useState("");

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (errors.profile) {
      Alert.alert("Unable to Submit Request", errors.profile);
    }
  }, [errors.profile]);

  const fullName = profile
    ? [
        profile.personalInformation.firstName,
        profile.personalInformation.middleName,
        profile.personalInformation.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  const address = profile
    ? `${profile.residenceInformation.houseNumber} ${profile.residenceInformation.street}, ${profile.residenceInformation.purok}, ${profile.residenceInformation.barangay}, ${profile.residenceInformation.municipality}, ${profile.residenceInformation.province}`
    : "";
  const customPurposeSelected = !INDIGENCY_PURPOSES.some(
    (purposeOption) => purposeOption === purpose,
  );

  const handleSubmit = async () => {
    const familyInformation: CertificateFamilyInformation | undefined =
      isRelativeRequest
        ? {
            name: familyName,
            relationship: familyRelationship,
            purpose,
            whereItWillBeUsed,
          }
        : undefined;
    const requestId = await submitRequest(
      "Certificate of Indigency",
      familyInformation,
      isRelativeRequest ? "relative" : "self",
    );
    if (!requestId) {
      return;
    }

    Alert.alert(
      "Request Submitted",
      "Your Certificate of Indigency request has been submitted successfully.",
      [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("MainTabs", { screen: "Status" }),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={COLORS.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRelativeRequest ? "Pang-kamaganak" : "Certificate of Indigency"}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CertificateSection
          icon="user"
          title="Application Information"
          subtitle="Pre-filled from your registered profile"
          isFirst
        >
          <ReadOnlyField label="Full Name" value={fullName} />
          <ReadOnlyField label="Complete Address" value={address} />
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <ReadOnlyField
                label="Date of Birth"
                value={profile?.personalInformation.dateOfBirth ?? ""}
              />
            </View>
            <View style={styles.rowHalf}>
              <ReadOnlyField
                label="Place of Birth"
                value={profile?.personalInformation.birthplace ?? ""}
              />
            </View>
          </View>
          <ReadOnlyField
            label="Contact Number"
            value={profile?.personalInformation.contactNumber ?? ""}
          />
        </CertificateSection>

        {isRelativeRequest ? (
          <CertificateSection
            icon="users"
            title="Family Information"
            subtitle="Information about the family member this certificate is for."
          >
            <AppInput
              label="Name of the Person"
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Enter the person's name"
              error={errors.familyName}
              required
            />
            <AppInput
              label="Relationship"
              value={familyRelationship}
              onChangeText={setFamilyRelationship}
              placeholder="Enter your relationship to the person"
              error={errors.relationship}
              required
            />
            <View>
              <Text style={styles.fieldLabel}>Purpose</Text>
              <View style={styles.purposeChips}>
                {INDIGENCY_PURPOSES.map((purposeOption) => {
                  const isSelected = purpose === purposeOption;
                  return (
                    <TouchableOpacity
                      key={purposeOption}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      activeOpacity={0.7}
                      onPress={() => setPurpose(purposeOption)}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
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
                value={customPurposeSelected ? purpose : ""}
                onChangeText={setPurpose}
                placeholder="Enter a custom purpose..."
                error={errors.purpose}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <AppInput
              label="Where it will be used"
              value={whereItWillBeUsed}
              onChangeText={setWhereItWillBeUsed}
              placeholder="Explain where the certificate will be used"
              error={errors.whereItWillBeUsed}
              required
            />
          </CertificateSection>
        ) : (
          <CertificateSection
            icon="file-text"
            title="Purpose"
            subtitle="Select a purpose or enter a custom purpose."
          >
            <View style={styles.purposeChips}>
              {INDIGENCY_PURPOSES.map((purposeOption) => {
                const isSelected = purpose === purposeOption;
                return (
                  <TouchableOpacity
                    key={purposeOption}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.7}
                    onPress={() => setPurpose(purposeOption)}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
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
              value={customPurposeSelected ? purpose : ""}
              onChangeText={setPurpose}
              placeholder="Enter a custom purpose..."
              error={errors.purpose}
              containerStyle={{ marginBottom: 0 }}
            />
          </CertificateSection>
        )}

        <RequiredDocuments />

        <View style={styles.submitSection}>
          <AppButton
            label="Submit Request"
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
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
    flex: 1,
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
    paddingBottom: SPACING.lg,
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
  fieldLabel: {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
    letterSpacing: -0.1,
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
  submitSection: {
    marginTop: SPACING.xl,
  },
});

export default CertificateOfIndigencyScreen;
