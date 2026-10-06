import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "../types/profile.types";

const PROFILE_CACHE_PREFIX = "@profile:cache";
const LEGACY_PROFILE_CACHE_KEY = PROFILE_CACHE_PREFIX;

export const saveProfileCache = async (profile: Profile): Promise<void> => {
  if (!profile.uid) {
    return;
  }

  try {
    await AsyncStorage.setItem(
      `${PROFILE_CACHE_PREFIX}:${profile.uid}`,
      JSON.stringify(profile),
    );
    await AsyncStorage.removeItem(LEGACY_PROFILE_CACHE_KEY);
  } catch (error: unknown) {
    console.error("[PROFILE CACHE] Failed to save cache", error);
  }
};

export const loadProfileCache = async (uid: string): Promise<Profile | null> => {
  if (!uid) {
    return null;
  }

  try {
    await AsyncStorage.removeItem(LEGACY_PROFILE_CACHE_KEY);
    const rawValue = await AsyncStorage.getItem(`${PROFILE_CACHE_PREFIX}:${uid}`);
    if (!rawValue) {
      return null;
    }

    const profile = JSON.parse(rawValue) as Profile;
    if (profile.uid !== uid) {
      await AsyncStorage.removeItem(`${PROFILE_CACHE_PREFIX}:${uid}`);
      return null;
    }

    return profile;
  } catch (error: unknown) {
    console.error("[PROFILE CACHE] Failed to load cache", error);
    return null;
  }
};

export const clearProfileCache = async (uid: string): Promise<void> => {
  if (!uid) {
    return;
  }

  try {
    await AsyncStorage.removeItem(`${PROFILE_CACHE_PREFIX}:${uid}`);
  } catch (error: unknown) {
    console.error("[PROFILE CACHE] Failed to clear cache", error);
  }
};
