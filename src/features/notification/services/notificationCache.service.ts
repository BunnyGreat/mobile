import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notification } from "../types/notification.types";

const NOTIFICATIONS_CACHE_KEY = "notification_cache";
const NOTIFICATION_READ_STATE_KEY = "notification_read_state";

type NotificationReadStateMap = Record<string, boolean>;

export const saveNotificationsCache = async (notifications: Notification[]) => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn("Failed to cache notifications", error);
  }
};

export const loadNotificationsCache = async (): Promise<Notification[]> => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY);
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

export const saveNotificationReadState = async (notificationId: string, isRead: boolean) => {
  try {
    const previousState = await loadNotificationReadStateMap();
    const nextState = { ...previousState, [notificationId]: isRead };
    await AsyncStorage.setItem(NOTIFICATION_READ_STATE_KEY, JSON.stringify(nextState));
  } catch (error) {
    console.warn("Failed to persist notification read state", error);
  }
};

export const loadNotificationReadStateMap = async (): Promise<NotificationReadStateMap> => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_READ_STATE_KEY);
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

export const clearNotificationsCache = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear cached notifications", error);
  }
};
