import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DashboardData } from "../types/home.types";

const HOME_CACHE_KEY = "@barangay/home/dashboard";

export const saveHomeCache = async (data: DashboardData): Promise<void> => {
  try {
    await AsyncStorage.setItem(HOME_CACHE_KEY, JSON.stringify(data));
  } catch (error: unknown) {
    console.error("[HOME CACHE] Failed to save cache", error);
  }
};

export const getHomeCache = async (): Promise<DashboardData | null> => {
  try {
    const rawValue = await AsyncStorage.getItem(HOME_CACHE_KEY);
    return rawValue ? (JSON.parse(rawValue) as DashboardData) : null;
  } catch (error: unknown) {
    console.error("[HOME CACHE] Failed to load cache", error);
    return null;
  }
};

export const removeHomeCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HOME_CACHE_KEY);
  } catch (error: unknown) {
    console.error("[HOME CACHE] Failed to remove cache", error);
  }
};

export const clearHomeCache = async (): Promise<void> => {
  await removeHomeCache();
};
