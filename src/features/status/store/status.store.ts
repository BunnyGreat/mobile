import { create } from "zustand";
import { fetchRequests, getCachedRequests, subscribeToRequests } from "../services/status.service";
import type { StatusStoreState, UnifiedRequest, FilterType } from "../types/status.types";
import { auth } from "../../../services/firebase/firebase";

export const useStatusStore = create<StatusStoreState>((set, get) => ({
  requests: [],
  loading: false,
  refreshing: false,
  error: null,
  activeFilter: "all",

  fetchRequests: async () => {
    set({ loading: true, error: null });

    try {
      const cached = await getCachedRequests();
      if (cached.length > 0) {
        set({ requests: cached, loading: false });
      } else {
        set({ requests: [], loading: false });
      }

      const fresh = await fetchRequests();
      set({ requests: fresh, loading: false, error: null });
    } catch (error) {
      const cached = await getCachedRequests();
      set({
        requests: cached,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load requests.",
      });
    }
  },

  refreshRequests: async () => {
    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchRequests();
      set({ requests: fresh, refreshing: false, error: null });
    } catch (error) {
      const cached = await getCachedRequests();
      set({
        requests: cached,
        refreshing: false,
        error: error instanceof Error ? error.message : "Unable to refresh requests.",
      });
    }
  },

  subscribeToRequests: () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
      return () => {};
    }

    const unsubscribe = subscribeToRequests(
      currentUser.uid,
      (requests) => {
        set({ requests, error: null });
      },
      (error) => {
        set({ error: error.message });
      },
    );

    return unsubscribe;
  },

  setActiveFilter: (filter: FilterType) => set({ activeFilter: filter }),

  clearError: () => set({ error: null }),
}));
