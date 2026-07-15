export type NotificationType = "announcement" | "appointment" | "certificate";

export interface Notification {
  notificationId: string;
  uid: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string | null;
  action?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStoreState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  subscribeToNotifications: () => () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  clearError: () => void;
}
