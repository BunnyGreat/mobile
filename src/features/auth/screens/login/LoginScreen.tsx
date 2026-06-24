import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppInput from "../../../../components/ui/AppInput";
import AppButton from "../../../../components/ui/AppButton";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleLoginPress = () => {
    console.log("Login pressed");
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

        <AppInput
          label="Email Address"
          placeholder="resident@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={
            <Image
              source={require("../../../../../assets/icons/mail.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          }
        />

        <View style={styles.passwordLabelRow}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <AppInput
          label=""
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
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
        />

        <AppButton
          label="Login"
          onPress={handleLoginPress}
          variant="primary"
          fullWidth
          style={styles.loginButton}
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
