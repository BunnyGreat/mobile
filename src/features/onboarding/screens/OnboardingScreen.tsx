import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE } from "../../../theme";

const OnboardingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Onboarding Screen</Text>
      <Text style={styles.placeholder}>
        This is a placeholder. We will build the real onboarding flow here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: FONT_SIZE.h24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    marginBottom: 16,
  },
  placeholder: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    textAlign: "center",
  },
});

export default OnboardingScreen;
