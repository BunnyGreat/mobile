import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppInput from "../../../../components/ui/AppInput";
import AppButton from "../../../../components/ui/AppButton";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";
import { RegistrationStore, useRegisterStore } from "./store/register.store";
import { createRegistrationOtp } from "./services/register.service";
import { validateRegistrationCredentials } from "./schema/register.schema";
import {
  authenticateGoogleResident,
  getGoogleAuthenticationErrorMessage,
  isGoogleSignInCancelled,
} from "../../services/google-auth.service";
import { useLoginStore } from "../login/store/login.store";

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState(() => {
    const state = useRegisterStore.getState();
    return state.email;
  });
  const [password, setPassword] = useState(
    () => useRegisterStore.getState().password,
  );
  const [confirmPassword, setConfirmPassword] = useState(
    () => useRegisterStore.getState().password,
  );
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isContinuePressedRef = useRef(false);
  const navigation = useNavigation<RootStackNavigationProp>();
  const emailVerified = useRegisterStore((state) => state.emailVerified);
  const saveEmailForVerification = useRegisterStore(
    (state) => state.saveEmailForVerification,
  );
  const clearEmailVerification = useRegisterStore(
    (state) => state.clearEmailVerification,
  );
  const saveAccountCredentials = useRegisterStore(
    (state: RegistrationStore) => state.saveAccountCredentials,
  );
  const setOtp = useRegisterStore((state: RegistrationStore) => state.setOtp);
  const saveGoogleAccount = useRegisterStore(
    (state: RegistrationStore) => state.saveGoogleAccount,
  );
  const clearRegistration = useRegisterStore(
    (state: RegistrationStore) => state.clearRegistration,
  );
  const setUser = useLoginStore((state) => state.setUser);

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

  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleContinue = async () => {
    if (
      isSendingOtp ||
      isGoogleLoading ||
      isContinuePressedRef.current
    ) {
      return;
    }

    isContinuePressedRef.current = true;

    const validation = validateRegistrationCredentials({
      email,
      password,
      confirmPassword,
    });
    setEmailError(validation.errors.email);
    setPasswordError(validation.errors.password);
    setConfirmPasswordError(validation.errors.confirmPassword);
    if (!validation.isValid) {
      isContinuePressedRef.current = false;
      return;
    }

    if (!emailVerified) {
      setIsSendingOtp(true);
      try {
        const normalizedEmail = email.trim().toLowerCase();
        saveEmailForVerification(normalizedEmail);
        const otp = await createRegistrationOtp(normalizedEmail, "password");
        saveAccountCredentials(normalizedEmail, password);
        setOtp(otp.challengeId, otp.createdAt, otp.expiresAt);
        navigation.navigate("RegisterOtp");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to send verification code.";
        setEmailError(message);
      } finally {
        isContinuePressedRef.current = false;
        setIsSendingOtp(false);
      }
      return;
    }

    saveAccountCredentials(email.trim().toLowerCase(), password);
    navigation.navigate("PersonalInformation");
    isContinuePressedRef.current = false;
  };

  const handleGoogleContinue = async () => {
    if (isGoogleLoading || isSendingOtp) return;
    setIsGoogleLoading(true);

    try {
      const result = await authenticateGoogleResident();
      if (result.type === "resident") {
        if (result.user.status === "approved") {
          setUser(result.user);
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        } else if (result.user.status === "pending") {
          Alert.alert(
            "Account Pending",
            "Your registration is still under review.",
          );
        } else if (result.user.status === "rejected") {
          Alert.alert(
            "Registration Rejected",
            "Your registration has been rejected.",
          );
        } else {
          Alert.alert("Sign-In Failed", "Your account is not approved.");
        }
        return;
      }

      let otp: Awaited<ReturnType<typeof createRegistrationOtp>>;
      try {
        otp = await createRegistrationOtp(result.email, "google");
      } catch {
        Alert.alert(
          "Registration Code Failed",
          "Unable to send a registration code to your verified Google email. Please try again.",
        );
        return;
      }

      saveGoogleAccount(result.email, result.firebaseUid);
      setOtp(otp.challengeId, otp.createdAt, otp.expiresAt);
      navigation.navigate("RegisterOtp");
    } catch (error: unknown) {
      if (isGoogleSignInCancelled(error)) return;
      Alert.alert(
        "Google Sign-In Failed",
        getGoogleAuthenticationErrorMessage(error),
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    if (
      emailVerified &&
      value.trim().toLowerCase() !== email.trim().toLowerCase()
    ) {
      clearEmailVerification();
      setPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setConfirmPasswordError("");
    }
    setEmail(value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) setConfirmPasswordError("");
  };

  const handleLoginPress = () => {
    if (isSendingOtp || isGoogleLoading) return;
    clearRegistration();
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
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
        <View style={styles.progressSection}>
          <View style={styles.progressTopRow}>
            <Text style={styles.stepText}>STEP 1 OF 4</Text>
            <Text style={styles.progressText}>25% Complete</Text>
          </View>
          <View style={styles.progressBarRow}>
            <View
              style={[styles.progressSegment, styles.progressSegmentActive]}
            />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
            <View
              style={[styles.progressSegment, styles.progressSegmentLast]}
            />
          </View>
        </View>
      </View>

      <View style={styles.formContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          {emailVerified
            ? "Your email is verified. Continue your registration."
            : "Enter your email and create a password. We'll send a verification code before you continue."}
        </Text>

        <AppInput
          label="Email Address"
          required
          placeholder="resident@example.com"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={
            <Image source={require("../../../../../assets/icons/mail.png")} />
          }
          error={emailError}
        />

        <AppInput
          label="Password"
          required
          placeholder="••••••••"
          value={password}
          onChangeText={handlePasswordChange}
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
          error={passwordError}
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
              {requirements.map((requirement) => (
                <View key={requirement.id} style={styles.requirementRow}>
                  <View
                    style={[
                      styles.requirementIndicator,
                      requirement.valid && styles.requirementIndicatorActive,
                    ]}
                  >
                    {requirement.valid ? (
                      <Text style={{ color: COLORS.white }}>✓</Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.requirementText,
                      requirement.valid && styles.requirementTextActive,
                    ]}
                  >
                    {requirement.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <AppInput
          label="Confirm Password"
          required
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
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
          error={confirmPasswordError}
        />

        {(passwordsMatch || confirmPassword.length > 0) && (
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
          label={
            isSendingOtp
              ? "Sending code..."
              : emailVerified
                ? "Continue"
                : "Verify email and continue"
          }
          onPress={handleContinue}
          variant="primary"
          fullWidth
          style={styles.continueButton}
          disabled={isSendingOtp || isGoogleLoading}
          loading={isSendingOtp}
        />

        <View style={styles.googleDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton
          onPress={handleGoogleContinue}
          loading={isGoogleLoading}
          disabled={isGoogleLoading || isSendingOtp}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={handleLoginPress}
          disabled={isSendingOtp || isGoogleLoading}
        >
          <Text style={styles.bottomLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  topContent: {
    width: "100%",
    paddingTop: SPACING.sm,
  },
  formContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: SPACING.lg,
  },
  googleDivider: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
  },
  progressSection: {
    width: "100%",
    marginBottom: SPACING.md,
  },
  progressTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
  },
  progressText: {
    color: COLORS.paragraph,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
  },
  progressBarRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.border,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  progressSegmentLast: {
    backgroundColor: COLORS.border,
  },
  logo: {
    width: 120,
    height: 100,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.h32,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    marginBottom: SPACING.xxxl,
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  strengthCard: {
    width: "100%",
    marginBottom: SPACING.md,
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
    backgroundColor: "rgba(2, 94, 22, 100)",
  },
  requirementIndicatorText: {
    color: COLORS.success,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
  },
  requirementText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  requirementTextActive: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
  },
  matchText: {
    width: "100%",
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    textAlign: "left",
  },
  matchSuccess: {
    color: COLORS.success,
  },
  matchError: {
    color: COLORS.danger,
  },
  continueButton: {
    marginTop: SPACING.sm,
    borderRadius: 16,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  bottomText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
  },
  bottomLink: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
});

export default RegisterScreen;
