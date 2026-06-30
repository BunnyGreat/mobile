import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notification } from "../types/notification.types";

const NOTIFICATIONS_CACHE_KEY = "notification_cache";

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

export const clearNotificationsCache = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear cached notifications", error);
  }
};
