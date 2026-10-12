import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UnifiedRequest } from "../types/status.types";

const STATUS_CACHE_PREFIX = "@barangay/status/requests";
const LEGACY_STATUS_CACHE_KEY = "status_requests_cache";
let legacyCacheCleanup: Promise<void> | null = null;

const getStatusCacheKey = (uid: string) => `${STATUS_CACHE_PREFIX}:${uid}`;

const removeLegacyStatusCache = async () => {
  if (!legacyCacheCleanup) {
    legacyCacheCleanup = AsyncStorage.removeItem(LEGACY_STATUS_CACHE_KEY).catch((error) => {
      console.warn("Failed to remove legacy status cache", error);
    });
  }
  await legacyCacheCleanup;
};

export const saveStatusCache = async (uid: string, requests: UnifiedRequest[]) => {
  if (!uid) {
    throw new Error("Authentication required to cache status requests.");
  }

  try {
    await removeLegacyStatusCache();
    await AsyncStorage.setItem(getStatusCacheKey(uid), JSON.stringify(requests));
  } catch (error) {
    console.warn("Failed to cache status requests", error);
  }
};

export const loadStatusCache = async (uid: string): Promise<UnifiedRequest[]> => {
  if (!uid) {
    return [];
  }

  try {
    await removeLegacyStatusCache();
    const raw = await AsyncStorage.getItem(getStatusCacheKey(uid));
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

export const clearStatusCache = async (uid: string) => {
  if (!uid) {
    return;
  }

  try {
    await AsyncStorage.removeItem(getStatusCacheKey(uid));
  } catch (error) {
    console.warn("Failed to clear cached status requests", error);
  }
};
