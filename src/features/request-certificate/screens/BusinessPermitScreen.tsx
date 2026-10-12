import React, { useEffect, useState } from "react";
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
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppButton, AppInput, SelectField } from "../../../components";
import { useProfileStore } from "../../profile/store/profile.store";
import type { Profile } from "../../profile/types/profile.types";
import type { RootStackParamList } from "../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { BUSINESS_TYPES } from "../constants/businessPermitTypes";
import { CertificateSection } from "../components/common/CertificateSections";
import { ReadOnlyField } from "../components/common/ReadOnlyField";
import type { BusinessPermitFormValues } from "../types/businessPermit.types";
import { validateBusinessPermit } from "../services/businessPermitValidation.service";
import { useCertificateRequest } from "../hooks/useCertificateRequest";
import { buildBusinessPermitPayload } from "../utils/buildBusinessPermitPayload";

const initialValues: BusinessPermitFormValues = {
  businessName: "",
  natureOfBusiness: "",
  initialCapital: "",
  businessAddress: "",
  applicationType: "",
  businessOwnerFullName: "",
  homeAddress: "",
  contactNumber: "",
};

const getResidentName = (profile: Profile | null): string => {
  if (!profile) return "";
  return [
    profile.personalInformation.firstName,
    profile.personalInformation.middleName,
    profile.personalInformation.lastName,
    profile.personalInformation.suffix,
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");
};

const getResidentAddress = (profile: Profile | null): string => {
  if (!profile) return "";
  return [
    profile.residenceInformation.houseNumber,
    profile.residenceInformation.street,
    profile.residenceInformation.purok,
    profile.residenceInformation.barangay,
    profile.residenceInformation.municipality,
    profile.residenceInformation.province,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
};

const BusinessPermitScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BusinessPermit">>();
  const profile = useProfileStore((state) => state.profile);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const {
    errors: submissionErrors,
    isSubmitting,
    submitRequest,
  } = useCertificateRequest();
  const [values, setValues] = useState({
    ...initialValues,
    applicationType: route.params.applicationType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;

    setValues((current) => ({
      ...current,
      businessOwnerFullName:
        current.businessOwnerFullName || getResidentName(profile),
      homeAddress: current.homeAddress || getResidentAddress(profile),
      contactNumber:
        current.contactNumber ||
        profile.personalInformation.contactNumber ||
        profile.phoneNumber,
    }));
  }, [profile]);

  const updateField = <K extends keyof BusinessPermitFormValues>(
    field: K,
    value: BusinessPermitFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (submissionErrors.profile) {
      Alert.alert("Unable to Submit Request", submissionErrors.profile);
    }
  }, [submissionErrors.profile]);

  const handleSubmit = async () => {
    const nextErrors = validateBusinessPermit(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { requestFor } = buildBusinessPermitPayload(values);
    const requestId = await submitRequest(
      "Business Permit",
      undefined,
      requestFor,
      values,
    );
    if (!requestId) return;

    Alert.alert(
      "Request Submitted",
      "Your Business Permit request has been submitted successfully.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("MainTabs", { screen: "Status" }),
        },
      ],
    );
  };

  const fullName = getResidentName(profile);
  const residentialAddress = getResidentAddress(profile);
  const birthplace = profile?.personalInformation.birthplace?.trim() ?? "";
  const residentContact =
    profile?.personalInformation.contactNumber?.trim() ||
    profile?.phoneNumber?.trim() ||
    "";

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
        <View style={styles.headerTitleGroup}>
          <Ionicons
            name="storefront-outline"
            size={22}
            color={COLORS.primary}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Business Permit</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CertificateSection
          icon="user"
          title="Resident Information"
          subtitle="Read-only information from your registered profile"
          isFirst
        >
          <ReadOnlyField label="Full Name" value={fullName} />
          <ReadOnlyField label="Full Address" value={residentialAddress} />
          <View style={styles.row}>
            <View style={styles.rowHalf}>
              <ReadOnlyField
                label="Date of Birth"
                value={profile?.personalInformation.dateOfBirth ?? ""}
              />
            </View>
            <View style={styles.rowHalf}>
              <ReadOnlyField label="Birthplace" value={birthplace} />
            </View>
          </View>
          <ReadOnlyField label="Contact Number" value={residentContact} />
        </CertificateSection>

        <CertificateSection
          icon="briefcase"
          title="Business Information"
          subtitle="Enter the details for this business permit application."
        >
          <AppInput
            label="Business Name"
            value={values.businessName}
            onChangeText={(value) => updateField("businessName", value)}
            placeholder="Enter the business name"
            error={errors.businessName}
            required
          />

          <SelectField
            label="Nature of the Business"
            value={values.natureOfBusiness}
            options={BUSINESS_TYPES}
            onChange={(value) => updateField("natureOfBusiness", value)}
            error={errors.natureOfBusiness}
            required
          />

          <AppInput
            label="Initial Capital"
            value={values.initialCapital}
            onChangeText={(value) => updateField("initialCapital", value)}
            placeholder="Enter amount (e.g. 25000.00)"
            keyboardType="decimal-pad"
            maxLength={14}
            error={errors.initialCapital}
            required
          />

          <AppInput
            label="Business Address"
            value={values.businessAddress}
            onChangeText={(value) => updateField("businessAddress", value)}
            placeholder="Enter the business location"
            error={errors.businessAddress}
            required
          />

          <AppInput
            label="Business Owner's Full Name"
            value={values.businessOwnerFullName}
            onChangeText={(value) =>
              updateField("businessOwnerFullName", value)
            }
            placeholder="Enter the business owner's full name"
            error={errors.businessOwnerFullName}
            required
          />

          <AppInput
            label="Home Address"
            value={values.homeAddress}
            onChangeText={(value) => updateField("homeAddress", value)}
            placeholder="Enter the business owner's home address"
            error={errors.homeAddress}
            required
          />

          <AppInput
            label="Contact Number"
            value={values.contactNumber}
            onChangeText={(value) => updateField("contactNumber", value)}
            placeholder="Enter the business owner's contact number"
            keyboardType="phone-pad"
            error={errors.contactNumber}
            required
          />
        </CertificateSection>

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
    fontSize: FONT_SIZE.h18,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: SPACING.sm,
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
  submitSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
});

export default BusinessPermitScreen;
