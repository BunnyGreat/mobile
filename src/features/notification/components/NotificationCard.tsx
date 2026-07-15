import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { formatNotificationDate } from "../utils/formatNotificationDate";
import type {
  Notification,
  NotificationType,
} from "../types/notification.types";

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const getNotificationIcon = (
  type: NotificationType,
): { name: string; color: string } => {
  switch (type) {
    case "announcement":
      return { name: "volume-2", color: "#004E9F" };
    case "appointment":
      return { name: "calendar", color: "#6366F1" };
    case "certificate":
      return { name: "file-text", color: "#8B5CF6" };
    default:
      return { name: "bell", color: COLORS.primary };
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const { name: iconName, color: iconColor } = getNotificationIcon(
    notification.type,
  );
  const isUnread = !notification.isRead;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(notification)}
      style={[styles.card, isUnread && styles.cardUnread]}
    >
      {/* Icon Container */}
      <View style={styles.iconContainer}>
        <View
          style={[styles.iconBackground, { backgroundColor: `${iconColor}15` }]}
        >
          <Feather name={iconName as any} size={18} color={iconColor} />
        </View>
        {isUnread && <View style={styles.unreadIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {formatNotificationDate(notification.createdAt)}
          </Text>
        </View>

        <Text style={styles.message}>{notification.message}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardUnread: {
    backgroundColor: "#F8FAFC",
  },
  iconContainer: {
    alignItems: "center",
    marginRight: SPACING.md,
    position: "relative",
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  title: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  titleUnread: {
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  time: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  message: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    lineHeight: 22,
    flexShrink: 1,
  },
});

export default NotificationCard;
