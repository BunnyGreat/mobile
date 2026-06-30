import { create } from "zustand";
import {
  fetchNotifications,
  getCachedNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
} from "../services/notification.service";
import type { Notification, NotificationStoreState } from "../types/notification.types";
import { auth } from "../../../services/firebase/firebase";

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
        const unreadCount = cached.filter((n) => !n.isRead).length;
        set({ notifications: cached, unreadCount, loading: false });
      } else {
        set({ notifications: [], unreadCount: 0, loading: false });
      }

      const fresh = await fetchNotifications();
      const unreadCount = fresh.filter((n) => !n.isRead).length;
      set({ notifications: fresh, unreadCount, loading: false, error: null });
    } catch (error) {
      const cached = await getCachedNotifications();
      const unreadCount = cached.filter((n) => !n.isRead).length;
      set({
        notifications: cached,
        unreadCount,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load notifications.",
      });
    }
  },

  refreshNotifications: async () => {
    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchNotifications();
      const unreadCount = fresh.filter((n) => !n.isRead).length;
      set({ notifications: fresh, unreadCount, refreshing: false, error: null });
    } catch (error) {
      const cached = await getCachedNotifications();
      const unreadCount = cached.filter((n) => !n.isRead).length;
      set({
        notifications: cached,
        unreadCount,
        refreshing: false,
        error: error instanceof Error ? error.message : "Unable to refresh notifications.",
      });
    }
  },

  subscribeToNotifications: () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      return () => {};
    }

    const unsubscribe = subscribeToNotifications(
      currentUser.uid,
      (notifications) => {
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        set({ notifications, unreadCount, error: null });
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
      const updated = state.notifications.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n,
      );
      const unreadCount = updated.filter((n) => !n.isRead).length;

      set({ notifications: updated, unreadCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to mark as read.";
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
