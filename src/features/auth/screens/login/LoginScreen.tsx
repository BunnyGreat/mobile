import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppInput from "../../../../components/ui/AppInput";
import AppButton from "../../../../components/ui/AppButton";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";
import { loginSchema, type LoginFormValues } from "./schema/login.schema";
import { loginUser } from "./services/login.service";
import { useLoginStore } from "./store/login.store";
import {
  authenticateGoogleResident,
  getGoogleAuthenticationErrorMessage,
  isGoogleSignInCancelled,
} from "../../services/google-auth.service";
import { runSingleFlightAction } from "../../services/singleFlightAction";
import { createRegistrationOtp } from "../register/services/register.service";
import { useRegisterStore } from "../register/store/register.store";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const setUser = useLoginStore((s) => s.setUser);
  const isLoading = useLoginStore((s) => s.isLoading);
  const setLoading = useLoginStore((s) => s.setLoading);
  const saveGoogleAccount = useRegisterStore((s) => s.saveGoogleAccount);
  const setOtp = useRegisterStore((s) => s.setOtp);
  const googleSignInGuard = useRef({ current: false });

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (isLoading) return;
    setLoading(true);

    try {
      const result = await loginUser(values.email.trim(), values.password);

      if (!result.success) {
        Alert.alert("Login Failed", result.error ?? "Unable to login.");
        return;
      }

      if (result.user) {
        // Only store allowed fields
        setUser(result.user);

        if (result.user.status === "approved") {
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        } else {
          // Service should return errors for pending/rejected, but handle defensively
          Alert.alert("Login Failed", "Your account is not approved.");
        }
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message ?? "Login failed.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    if (isLoading) return;

    await runSingleFlightAction(
      googleSignInGuard.current,
      setLoading,
      async () => {
        try {
          const result = await authenticateGoogleResident();
          if (result.type === "new-registration") {
            let otp: Awaited<ReturnType<typeof createRegistrationOtp>>;
            try {
              otp = await createRegistrationOtp(result.email);
            } catch {
              Alert.alert(
                "Registration Code Failed",
                "Unable to send a registration code to your verified Google email. Please try again.",
              );
              return;
            }
            saveGoogleAccount(result.email, result.firebaseUid);
            setOtp(otp.code, otp.createdAt, otp.expiresAt);
            navigation.navigate("RegisterOtp");
            return;
          }

          if (result.user.status === "pending") {
            Alert.alert(
              "Account Pending",
              "Your registration is still under review.",
            );
            return;
          }
          if (result.user.status === "rejected") {
            Alert.alert(
              "Registration Rejected",
              "Your registration has been rejected.",
            );
            return;
          }
          if (result.user.status !== "approved") {
            Alert.alert("Sign-In Failed", "Your account is not approved.");
            return;
          }

          setUser(result.user);
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          });
        } catch (error: unknown) {
          if (isGoogleSignInCancelled(error)) return;
          Alert.alert(
            "Google Sign-In Failed",
            getGoogleAuthenticationErrorMessage(error),
          );
        }
      },
    );
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.innerContainer}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Sign in to continue to Barangay San Isidro.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Email Address"
              placeholder="resident@example.com"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Image
                  source={require("../../../../../assets/icons/mail.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              }
              error={formState.errors.email?.message}
            />
          )}
        />

        <View style={styles.passwordLabelRow}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label=""
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              isPassword
              leftIcon={
                <Image
                  source={require("../../../../../assets/icons/lock.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              }
              passwordToggleIcons={{
                visible: (
                  <Image
                    source={require("../../../../../assets/icons/eye-open.png")}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                ),
                hidden: (
                  <Image
                    source={require("../../../../../assets/icons/eye-slash.png")}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                ),
              }}
              error={formState.errors.password?.message}
            />
          )}
        />

        <AppButton
          label={isLoading ? "Signing In..." : "Login"}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          fullWidth
          style={styles.loginButton}
          disabled={isLoading}
        />

        <View style={styles.googleDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton
          onPress={onGoogleSignIn}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Register</Text>
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
  innerContainer: {
    flex: 1,
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: FONT_SIZE.h32,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    marginBottom: SPACING.xxxl,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.heading,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.primary,
  },
  icon: {
    width: 20,
    height: 20,
  },
  inputIcon: {
    fontSize: FONT_SIZE.body16,
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  googleDivider: {
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  registerText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
  },
  registerLink: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
});

export default LoginScreen;
