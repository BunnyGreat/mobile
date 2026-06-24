import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const RegisterScreen: React.FC = () => {
  return (
    <ScreenContainer
      scrollable
      padding="lg"
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.centered}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.description}>
          This is a placeholder screen. Registration flow will be implemented
          later.
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

export default RegisterScreen;
