/**
 * Reset Password Screen
 * UI-only: new password + confirm password with live strength and requirements
 */

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppInput from "../../../../components/ui/AppInput";
import AppButton from "../../../../components/ui/AppButton";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>();

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 1, label: "Weak", color: COLORS.danger };
    if (score === 3)
      return { level: 2, label: "Medium", color: COLORS.warning };
    return { level: 3, label: "Strong", color: COLORS.success };
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const requirements = useMemo(
    () => [
      {
        id: "length",
        label: "At least 8 characters",
        valid: password.length >= 8,
      },
      {
        id: "uppercase",
        label: "One uppercase letter",
        valid: /[A-Z]/.test(password),
      },
      {
        id: "lowercase",
        label: "One lowercase letter",
        valid: /[a-z]/.test(password),
      },
      { id: "number", label: "One number", valid: /[0-9]/.test(password) },
      {
        id: "special",
        label: "One special character",
        valid: /[^a-zA-Z0-9]/.test(password),
      },
    ],
    [password],
  );

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleResetPress = () => {
    // UI-only: show success dialog
    setShowSuccessDialog(true);
  };

  const handleDialogConfirm = () => {
    setShowSuccessDialog(false);
    navigation.navigate("Login");
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topContent}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password to secure your account.
        </Text>

        <AppInput
          label="New Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon={
            <Image source={require("../../../../../assets/icons/lock.png")} />
          }
          passwordToggleIcons={{
            visible: (
              <Image
                source={require("../../../../../assets/icons/eye-slash.png")}
              />
            ),
            hidden: (
              <Image
                source={require("../../../../../assets/icons/eye-open.png")}
              />
            ),
          }}
        />

        {password.length > 0 && (
          <View style={styles.strengthCard}>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthLabel}>Security Strength</Text>
              <Text
                style={[
                  styles.strengthStatus,
                  { color: passwordStrength.color },
                ]}
              >
                {passwordStrength.label}
              </Text>
            </View>
            <View style={styles.strengthBars}>
              {[1, 2, 3].map((lvl) => (
                <View
                  key={lvl}
                  style={[
                    styles.strengthBarSegment,
                    lvl <= passwordStrength.level
                      ? { backgroundColor: passwordStrength.color }
                      : styles.strengthBarInactive,
                    lvl === 3 && styles.strengthBarSegmentLast,
                  ]}
                />
              ))}
            </View>

            <View style={styles.requirementsList}>
              {requirements.map((r) => (
                <View key={r.id} style={styles.requirementRow}>
                  <View
                    style={[
                      styles.requirementIndicator,
                      r.valid && styles.requirementIndicatorActive,
                    ]}
                  >
                    {r.valid ? (
                      <Text style={{ color: COLORS.white }}>✓</Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.requirementText,
                      r.valid && styles.requirementTextActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <AppInput
          label="Confirm Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          leftIcon={
            <Image source={require("../../../../../assets/icons/lock.png")} />
          }
          passwordToggleIcons={{
            visible: (
              <Image
                source={require("../../../../../assets/icons/eye-slash.png")}
              />
            ),
            hidden: (
              <Image
                source={require("../../../../../assets/icons/eye-open.png")}
              />
            ),
          }}
        />

        {(passwordsMatch ||
          (confirmPassword.length > 0 && !passwordsMatch)) && (
          <Text
            style={[
              styles.matchText,
              passwordsMatch ? styles.matchSuccess : styles.matchError,
            ]}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </Text>
        )}

        <AppButton
          label="Reset Password"
          onPress={handleResetPress}
          variant="primary"
          fullWidth
          style={styles.resetButton}
        />
      </View>

      <Text style={styles.bottomNote}>
        Use a strong password that is unique to your account for better
        security.
      </Text>

      <ConfirmDialog
        visible={showSuccessDialog}
        title="Password Updated"
        message="Your password has been successfully updated."
        onCancel={() => setShowSuccessDialog(false)}
        onConfirm={handleDialogConfirm}
        confirmText="OK"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  topContent: {
    alignItems: "center",
    width: "100%",
  },

  title: {
    fontSize: FONT_SIZE.h32,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    marginBottom: SPACING.xxxl,
    lineHeight: 22,
  },
  strengthCard: {
    marginBottom: SPACING.md,
    width: "100%",
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  strengthLabel: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  strengthStatus: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
  },
  strengthBars: {
    flexDirection: "row",
    width: "100%",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  strengthBarSegment: {
    flex: 1,
    marginRight: SPACING.xs,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
  strengthBarSegmentLast: {
    marginRight: 0,
  },
  strengthBarInactive: {
    backgroundColor: COLORS.border,
  },
  requirementsList: {
    marginTop: SPACING.md,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  requirementIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  requirementIndicatorActive: {
    borderColor: COLORS.success,
    backgroundColor: "rgba(2, 94, 22, 100)", // Dark green background for active state
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  requirementText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    flex: 1,
  },
  requirementTextActive: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
  },
  matchText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    alignSelf: "flex-start",
    textAlign: "left",
  },
  matchSuccess: {
    color: COLORS.success,
  },
  matchError: {
    color: COLORS.danger,
  },
  resetButton: {
    marginTop: SPACING.lg,
    borderRadius: 16,
    minHeight: 56,
  },
  bottomNote: {
    marginTop: SPACING.xl,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body16 * 1.5,
    textAlign: "center",
    maxWidth: 380,
    alignSelf: "center",
  },
});

export default ResetPasswordScreen;
