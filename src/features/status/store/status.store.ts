import { create } from "zustand";
import { fetchRequests, getCachedRequests, subscribeToRequests } from "../services/status.service";
import { loadArchivedRequests } from "../services/archive.service";
import type { StatusStoreState, UnifiedRequest, FilterType } from "../types/status.types";
import { auth } from "../../../services/firebase/firebase";

const requestSubscribers = new Set<symbol>();
let requestSubscriptionUid: string | null = null;
let requestSubscription: (() => void) | null = null;

const isArchivedRequest = (request: UnifiedRequest, archived: Array<{ id: string; type: UnifiedRequest["type"] }>): boolean => {
  return archived.some((item) => item.id === request.id && item.type === request.type);
};

export const isActiveRequest = (request: UnifiedRequest): boolean => {
  return request.status !== "completed" && request.status !== "rejected";
};

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
      const visibleRequests = fresh.filter((request) => isActiveRequest(request));
      const activeArchivedEntries = fresh.filter((request) => !isActiveRequest(request));
      const archivedEntries = activeArchivedEntries.filter((request) => isArchivedRequest(request, archived) || !isActiveRequest(request));
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
      const visibleRequests = fresh.filter((request) => isActiveRequest(request));
      const activeArchivedEntries = fresh.filter((request) => !isActiveRequest(request));
      const archivedEntries = activeArchivedEntries.filter((request) => isArchivedRequest(request, archived) || !isActiveRequest(request));
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

    if (requestSubscriptionUid !== currentUser.uid) {
      requestSubscription?.();
      requestSubscribers.clear();
      requestSubscriptionUid = currentUser.uid;
      requestSubscription = null;
    }

    const subscriberId = Symbol("request-subscriber");
    requestSubscribers.add(subscriberId);

    if (!requestSubscription) {
      requestSubscription = subscribeToRequests(
        currentUser.uid,
        async (requests) => {
          const archived = await loadArchivedRequests();
          const visibleRequests = requests.filter((request) => isActiveRequest(request));
          const activeArchivedEntries = requests.filter((request) => !isActiveRequest(request));
          const archivedEntries = activeArchivedEntries.filter((request) => isArchivedRequest(request, archived) || !isActiveRequest(request));
          set({ requests: visibleRequests, error: null, archivedRequests: archivedEntries });
        },
        (error) => {
          set({ error: error.message });
        },
      );
    }

    return () => {
      if (!requestSubscribers.delete(subscriberId) || requestSubscribers.size > 0) {
        return;
      }

      requestSubscription?.();
      requestSubscription = null;
      requestSubscriptionUid = null;
    };
  },

  setActiveFilter: (filter: FilterType) => set({ activeFilter: filter }),

  clearError: () => set({ error: null }),
}));
