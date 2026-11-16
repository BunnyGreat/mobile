import { create } from "zustand";
import { getProfile } from "../services/profile.service";
import type { Profile, ProfileStore } from "../types/profile.types";

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,
  error: null,
  loadProfile: async () => {
    set({ loading: true, error: null });

    try {
      const profile = await getProfile();
      set({ profile, loading: false, error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to load profile.";
      console.error("[PROFILE]", error);
      set({ loading: false, error: message, profile: null });
    }
  },
  refreshProfile: async () => {
    set({ loading: true, error: null });

    try {
      const profile = await getProfile();
      set({ profile, loading: false, error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to refresh profile.";
      console.error("[PROFILE]", error);
      set({ loading: false, error: message });
    }
  },
  updateProfile: (profile: Profile) => set({ profile }),
  clearProfile: () => set({ profile: null, loading: false, error: null }),
}));
