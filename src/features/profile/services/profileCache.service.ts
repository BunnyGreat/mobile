import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "../types/profile.types";

const PROFILE_CACHE_KEY = "@profile:cache";

export const saveProfileCache = async (profile: Profile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch (error: unknown) {
    console.error("[PROFILE CACHE] Failed to save cache", error);
  }
};

export const loadProfileCache = async (): Promise<Profile | null> => {
  try {
    const rawValue = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    return rawValue ? (JSON.parse(rawValue) as Profile) : null;
  } catch (error: unknown) {
    console.error("[PROFILE CACHE] Failed to load cache", error);
    return null;
  }
};

export const clearProfileCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (error: unknown) {
    console.error("[PROFILE CACHE] Failed to clear cache", error);
  }
};
