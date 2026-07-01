import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import EditProfileForm, {
  EditProfileFormValues,
} from "../components/EditProfileForm";
import ProfilePhotoPicker from "../components/ProfilePhotoPicker";
import SaveButton from "../components/SaveButton";
import { useProfile } from "../hooks/useProfile";
import { useProfilePhoto } from "../hooks/useProfilePhoto";
import { useRefreshProfile } from "../hooks/useRefreshProfile";
import { useProfileStore } from "../store/profile.store";
import { updateProfile, updateProfilePhoto } from "../services/profile.service";
import { saveProfileCache } from "../services/profileCache.service";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from "../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const EditProfileScreen: React.FC = () => {
  const { profile, loading, refresh } = useProfile();
  const navigation = useNavigation();
  const updateProfileState = useProfileStore((state) => state.updateProfile);
  const {
    photoUri,
    pickImage,
    loading: photoLoading,
  } = useProfilePhoto(profile?.profilePhotoUrl);
  const { refreshing, refresh: onRefresh } = useRefreshProfile(refresh);
  const [formValues, setFormValues] = useState<EditProfileFormValues>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    dateOfBirth: "",
    birthplace: "",
    gender: "",
    civilStatus: "",
    houseNumber: "",
    street: "",
    subdivision: "",
    barangay: "",
    municipality: "",
    province: "",
  });

  useEffect(() => {
    if (profile) {
      setFormValues({
        firstName: profile.personalInformation.firstName,
        middleName: profile.personalInformation.middleName ?? "",
        lastName: profile.personalInformation.lastName,
        email: profile.email,
        contactNumber: profile.phoneNumber,
        dateOfBirth: profile.personalInformation.dateOfBirth,
        birthplace: profile.personalInformation.birthplace ?? "",
        gender: profile.personalInformation.gender,
        civilStatus: profile.personalInformation.civilStatus,
        houseNumber: profile.residenceInformation.houseNumber,
        street: profile.residenceInformation.street,
        subdivision: profile.residenceInformation.purok,
        barangay: profile.residenceInformation.barangay,
        municipality: profile.residenceInformation.municipality,
        province: profile.residenceInformation.province,
      });
    }
  }, [profile]);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EditProfileFormValues, string>>
  >({});
  const [saving, setSaving] = useState(false);

  const disabled = loading || photoLoading || saving || !profile;

  const handleChangeValue = <T extends keyof EditProfileFormValues>(
    field: T,
    value: EditProfileFormValues[T],
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
  };

  const safeTrim = (value?: string | null): string => (value ?? "").trim();

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EditProfileFormValues, string>> = {};
    const trimmedContact = safeTrim(formValues.contactNumber);
    const phoneDigits = trimmedContact.replace(/[^0-9+]/g, "");

    if (!safeTrim(formValues.firstName)) {
      errors.firstName = "First name is required.";
    }

    if (!safeTrim(formValues.lastName)) {
      errors.lastName = "Last name is required.";
    }

    if (!trimmedContact) {
      errors.contactNumber = "Contact number is required.";
    } else if (!/^\+?[0-9]{7,15}$/.test(phoneDigits)) {
      errors.contactNumber = "Enter a valid contact number.";
    }

    if (!formValues.gender) {
      errors.gender = "Select your gender.";
    }

    if (!formValues.civilStatus) {
      errors.civilStatus = "Select your civil status.";
    }

    if (!safeTrim(formValues.houseNumber)) {
      errors.houseNumber = "House number is required.";
    }

    if (!safeTrim(formValues.street)) {
      errors.street = "Street is required.";
    }

    if (!safeTrim(formValues.barangay)) {
      errors.barangay = "Barangay is required.";
    }

    if (!safeTrim(formValues.municipality)) {
      errors.municipality = "Municipality is required.";
    }

    if (!safeTrim(formValues.province)) {
      errors.province = "Province is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!profile || disabled) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const hasNewPhoto = Boolean(
        photoUri && profile.profilePhotoUrl !== photoUri,
      );

      let profilePhotoUrl = profile.profilePhotoUrl ?? null;
      let profilePhotoPath = profile.profilePhotoPath ?? null;

      if (hasNewPhoto && photoUri) {
        const uploadResult = await updateProfilePhoto(
          photoUri,
          profile.profilePhotoPath,
        );
        profilePhotoUrl = uploadResult.profilePhotoUrl;
        profilePhotoPath = uploadResult.profilePhotoPath;
      }

      const updatedProfile = await updateProfile({
        firstName: formValues.firstName,
        middleName: formValues.middleName || null,
        birthplace: formValues.birthplace || "",
        lastName: formValues.lastName,
        contactNumber: formValues.contactNumber,
        gender: formValues.gender as "male" | "female" | "other",
        civilStatus: formValues.civilStatus as
          | "single"
          | "married"
          | "widowed"
          | "separated"
          | "divorced",
        houseNumber: formValues.houseNumber || "",
        street: formValues.street || "",
        subdivision: formValues.subdivision || "",
        barangay: formValues.barangay || "",
        municipality: formValues.municipality || "",
        province: formValues.province || "",
        profilePhotoUrl,
        profilePhotoPath,
      });

      updateProfileState(updatedProfile);
      await saveProfileCache(updatedProfile);
      await refresh();

      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to save profile.";
      Alert.alert("Profile Update Failed", message);
      console.error("[PROFILE SAVE]", error);
    } finally {
      setSaving(false);
    }
  };

  const content = useMemo(
    () => (
      <>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color={COLORS.heading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Decorative Background Elements */}
          <View style={styles.heroDecorCircle1} />
          <View style={styles.heroDecorCircle2} />
          <View style={styles.heroDecorCircle3} />

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <ProfilePhotoPicker
              photoUrl={photoUri ?? profile?.profilePhotoUrl}
              onPickPhoto={pickImage}
            />
          </View>
        </View>

        {/* Wave Divider */}
        <View style={styles.waveDivider}>
          <View style={styles.waveCurve} />
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <EditProfileForm
            values={formValues}
            errors={fieldErrors}
            onChangeValue={handleChangeValue}
          />
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <SaveButton
            onPress={handleSave}
            loading={disabled}
            disabled={disabled}
          />
        </View>
      </>
    ),
    [
      formValues,
      fieldErrors,
      photoUri,
      profile?.profilePhotoUrl,
      pickImage,
      disabled,
      navigation,
    ],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        accessible={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
  },

  // Hero Section Styles
  heroSection: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 50,
    position: "relative",
    overflow: "hidden",
  },
  heroDecorCircle1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroDecorCircle2: {
    position: "absolute",
    bottom: -60,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  heroDecorCircle3: {
    position: "absolute",
    top: 100,
    left: SCREEN_WIDTH * 0.6,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  heroContent: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  heroTextContainer: {
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  // Wave Divider
  waveDivider: {
    backgroundColor: COLORS.primary,
    marginTop: -1,
  },
  waveCurve: {
    height: 32,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  // Form Section
  formSection: {
    paddingHorizontal: SPACING.lg,
  },
  buttonSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
});

export default EditProfileScreen;
