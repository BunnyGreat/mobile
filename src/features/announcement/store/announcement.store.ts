import { create } from "zustand";
import { fetchAnnouncements, getCachedAnnouncements } from "../services/announcement.service";
import type { Announcement, AnnouncementFilter, AnnouncementStoreState } from "../types/announcement.types";

const initialState = {
  announcements: [] as Announcement[],
  loading: false,
  refreshing: false,
  error: null as string | null,
  activeCategory: "latest" as AnnouncementFilter,
};

export const useAnnouncementStore = create<AnnouncementStoreState>((set, get) => ({
  ...initialState,
  loadAnnouncements: async () => {
    set({ loading: true, error: null });

    try {
      const cached = await getCachedAnnouncements();
      if (cached.length > 0) {
        set({ announcements: cached, loading: false });
      } else {
        set({ announcements: [], loading: false });
      }

      const fresh = await fetchAnnouncements();
      set({ announcements: fresh, loading: false, error: null });
    } catch (error) {
      const cached = await getCachedAnnouncements();
      set({
        announcements: cached,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load announcements.",
      });
    }
  },
  refreshAnnouncements: async () => {
    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchAnnouncements();
      set({ announcements: fresh, refreshing: false, error: null });
    } catch (error) {
      const cached = await getCachedAnnouncements();
      set({
        announcements: cached,
        refreshing: false,
        error: error instanceof Error ? error.message : "Unable to refresh announcements.",
      });
    }
  },
  setActiveCategory: (category) => set({ activeCategory: category }),
  clearError: () => set({ error: null }),
}));
