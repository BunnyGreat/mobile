import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FONT_FAMILY, FONT_SIZE, SPACING, COLORS } from "../../../theme";
import { SettingsItemProps } from "../types/settings.types";

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  onPress,
  rightComponent,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.left}>
        <Feather name={icon as any} size={18} color={COLORS.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.right}>
        {value !== undefined && <Text style={styles.value}>{value}</Text>}
        {rightComponent}
        <Feather
          name="chevron-right"
          size={18}
          color={COLORS.placeholder || "#9AA7B2"}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  label: {
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  value: {
    marginRight: SPACING.xs,
    color: COLORS.placeholder || "#64748B",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
  },
});

export default SettingsItem;
