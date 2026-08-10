import { create } from "zustand";
import { auth } from "../../../services/firebase/firebase";
import {
  fetchNotifications as fetchNotificationDocs,
  getCachedNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
  subscribeToNotifications,
} from "../services/notification.service";
import type { NotificationStoreState, Notification } from "../types/notification.types";

let notificationSubscription: (() => void) | null = null;
let currentUserUid: string | null = null;

const countUnread = (notifications: NotificationStoreState["notifications"]) =>
  notifications.filter((notification) => !notification.isRead).length;

const mergeNotifications = (cached: Notification[], fresh: Notification[]): Notification[] => {
  const byId = new Map<string, Notification>();

  cached.forEach((notification) => {
    if (notification.notificationId) {
      byId.set(notification.notificationId, notification);
    }
  });

  fresh.forEach((notification) => {
    if (notification.notificationId) {
      byId.set(notification.notificationId, notification);
    }
  });

  return Array.from(byId.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
};

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshing: false,
  error: null,

  fetchNotifications: async () => {
    const existing = get().notifications;
    set({ loading: true, error: null });

    try {
      const cached = await getCachedNotifications();
      const initial = cached.length > 0 ? cached : existing;
      if (initial.length > 0) {
        set({ notifications: initial, unreadCount: countUnread(initial), loading: false });
      } else {
        set({ notifications: [], unreadCount: 0, loading: false });
      }

      const fresh = await fetchNotificationDocs();
      const merged = mergeNotifications(initial, fresh);
      set({ notifications: merged, unreadCount: countUnread(merged), loading: false, error: null });
    } catch (error) {
      const cached = await getCachedNotifications();
      const fallback = cached.length > 0 ? cached : existing;
      const message = error instanceof Error ? error.message : "Unable to load notifications.";

      set({
        notifications: fallback,
        unreadCount: countUnread(fallback),
        loading: false,
        error: message,
      });
    }
  },

  refreshNotifications: async () => {
    const existing = get().notifications;
    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchNotificationDocs();
      const cached = await getCachedNotifications();
      const merged = mergeNotifications(existing.length > 0 ? existing : cached, fresh);
      set({ notifications: merged, unreadCount: countUnread(merged), refreshing: false, error: null });
    } catch (error) {
      const cached = await getCachedNotifications();
      const fallback = cached.length > 0 ? cached : existing;
      const message = error instanceof Error ? error.message : "Unable to refresh notifications.";

      set({
        notifications: fallback,
        unreadCount: countUnread(fallback),
        refreshing: false,
        error: message,
      });
    }
  },

  subscribeToNotifications: () => {
    const uid = auth.currentUser?.uid ?? "";

    if (notificationSubscription && currentUserUid === uid) {
      return () => {};
    }

    if (notificationSubscription) {
      notificationSubscription();
      notificationSubscription = null;
    }

    currentUserUid = uid;
    notificationSubscription = subscribeToNotifications(
      uid,
      (notifications) => {
        const existing = get().notifications;
        const deduped = mergeNotifications(existing, notifications);
        set({ notifications: deduped, unreadCount: countUnread(deduped), error: null, loading: false, refreshing: false });
      },
      (error) => {
        set({ error: error.message });
      },
    );

    return () => {
      notificationSubscription?.();
      notificationSubscription = null;
      currentUserUid = null;
    };
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

  markAllAsRead: async () => {
    try {
      const state = get();
      const unreadIds = state.notifications.filter((notification) => !notification.isRead).map((notification) => notification.notificationId);
      if (unreadIds.length > 0) {
        await markNotificationsAsRead(unreadIds);
      }

      const updated = state.notifications.map((notification) => ({ ...notification, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to mark all as read.";
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
