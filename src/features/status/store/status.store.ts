import { create } from "zustand";
import { fetchRequests, getCachedRequests, subscribeToRequests } from "../services/status.service";
import { loadArchivedRequests } from "../services/archive.service";
import type { StatusStoreState, UnifiedRequest, FilterType } from "../types/status.types";
import { auth } from "../../../services/firebase/firebase";

export const useStatusStore = create<StatusStoreState>((set, get) => ({
  requests: [],
  loading: false,
  refreshing: false,
  error: null,
  activeFilter: "all",
  archivedRequests: [],

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
      const archived = await loadArchivedRequests();
      const visibleRequests = fresh.filter((request) => {
        const isArchived = archived.some((item) => item.id === request.id && item.type === request.type);
        if (request.status === "completed" || request.status === "rejected") {
          return !isArchived;
        }
        return true;
      });
      const archivedEntries = fresh.filter((request) => {
        const isArchived = archived.some((item) => item.id === request.id && item.type === request.type);
        return request.status === "completed" || request.status === "rejected" ? isArchived : false;
      });
      set({ requests: visibleRequests, loading: false, error: null, archivedRequests: archivedEntries });
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
      const archived = await loadArchivedRequests();
      const visibleRequests = fresh.filter((request) => {
        const isArchived = archived.some((item) => item.id === request.id && item.type === request.type);
        if (request.status === "completed" || request.status === "rejected") {
          return !isArchived;
        }
        return true;
      });
      const archivedEntries = fresh.filter((request) => {
        const isArchived = archived.some((item) => item.id === request.id && item.type === request.type);
        return request.status === "completed" || request.status === "rejected" ? isArchived : false;
      });
      set({ requests: visibleRequests, refreshing: false, error: null, archivedRequests: archivedEntries });
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
      async (requests) => {
        const archived = await loadArchivedRequests();
        const visibleRequests = requests.filter((request) => {
          const isArchived = archived.some((item) => item.id === request.id && item.type === request.type);
          if (request.status === "completed" || request.status === "rejected") {
            return !isArchived;
          }
          return true;
        });
        const archivedEntries = requests.filter((request) => {
          const isArchived = archived.some((item) => item.id === request.id && item.type === request.type);
          return request.status === "completed" || request.status === "rejected" ? isArchived : false;
        });
        set({ requests: visibleRequests, error: null, archivedRequests: archivedEntries });
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
