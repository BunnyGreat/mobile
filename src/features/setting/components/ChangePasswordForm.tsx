import React, { useEffect, useMemo, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import PasswordInput from "./PasswordInput";
import PasswordRequirements from "./PasswordRequirements";
import UpdatePasswordButton from "./UpdatePasswordButton";
import { PasswordRequirement } from "../types/changePassword.types";
import { PasswordStrength } from "../types/changePassword.types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface ChangePasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  requirements: PasswordRequirement[];
  passwordStrength: PasswordStrength;
  passwordMatch: boolean;
  errors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  loading: boolean;
  onSubmit: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
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
  onSubmit,
}) => {
  const [showRequirements, setShowRequirements] = React.useState(false);

  const requirementsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (newPassword.length > 0) {
      setShowRequirements(true);
      Animated.timing(requirementsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(requirementsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowRequirements(false));
    }
  }, [newPassword, requirementsOpacity]);

  const confirmText = useMemo(() => {
    if (!confirmPassword) return "";
    return passwordMatch ? "Passwords match" : "Passwords do not match";
  }, [confirmPassword, passwordMatch]);

  const confirmTextStyle = useMemo(
    () => [
      styles.matchText,
      passwordMatch ? styles.matchSuccess : styles.matchError,
    ],
    [passwordMatch],
  );

  return (
    <View style={styles.container}>
      <PasswordInput
        label="Current Password"
        value={currentPassword}
        onChangeText={onCurrentPasswordChange}
        error={errors.currentPassword}
        editable={!loading}
      />

      <PasswordInput
        label="New Password"
        value={newPassword}
        onChangeText={onNewPasswordChange}
        error={errors.newPassword}
        editable={!loading}
      />

      {showRequirements ? (
        <Animated.View style={{ opacity: requirementsOpacity }}>
          <PasswordRequirements
            requirements={requirements}
            strength={passwordStrength}
          />
        </Animated.View>
      ) : null}

      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        error={errors.confirmPassword}
        editable={!loading}
      />

      {confirmPassword.length > 0 ? (
        <Text style={confirmTextStyle}>{confirmText}</Text>
      ) : null}

      <UpdatePasswordButton loading={loading} onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  matchText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    marginBottom: SPACING.lg,
  },
  matchSuccess: {
    color: COLORS.success,
  },
  matchError: {
    color: COLORS.danger,
  },
});

export default ChangePasswordForm;
