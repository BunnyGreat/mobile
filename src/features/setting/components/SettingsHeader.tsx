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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
  },
});

export default SettingsHeader;
