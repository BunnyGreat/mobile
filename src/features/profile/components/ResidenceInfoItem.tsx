import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface ResidenceInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  style?: ViewStyle;
}

const ResidenceInfoItem: React.FC<ResidenceInfoItemProps> = ({
  icon,
  label,
  value,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.rowContent}>
        <View style={styles.iconWrapper}>{icon}</View>
        <View style={styles.textContent}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 78, 159, 0.12)",
  },
  textContent: {
    flex: 1,
  },
  label: {
    textTransform: "uppercase",
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  value: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    lineHeight: 24,
  },
});

export default ResidenceInfoItem;
