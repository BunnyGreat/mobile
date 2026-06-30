import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UnifiedRequest } from "../types/status.types";

const STATUS_CACHE_KEY = "status_requests_cache";

export const saveStatusCache = async (requests: UnifiedRequest[]) => {
  try {
    await AsyncStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.warn("Failed to cache status requests", error);
  }
};

export const loadStatusCache = async (): Promise<UnifiedRequest[]> => {
  try {
    const raw = await AsyncStorage.getItem(STATUS_CACHE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as UnifiedRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load cached status requests", error);
    return [];
  }
};

export const clearStatusCache = async () => {
  try {
    await AsyncStorage.removeItem(STATUS_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear cached status requests", error);
  }
};
