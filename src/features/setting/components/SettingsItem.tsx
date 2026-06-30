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
  showDivider = true,
}) => {
  const isInteractive = !!onPress;

  return (
    <TouchableOpacity
      activeOpacity={isInteractive ? 0.7 : 1}
      onPress={onPress}
      disabled={!isInteractive}
      style={[styles.container, !showDivider && styles.noDivider]}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon as any} size={20} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>

      <View style={styles.right}>
        {rightComponent}
        {isInteractive && (
          <Feather name="chevron-right" size={20} color={COLORS.border} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  noDivider: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
  },
  value: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
});

export default SettingsItem;
