/**
 * Reset Password Screen
 * Placeholder for password reset screen.
 * UI only - no backend logic.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const ResetPasswordScreen: React.FC = () => {
  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.centered}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          Password reset UI will be built in the next phase.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZE.h24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.body16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
  },
});

export default ResetPasswordScreen;
