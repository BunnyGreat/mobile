import { create } from "zustand";
import { getDashboard } from "../services/dashboard.service";
import type { DashboardData, HomeStore } from "../types/home.types";

export const useHomeStore = create<HomeStore>((set) => ({
  dashboard: null,
  loading: false,
  refreshing: false,
  error: null,

  setDashboard: (data: DashboardData) => set({ dashboard: data, error: null }),

  setLoading: (loading: boolean) => set({ loading }),

  setRefreshing: (refreshing: boolean) => set({ refreshing }),

  setError: (error: string | null) => set({ error }),

  loadDashboard: async () => {
    set({ loading: true, error: null });

    try {
      const dashboard = await getDashboard();
      set({ dashboard, loading: false, error: null });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to load dashboard.";
      console.error("[HOME]", error);
      set({ loading: false, error: message, dashboard: null });
    }
  },

  refreshDashboard: async () => {
    set({ refreshing: true, error: null });

    try {
      const dashboard = await getDashboard();
      set({ dashboard, refreshing: false, error: null });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to refresh dashboard.";
      console.error("[HOME]", error);
      set({ refreshing: false, error: message });
    }
  },

  clearDashboard: () =>
    set({ dashboard: null, loading: false, refreshing: false, error: null }),
}));
