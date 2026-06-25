import { create } from "zustand";
import { getSettingsProfile, logoutUser } from "../services/settings.service";
import {
  getNotificationPreference,
  setNotificationPreference,
} from "../services/notification.service";
import type { SettingsProfile } from "../types/settings.types";

export interface SettingsStore {
  profile: SettingsProfile | null;
  isLoading: boolean;
  logoutLoading: boolean;
  error: string | null;
  logoutError: string | null;
  notificationsEnabled: boolean;
  loadProfile: () => Promise<void>;
  loadNotificationPreference: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  logout: () => Promise<boolean>;
  clearSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  profile: null,
  isLoading: false,
  logoutLoading: false,
  error: null,
  logoutError: null,
  notificationsEnabled: true,
  loadProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const profile = await getSettingsProfile();
      set({ profile, isLoading: false, error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to load profile.";
      set({ error: message, isLoading: false });
    }
  },
  loadNotificationPreference: async () => {
    try {
      const enabled = await getNotificationPreference();
      set({ notificationsEnabled: enabled });
    } catch {
      set({ notificationsEnabled: true });
    }
  },
  toggleNotifications: async () => {
    const current = get().notificationsEnabled;
    const next = !current;
    set({ notificationsEnabled: next });

    try {
      await setNotificationPreference(next);
    } catch {
      set({ notificationsEnabled: true });
    }
  },
  logout: async () => {
    set({ logoutLoading: true, logoutError: null });

    const result = await logoutUser();
    if (!result.success) {
      set({ logoutLoading: false, logoutError: result.error });
      return false;
    }

    set({
      profile: null,
      error: null,
      logoutLoading: false,
      logoutError: null,
    });
    return true;
  },
  clearSettings: () =>
    set({
      profile: null,
      error: null,
      logoutError: null,
      logoutLoading: false,
    }),
}));
