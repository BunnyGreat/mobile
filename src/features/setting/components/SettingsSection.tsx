import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACING, FONT_FAMILY, FONT_SIZE, COLORS } from "../../../theme";

type Props = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  title: {
    paddingHorizontal: SPACING.lg,
    color: COLORS.placeholder || "#637381",
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    marginBottom: SPACING.sm,
  },
  body: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: SPACING.lg,
  },
});

export default SettingsSection;
