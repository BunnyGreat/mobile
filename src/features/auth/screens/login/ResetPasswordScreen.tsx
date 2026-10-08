/**
 * Reset Password Screen
 * Submits the new password after server verification, keeping the existing form UI.
 */

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppInput from "../../../../components/ui/AppInput";
import AppButton from "../../../../components/ui/AppButton";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// ConfirmDialog removed; using Alert for success messages
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";
import { useLoginStore } from "./store/login.store";
import {
  PasswordResetFunctionError,
} from "./services/password-reset-api.service";
import { resetPasswordWithAuthorization } from "./services/reset-password.service";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

type FormValues = z.infer<typeof passwordSchema>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  // success dialog state removed; using Alert for confirmation
  const resetAuthorization = useLoginStore((s) => s.resetAuthorization);

  const { control, handleSubmit, formState, watch } = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");
  const confirmValue = watch("confirmPassword");

  const [isLoading, setIsLoading] = useState(false);

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
    () => getPasswordStrength(passwordValue ?? ""),
    [passwordValue],
  );

  const requirements = useMemo(
    () => [
      {
        id: "length",
        label: "At least 8 characters",
        valid: (passwordValue ?? "").length >= 8,
      },
      {
        id: "uppercase",
        label: "One uppercase letter",
        valid: /[A-Z]/.test(passwordValue ?? ""),
      },
      {
        id: "lowercase",
        label: "One lowercase letter",
        valid: /[a-z]/.test(passwordValue ?? ""),
      },
      {
        id: "number",
        label: "One number",
        valid: /[0-9]/.test(passwordValue ?? ""),
      },
      {
        id: "special",
        label: "One special character",
        valid: /[^a-zA-Z0-9]/.test(passwordValue ?? ""),
      },
    ],
    [passwordValue],
  );

  const onSubmit = async (values: FormValues) => {
    if (isLoading) return;
    setIsLoading(true);

    if (!resetAuthorization) {
      Alert.alert("Error", "Your reset verification has expired. Request a new code.");
      useLoginStore.getState().clearResetFlow();
      setIsLoading(false);
      navigation.navigate("ForgotPassword");
      return;
    }

    try {
      await resetPasswordWithAuthorization(
        resetAuthorization,
        values.password,
      );
      useLoginStore.getState().clearResetFlow();
      Alert.alert("Success", "Password successfully updated.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err: unknown) {
      if (
        err instanceof PasswordResetFunctionError &&
        (err.code === "RESET_AUTHORIZATION_INVALID" ||
          err.code === "PASSWORD_UPDATE_FAILED")
      ) {
        Alert.alert("Error", "Your reset verification has expired. Request a new code.");
        useLoginStore.getState().clearResetFlow();
        navigation.navigate("ForgotPassword");
      } else {
        const message =
          err instanceof Error ? err.message : "Unable to update password.";
        Alert.alert("Error", message);
      }
    } finally {
      setIsLoading(false);
    }
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

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="New Password"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              isPassword
              leftIcon={
                <Image
                  source={require("../../../../../assets/icons/lock.png")}
                />
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
          )}
        />

        {passwordValue && passwordValue.length > 0 && (
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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Confirm Password"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              isPassword
              leftIcon={
                <Image
                  source={require("../../../../../assets/icons/lock.png")}
                />
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
          )}
        />

        {confirmValue && confirmValue.length > 0 ? (
          <Text
            style={[
              styles.matchText,
              confirmValue === passwordValue
                ? styles.matchSuccess
                : styles.matchError,
            ]}
          >
            {confirmValue === passwordValue
              ? "Passwords match"
              : "Passwords do not match"}
          </Text>
        ) : null}

        <AppButton
          label={isLoading ? "Updating..." : "Reset Password"}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          fullWidth
          style={styles.resetButton}
          disabled={isLoading || !formState.isValid}
        />
      </View>

      <Text style={styles.bottomNote}>
        Use a strong password that is unique to your account for better
        security.
      </Text>
      {/* Success handled by Alert and navigation */}
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
    flex: 1,
    justifyContent: "center",
    paddingVertical: SPACING.lg,
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
    marginTop: SPACING.lg,
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
