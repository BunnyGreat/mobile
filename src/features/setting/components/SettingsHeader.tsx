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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.heading,
    textAlign: "center",
  },
});

export default SettingsHeader;
