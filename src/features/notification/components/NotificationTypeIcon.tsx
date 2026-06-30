import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../../theme";
import { getNotificationIconName } from "../utils/notificationIcon";
import type { NotificationType } from "../types/notification.types";

interface NotificationTypeIconProps {
  type: NotificationType;
}

export const NotificationTypeIcon: React.FC<NotificationTypeIconProps> = ({
  type,
}) => {
  const iconName = getNotificationIconName(type);

  let backgroundColor: string = COLORS.primary;
  if (type === "announcement") {
    backgroundColor = "#004E9F";
  } else if (type === "appointment") {
    backgroundColor = "#6366F1";
  } else if (type === "certificate") {
    backgroundColor = "#8B5CF6";
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Feather name={iconName as any} size={18} color={COLORS.white} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
});

export default NotificationTypeIcon;
