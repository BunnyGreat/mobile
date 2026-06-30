import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description = "There is currently nothing to display.",
  icon,
}) => {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    minHeight: 220,
  },
  iconWrapper: {
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  description: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default EmptyState;
