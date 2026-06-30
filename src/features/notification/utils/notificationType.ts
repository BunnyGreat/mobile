import type { NotificationType } from "../types/notification.types";

export const getNotificationTypeLabel = (type: NotificationType): string => {
  const normalized = type?.trim().toLowerCase() as NotificationType;

  switch (normalized) {
    case "announcement":
      return "Announcement";
    case "appointment":
      return "Appointment";
    case "certificate":
      return "Certificate";
    default:
      return "Notification";
  }
};
