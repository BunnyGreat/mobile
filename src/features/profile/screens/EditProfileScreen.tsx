import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import ScreenContainer from "../../../components/common/ScreenContainer";
import EditProfileForm, {
  EditProfileFormValues,
} from "../components/EditProfileForm";
import ProfilePhotoPicker from "../components/ProfilePhotoPicker";
import SaveButton from "../components/SaveButton";
import { useProfile } from "../hooks/useProfile";
import { useProfilePhoto } from "../hooks/useProfilePhoto";
import { useRefreshProfile } from "../hooks/useRefreshProfile";
import { useNavigation } from "@react-navigation/native";
import { useProfileStore } from "../store/profile.store";
import { updateProfile, updateProfilePhoto } from "../services/profile.service";
import { saveProfileCache } from "../services/profileCache.service";
import { formatAddress } from "../utils/formatAddress";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from "../../../theme";

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
      // Refresh profile from backend to ensure latest data
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
      <View style={styles.content}>
        <ProfilePhotoPicker
          photoUrl={photoUri ?? profile?.profilePhotoUrl}
          onPickPhoto={pickImage}
        />
        <EditProfileForm
          values={formValues}
          onChangeValue={handleChangeValue}
        />
        <SaveButton
          onPress={handleSave}
          loading={disabled}
          disabled={disabled}
        />
      </View>
    ),
    [formValues, photoUri, profile?.profilePhotoUrl, pickImage, disabled],
  );

  return (
    <ScreenContainer
      scrollable
      backgroundColor={COLORS.background}
      padding="lg"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
    >
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        accessible={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
          style={styles.keyboardAvoid}
        >
          {content}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  keyboardAvoid: {
    width: "100%",
  },
  content: {
    width: "100%",
    gap: SPACING.lg,
  },
});

export default EditProfileScreen;
