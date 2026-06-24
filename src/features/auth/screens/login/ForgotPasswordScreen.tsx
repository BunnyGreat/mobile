/**
 * Forgot Password Screen
 * Allows users to enter their email address to request a password reset via OTP.
 * UI only - no backend logic.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppInput from "../../../../components/ui/AppInput";
import AppButton from "../../../../components/ui/AppButton";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleSendVerificationCode = () => {
    // UI only - navigate to VerifyOtp without any backend logic
    navigation.navigate("VerifyOtp");
  };

  const handleLoginPress = () => {
    // Navigate back to Login
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
        <View style={styles.illustrationWrapper}>
          <Image
            source={require("../../../../../assets/images/forgot-password.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address and we'll send you a verification
          code to reset your password.
        </Text>

        <AppInput
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={{ width: "100%" }}
          leftIcon={
            <Image
              source={require("../../../../../assets/icons/mail.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          }
        />

        <AppButton
          label="Send Verification Code"
          onPress={handleSendVerificationCode}
          variant="primary"
          fullWidth
          style={styles.sendButton}
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.bottomText}>Remember your password? </Text>
        <TouchableOpacity onPress={handleLoginPress}>
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
    alignItems: "center",
    width: "100%",
  },
  illustrationWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },
  illustration: {
    width: "100%",
    height: 442,
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
    lineHeight: 24,
  },
  icon: {
    width: 20,
    height: 20,
  },
  sendButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  bottomSection: {
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

export default ForgotPasswordScreen;
