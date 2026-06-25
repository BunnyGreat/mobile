import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@notifications_enabled";
const LOG_PREFIX = "[SETTINGS NOTIFICATION]";

export const getNotificationPreference = async (): Promise<boolean> => {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (rawValue === null) {
      return true;
    }

    return rawValue === "true";
  } catch (error: unknown) {
    console.error(LOG_PREFIX, error);
    return true;
  }
};

export const setNotificationPreference = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch (error: unknown) {
    console.error(LOG_PREFIX, error);
  }
};
