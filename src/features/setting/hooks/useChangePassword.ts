import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../../services/firebase/firebase";
import { changePassword } from "../services/changePassword.service";
import { useSettingsStore } from "../store/settings.store";
import { RootStackNavigationProp } from "../../../navigation/types";
import { usePasswordValidation } from "./usePasswordValidation";

export const useChangePassword = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const logout = useSettingsStore((state) => state.logout);
  const clearSettings = useSettingsStore((state) => state.clearSettings);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const { requirements, passwordStrength, passwordMatch } =
    usePasswordValidation(newPassword, confirmPassword);

  const hasValidRequirements = useMemo(
    () => requirements.every((requirement) => requirement.valid),
    [requirements],
  );

  const resetErrors = () => {
    setErrors({});
  };

  const validateForm = () => {
    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmPassword.trim();
    const nextErrors: typeof errors = {};

    if (!current) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!next) {
      nextErrors.newPassword = "New password is required.";
    }

    if (!confirm) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    }

    if (next && confirm && next !== confirm) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (next && current && next === current) {
      nextErrors.newPassword =
        "New password must be different from your current password.";
    }

    if (next && !hasValidRequirements) {
      nextErrors.newPassword = "Your new password does not satisfy all requirements.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const showErrorAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleChangePassword = async () => {
    if (loading) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const current = currentPassword.trim();
      const next = newPassword.trim();
      await changePassword(current, next);

      Alert.alert(
        "Password Updated",
        "Your password has been changed successfully.\n\nFor security reasons, you will be signed out and will need to sign in again using your new password.",
        [
          {
            text: "OK",
            onPress: async () => {
              const result = await logout();
              if (result) {
                clearSettings();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              } else {
                Alert.alert(
                  "Logout Failed",
                  "Unable to sign out. Please try again.",
                );
              }
            },
          },
        ],
      );
    } catch (error: unknown) {

      const code = (error as any)?.code as string | undefined;
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      switch (code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          showErrorAlert(
            "Incorrect Password",
            "The current password you entered is incorrect.",
          );
          break;
        case "auth/weak-password":
          showErrorAlert(
            "Weak Password",
            "Your new password does not meet the security requirements.",
          );
          break;
        case "auth/requires-recent-login":
          showErrorAlert(
            "Reauthentication Required",
            "Please sign in again before changing your password.",
          );
          break;
        case "auth/network-request-failed":
          showErrorAlert(
            "Network Error",
            "Please check your internet connection and try again.",
          );
          break;
        case "auth/no-current-user":
          showErrorAlert(
            "Unable to Update Password",
            "No authenticated user was found. Please sign in again.",
          );
          break;
        default:
          showErrorAlert(
            "Unable to Update Password",
            message,
          );
      }
    } finally {
      setLoading(false);
    }
  };

  const onCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);
    if (errors.currentPassword) {
      setErrors((prev) => ({ ...prev, currentPassword: undefined }));
    }
  };

  const onNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: undefined }));
    }
  };

  const onConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    requirements,
    passwordStrength,
    passwordMatch,
    errors,
    loading,
    handleChangePassword,
  };
};
