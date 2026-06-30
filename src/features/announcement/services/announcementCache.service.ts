import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Announcement } from "../types/announcement.types";

const ANNOUNCEMENTS_CACHE_KEY = "announcement_cache";

export const saveAnnouncementsCache = async (announcements: Announcement[]) => {
  try {
    await AsyncStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(announcements));
  } catch (error) {
    console.warn("Failed to cache announcements", error);
  }
};

export const loadAnnouncementsCache = async (): Promise<Announcement[]> => {
  try {
    const raw = await AsyncStorage.getItem(ANNOUNCEMENTS_CACHE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Announcement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load cached announcements", error);
    return [];
  }
};

export const clearAnnouncementsCache = async () => {
  try {
    await AsyncStorage.removeItem(ANNOUNCEMENTS_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear cached announcements", error);
  }
};
