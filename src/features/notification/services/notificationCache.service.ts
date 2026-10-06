import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notification } from "../types/notification.types";

const NOTIFICATIONS_CACHE_PREFIX = "notification_cache";
const LEGACY_NOTIFICATIONS_CACHE_KEY = NOTIFICATIONS_CACHE_PREFIX;
const NOTIFICATION_READ_STATE_KEY = "notification_read_state";

type NotificationReadStateMap = Record<string, boolean>;

const getNotificationsCacheKey = (uid: string) => `${NOTIFICATIONS_CACHE_PREFIX}_${uid}`;

const getNotificationReadStateKey = (uid: string) =>
  `${NOTIFICATION_READ_STATE_KEY}_${uid}`;

export const saveNotificationsCache = async (
  uid: string,
  notifications: Notification[],
) => {
  if (!uid) {
    throw new Error("Authentication required to cache notifications.");
  }

  try {
    await AsyncStorage.setItem(
      getNotificationsCacheKey(uid),
      JSON.stringify(notifications),
    );
  } catch (error) {
    console.warn("Failed to cache notifications", error);
  }
};

export const loadNotificationsCache = async (
  uid: string,
): Promise<Notification[]> => {
  if (!uid) {
    return [];
  }

  try {
    await AsyncStorage.removeItem(LEGACY_NOTIFICATIONS_CACHE_KEY);
    const raw = await AsyncStorage.getItem(getNotificationsCacheKey(uid));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Notification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load cached notifications", error);
    return [];
  }
};

export const saveNotificationReadState = async (
  uid: string,
  notificationId: string,
  isRead: boolean,
) => {
  if (!uid) {
    throw new Error("Authentication required to update notification read state.");
  }

  try {
    const previousState = await loadNotificationReadStateMap(uid);
    const nextState = { ...previousState, [notificationId]: isRead };
    await AsyncStorage.setItem(getNotificationReadStateKey(uid), JSON.stringify(nextState));
  } catch (error) {
    console.warn("Failed to persist notification read state", error);
  }
};

export const saveNotificationReadStates = async (
  uid: string,
  notificationIds: string[],
) => {
  if (notificationIds.length === 0) {
    return;
  }

  if (!uid) {
    throw new Error("Authentication required to update notification read state.");
  }

  try {
    const previousState = await loadNotificationReadStateMap(uid);
    const nextState = { ...previousState };
    notificationIds.forEach((notificationId) => {
      nextState[notificationId] = true;
    });
    await AsyncStorage.setItem(getNotificationReadStateKey(uid), JSON.stringify(nextState));
  } catch (error) {
    console.warn("Failed to persist notification read state", error);
  }
};

export const loadNotificationReadStateMap = async (
  uid: string,
): Promise<NotificationReadStateMap> => {
  if (!uid) {
    return {};
  }

  try {
    const raw = await AsyncStorage.getItem(getNotificationReadStateKey(uid));
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as NotificationReadStateMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Failed to load notification read state", error);
    return {};
  }
};

export const clearNotificationsCache = async (uid: string) => {
  if (!uid) {
    return;
  }

  try {
    await AsyncStorage.removeItem(getNotificationsCacheKey(uid));
  } catch (error) {
    console.warn("Failed to clear cached notifications", error);
  }
};
