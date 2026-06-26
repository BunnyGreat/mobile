import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FONT_FAMILY, FONT_SIZE, SPACING, COLORS } from "../../../theme";

const SettingsHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h28,
    color: COLORS.heading,
  },
});

export default SettingsHeader;
