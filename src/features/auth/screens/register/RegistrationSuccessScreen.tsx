import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import AppButton from "../../../../components/ui/AppButton";
import { useNavigation } from "@react-navigation/native";
import { SPACING, COLORS, FONT_FAMILY, FONT_SIZE } from "../../../../theme";

const RegistrationSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleReturnToLogin = () => {
    // Call clearRegistration if the app exposes it on global scope
    try {
      (globalThis as any).clearRegistration?.();
    } catch (e) {
      // ignore
    }

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.container}>
        <Image
          source={require("../../../../../assets/images/success.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Registration Submitted
          {"\n"}
          Successfully
        </Text>

        <Text style={styles.description}>
          Your registration request has been submitted for verification by the
          Barangay administration. You will receive a notification once your
          account has been approved.
        </Text>

        <Text style={styles.referenceId}>Reference ID: N/A</Text>

        <View style={styles.contentBlock}>
          <View style={styles.statusBadge}>
            <Image
              source={require("../../../../../assets/icons/calendar-pending.png")}
              resizeMode="contain"
            />
            <Text style={styles.statusText}>Status:</Text>
            <Text style={styles.pendingText}>Pending Verification</Text>
          </View>

          <View style={styles.buttonContainer}>
            <AppButton
              label="Return to Login"
              onPress={handleReturnToLogin}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  image: {
    width: 240,
    height: 240,
  },
  title: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.h28 || 24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.primary,
    textAlign: "center",
  },
  description: {
    marginTop: SPACING.md,
    textAlign: "center",
    color: COLORS.paragraph,
    lineHeight: FONT_SIZE.body16 * 1.6,
    maxWidth: 320,
  },
  referenceId: {
    marginTop: SPACING.md,
    textAlign: "center",
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  contentBlock: {
    marginTop: SPACING.lg,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "#FFF7E6",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F4E1B8",
  },
  statusIcon: {
    marginRight: SPACING.sm,
  },
  statusText: {
    marginRight: SPACING.sm,
    color: COLORS.paragraph,
  },
  pendingText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.semibold,
  },
  buttonContainer: {
    width: "100%",
    marginTop: SPACING.lg,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});

export default RegistrationSuccessScreen;
