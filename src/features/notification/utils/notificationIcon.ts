import type { NotificationType } from "../types/notification.types";

export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case "announcement":
      return "📢";
    case "appointment":
      return "📅";
    case "certificate":
      return "📄";
    default:
      return "🔔";
  }
};

export const getNotificationIconName = (type: NotificationType): string => {
  switch (type) {
    case "announcement":
      return "bell";
    case "appointment":
      return "calendar";
    case "certificate":
      return "file-text";
    default:
      return "bell";
  }
};
