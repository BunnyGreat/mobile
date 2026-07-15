import { create } from "zustand";
import { auth } from "../../../services/firebase/firebase";
import {
  fetchNotifications as fetchNotificationDocs,
  getCachedNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
} from "../services/notification.service";
import type { NotificationStoreState } from "../types/notification.types";

const countUnread = (notifications: NotificationStoreState["notifications"]) =>
  notifications.filter((notification) => !notification.isRead).length;

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshing: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });

    try {
      const cached = await getCachedNotifications();
      if (cached.length > 0) {
        set({ notifications: cached, unreadCount: countUnread(cached), loading: false });
      } else {
        set({ notifications: [], unreadCount: 0, loading: false });
      }

      const fresh = await fetchNotificationDocs();
      set({ notifications: fresh, unreadCount: countUnread(fresh), loading: false, error: null });
    } catch (error) {
      const cached = await getCachedNotifications();
      const message = error instanceof Error ? error.message : "Unable to load notifications.";

      set({
        notifications: cached,
        unreadCount: countUnread(cached),
        loading: false,
        error: message,
      });
    }
  },

  refreshNotifications: async () => {
    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchNotificationDocs();
      set({ notifications: fresh, unreadCount: countUnread(fresh), refreshing: false, error: null });
    } catch (error) {
      const cached = await getCachedNotifications();
      const message = error instanceof Error ? error.message : "Unable to refresh notifications.";

      set({
        notifications: cached,
        unreadCount: countUnread(cached),
        refreshing: false,
        error: message,
      });
    }
  },

  subscribeToNotifications: () => {
    const uid = auth.currentUser?.uid ?? "";
    const unsubscribe = subscribeToNotifications(
      uid,
      (notifications) => {
        set({ notifications, unreadCount: countUnread(notifications), error: null });
      },
      (error) => {
        set({ error: error.message });
      },
    );

    return unsubscribe;
  },

  markAsRead: async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      const state = get();
      const updated = state.notifications.map((notification) =>
        notification.notificationId === notificationId ? { ...notification, isRead: true } : notification,
      );

      set({ notifications: updated, unreadCount: countUnread(updated) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to mark as read.";
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
