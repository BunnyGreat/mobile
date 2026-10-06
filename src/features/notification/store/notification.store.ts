import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/firebase/firebase";
import { clearNotificationsCache } from "../services/notificationCache.service";
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
let authStateSubscription: (() => void) | null = null;

const countUnread = (notifications: NotificationStoreState["notifications"]) =>
  notifications.filter((notification) => !notification.isRead).length;

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshing: false,
  error: null,

  fetchNotifications: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || currentUserUid !== uid) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const cached = await getCachedNotifications(uid);
      if (currentUserUid !== uid) {
        return;
      }
      if (cached.length > 0) {
        set({ notifications: cached, unreadCount: countUnread(cached), loading: false });
      } else {
        set({ notifications: [], unreadCount: 0, loading: false });
      }

      const fresh = await fetchNotificationDocs(uid);
      if (currentUserUid !== uid) {
        return;
      }
      set({ notifications: fresh, unreadCount: countUnread(fresh), loading: false, error: null });
    } catch (error) {
      if (currentUserUid !== uid) {
        return;
      }
      const cached = await getCachedNotifications(uid);
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
    const uid = auth.currentUser?.uid;
    if (!uid || currentUserUid !== uid) {
      return;
    }

    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchNotificationDocs(uid);
      if (currentUserUid !== uid) {
        return;
      }
      set({ notifications: fresh, unreadCount: countUnread(fresh), refreshing: false, error: null });
    } catch (error) {
      if (currentUserUid !== uid) {
        return;
      }
      const cached = await getCachedNotifications(uid);
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
    if (authStateSubscription) {
      return () => {};
    }

    authStateSubscription = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid ?? null;
      if (currentUserUid === uid) {
        return;
      }

      notificationSubscription?.();
      notificationSubscription = null;
      if (currentUserUid && currentUserUid !== uid) {
        void clearNotificationsCache(currentUserUid);
      }
      currentUserUid = uid;
      set({
        notifications: [],
        unreadCount: 0,
        loading: Boolean(uid),
        refreshing: false,
        error: null,
      });

      if (!uid) {
        return;
      }

      notificationSubscription = subscribeToNotifications(
        uid,
        (notifications) => {
          if (currentUserUid !== uid) {
            return;
          }
          set({
            notifications,
            unreadCount: countUnread(notifications),
            error: null,
            loading: false,
            refreshing: false,
          });
        },
        (error) => {
          if (currentUserUid === uid) {
            set({ error: error.message });
          }
        },
      );
      void get().fetchNotifications();
    });

    return () => {
      authStateSubscription?.();
      authStateSubscription = null;
      notificationSubscription?.();
      notificationSubscription = null;
      currentUserUid = null;
      set({
        notifications: [],
        unreadCount: 0,
        loading: false,
        refreshing: false,
        error: null,
      });
    };
  },

  markAsRead: async (notificationId: string) => {
    const uid = auth.currentUser?.uid;
    try {
      if (!uid || currentUserUid !== uid) {
        throw new Error("Authentication required.");
      }
      await markNotificationAsRead(uid, notificationId);

      if (currentUserUid !== uid) {
        return;
      }
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
    const uid = auth.currentUser?.uid;
    try {
      if (!uid || currentUserUid !== uid) {
        throw new Error("Authentication required.");
      }
      const state = get();
      const unreadIds = state.notifications.filter((notification) => !notification.isRead).map((notification) => notification.notificationId);
      if (unreadIds.length > 0) {
        await markNotificationsAsRead(uid, unreadIds);
      }

      if (currentUserUid !== uid) {
        return;
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
