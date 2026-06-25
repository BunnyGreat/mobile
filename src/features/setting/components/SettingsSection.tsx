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
    color: COLORS.placeholder || "#637381",
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    marginBottom: SPACING.xs,
  },
  body: {
    borderWidth: 1,
    borderColor: "rgba(193,198,213,0.2)",
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    backgroundColor: COLORS.white,
  },
});

export default SettingsSection;
