import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppButton from "../../../../components/ui/AppButton";
import FormOtpInput from "../../../../components/forms/FormOtpInput";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const RegisterOtpScreen: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(180);
  const [email, setEmail] = useState("user@example.com");
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResendCode = () => {
    console.log("Resend Code");
  };

  const handleVerifyContinue = () => {
    navigation.navigate("PersonalInformation");
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
            <View style={styles.progressSegment} />
          </View>
        </View>
      </View>

      <View style={styles.middleContent}>
        <Text style={styles.title}>One-Time Code Sent</Text>
        <Text style={styles.subtitle}>Check your email inbox</Text>
        <Text style={styles.description}>
          We've sent a 6-digit verification code to{" "}
          <Text style={styles.emailHighlight}>{email}</Text>.
        </Text>

        <View style={styles.otpWrapper}>
          <FormOtpInput
            length={6}
            value={otp}
            onChange={setOtp}
            autoFocus
            containerStyle={styles.otpContainer}
            accessibilityLabel="Register verification code"
          />
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            ⏱ Code expires in {formatCountdown()}
          </Text>
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          label="Verify & Continue"
          onPress={handleVerifyContinue}
          variant="primary"
          fullWidth
          style={styles.verifyButton}
        />

        <View style={styles.infoBox}>
          <View style={styles.infoIconContainer}>
            <Image
              source={require("../../../../../assets/icons/warning.png")}
              style={styles.infoIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoText}>
            Kindly wait for at least 3 minutes for the 6-digit code to arrive.
            Sometimes there may be delays in receiving it. Thank you for your
            patience.
          </Text>
        </View>
      </View>

      <View style={styles.bottomContent}>
        <Text style={styles.footerText}>
          Didn't receive the email? Try checking your junk or spam folder.
        </Text>
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
  },
  middleContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  progressSection: {
    width: "100%",
    marginBottom: SPACING.lg,
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
  title: {
    fontSize: FONT_SIZE.h32,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZE.body16 * 1.5,
    maxWidth: 320,
  },
  emailHighlight: {
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  otpWrapper: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    width: "100%",
    justifyContent: "space-between",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.primary,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  resendText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
  },
  resendLink: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  verifyButton: {
    marginBottom: SPACING.xl,
  },
  infoBox: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(255, 243, 205, 1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    padding: SPACING.lg,
    alignItems: "flex-start",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  infoIcon: {
    width: 20,
    height: 20,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body14 * 1.5,
  },
  bottomContent: {
    width: "100%",
    alignItems: "center",
    paddingTop: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
});

export default RegisterOtpScreen;
