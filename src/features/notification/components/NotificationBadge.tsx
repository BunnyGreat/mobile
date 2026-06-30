import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface NotificationBadgeProps {
  count: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
}) => {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
  },
  text: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.body12,
  },
});

export default NotificationBadge;
