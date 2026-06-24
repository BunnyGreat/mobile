/**
 * Verify OTP Screen
 * Allows users to enter the 6-digit verification code received via email.
 * UI only - no backend logic.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppButton from "../../../../components/ui/AppButton";
import type { RootStackNavigationProp } from "../../../../navigation/types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const VerifyOtpScreen: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(180);
  const [email, setEmail] = useState("user@example.com");
  const navigation = useNavigation<RootStackNavigationProp>();
  const otpInputsRef = React.useRef<Array<TextInput | null>>([]);

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

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    const otpArray = otp.split("");

    if (digits.length === 0) {
      otpArray[index] = "";
      setOtp(otpArray.join(""));
      return;
    }

    if (digits.length === 1) {
      otpArray[index] = digits;
      setOtp(otpArray.join(""));
      if (index < 5 && otpInputsRef.current[index + 1]) {
        otpInputsRef.current[index + 1]?.focus();
      }
      return;
    }

    // Paste support
    let nextIndex = index;
    for (const digit of digits) {
      if (nextIndex > 5) break;
      otpArray[nextIndex] = digit;
      nextIndex += 1;
    }
    setOtp(otpArray.join(""));
    if (nextIndex <= 5 && otpInputsRef.current[nextIndex]) {
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (index: number, event: any) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index]) {
      if (index > 0 && otpInputsRef.current[index - 1]) {
        const otpArray = otp.split("");
        otpArray[index - 1] = "";
        setOtp(otpArray.join(""));
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyCode = () => {
    // UI only - navigate to ResetPassword without validation
    navigation.navigate("ResetPassword");
  };

  const handleResendCode = () => {
    // UI only - just log
    console.log("Resend OTP");
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topContent}>
        <View style={styles.iconBadge}>
          <Image
            source={require("../../../../../assets/icons/counter-lock.png")}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent an email to <Text style={styles.emailText}>{email}</Text>{" "}
          containing a 6-digit code.
        </Text>

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                otpInputsRef.current[index] = el;
              }}
              value={otp[index] || ""}
              onChangeText={(value) => handleOtpChange(index, value)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpBox, otp[index] && styles.filledOtpBox]}
              textAlign="center"
              selectionColor={COLORS.primary}
            />
          ))}
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            ⏱ Code expires in {formatCountdown()}
          </Text>
        </View>

        {/* Resend Code Link */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <AppButton
          label="Verify Code"
          onPress={handleVerifyCode}
          variant="primary"
          fullWidth
          style={styles.verifyButton}
        />

        {/* Info Box placed directly under Verify button */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconContainer}>
            <Image
              source={require("../../../../../assets/icons/warning.png")}
              style={styles.infoIconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoText}>
            Kindly wait for at least 3 minutes for the 6-digit code to arrive.
            Sometimes, there may be delays in receiving it. Thank you for your
            patience!
          </Text>
        </View>
      </View>

      <View style={styles.bottomContent}>
        {/* Footer Text only */}
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
  },
  topContent: {
    alignItems: "center",
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 99, 193, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  badgeImage: {
    width: 40,
    height: 40,
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
  emailText: {
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xxxl,
    width: "100%",
  },
  otpBox: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SPACING.md,
    fontSize: FONT_SIZE.h20,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.heading,
    backgroundColor: COLORS.white,
  },
  filledOtpBox: {
    borderColor: COLORS.primary,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  timerText: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.primary,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  resendText: {
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
  },
  resendLink: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  verifyButton: {
    marginBottom: SPACING.lg,
  },
  bottomContent: {
    width: "100%",
    alignItems: "center",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 235, 59, 0.18)",
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255, 220, 0, 0.4)",
    padding: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    alignItems: "flex-start",
    width: "100%",
  },
  infoIconContainer: {
    marginRight: SPACING.md,
    marginTop: 4,
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FCD400",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIconImage: {
    width: 20,
    height: 20,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    lineHeight: 22,
  },
  footerText: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
});

export default VerifyOtpScreen;
