import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
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
      {/* Header with Icon */}
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          {icon}
        </View>
        <View style={styles.labelBadge}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>

      {/* Address Value */}
      <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Feather name="map-pin" size={18} color={COLORS.primary} />
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "12",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  labelBadge: {
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  label: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    marginLeft: SPACING.xxl + SPACING.md,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: SPACING.md,
  },
  valueText: {
    flex: 1,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    lineHeight: 24,
    marginLeft: SPACING.sm,
  },
});

export default ResidenceInfoItem;
