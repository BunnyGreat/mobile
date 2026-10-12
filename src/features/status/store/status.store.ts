import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import {
  fetchRequests,
  getCachedRequests,
  subscribeToRequests,
} from "../services/status.service";
import { loadArchivedRequests } from "../services/archive.service";
import type {
  StatusStoreState,
  UnifiedRequest,
  FilterType,
} from "../types/status.types";
import { auth } from "../../../services/firebase/firebase";

const requestSubscribers = new Set<symbol>();
let requestSubscriptionUid: string | null = null;
let requestSubscription: (() => void) | null = null;
let activeUid: string | null = auth.currentUser?.uid ?? null;

const isArchivedRequest = (
  request: UnifiedRequest,
  archived: Array<{ id: string; type: UnifiedRequest["type"] }>,
): boolean => {
  return archived.some((item) => item.id === request.id && item.type === request.type);
};

export const isActiveRequest = (request: UnifiedRequest): boolean => {
  return request.status !== "completed" && request.status !== "rejected";
};

const isCurrentUser = (uid: string) =>
  activeUid === uid && auth.currentUser?.uid === uid;

export const useStatusStore = create<StatusStoreState>((set) => ({
  requests: [],
  loading: false,
  refreshing: false,
  error: null,
  activeFilter: "all",
  archivedRequests: [],

  fetchRequests: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !isCurrentUser(uid)) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const cached = await getCachedRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      set({ requests: cached, loading: false });

      const fresh = await fetchRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      const archived = await loadArchivedRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      const visibleRequests = fresh.filter((request) => isActiveRequest(request));
      const archivedEntries = fresh.filter((request) => !isActiveRequest(request))
        .filter((request) => isArchivedRequest(request, archived) || !isActiveRequest(request));
      set({
        requests: visibleRequests,
        loading: false,
        error: null,
        archivedRequests: archivedEntries,
      });
    } catch (error) {
      if (!isCurrentUser(uid)) {
        return;
      }
      const cached = await getCachedRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      set({
        requests: cached,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load requests.",
      });
    }
  },

  refreshRequests: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !isCurrentUser(uid)) {
      return;
    }

    set({ refreshing: true, error: null });

    try {
      const fresh = await fetchRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      const archived = await loadArchivedRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      const visibleRequests = fresh.filter((request) => isActiveRequest(request));
      const archivedEntries = fresh.filter((request) => !isActiveRequest(request))
        .filter((request) => isArchivedRequest(request, archived) || !isActiveRequest(request));
      set({
        requests: visibleRequests,
        refreshing: false,
        error: null,
        archivedRequests: archivedEntries,
      });
    } catch (error) {
      if (!isCurrentUser(uid)) {
        return;
      }
      const cached = await getCachedRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      set({
        requests: cached,
        refreshing: false,
        error: error instanceof Error ? error.message : "Unable to refresh requests.",
      });
    }
  },

  subscribeToRequests: () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return () => {};
    }

    const subscriberId = Symbol("request-subscriber");
    requestSubscribers.add(subscriberId);

    if (activeUid !== uid) {
      requestSubscription?.();
      requestSubscription = null;
      requestSubscriptionUid = null;
      activeUid = uid;
      useStatusStore.setState({
        requests: [],
        archivedRequests: [],
        loading: true,
        refreshing: false,
        error: null,
      });
    }

    bindRequestSubscription(uid);

    return () => {
      requestSubscribers.delete(subscriberId);
      if (requestSubscribers.size === 0) {
        requestSubscription?.();
        requestSubscription = null;
        requestSubscriptionUid = null;
      }
    };
  },

  setActiveFilter: (filter: FilterType) => set({ activeFilter: filter }),

  clearError: () => set({ error: null }),
}));

function bindRequestSubscription(uid: string) {
  if (
    requestSubscriptionUid === uid &&
    requestSubscription
  ) {
    return;
  }

  requestSubscription?.();
  requestSubscription = null;
  requestSubscriptionUid = uid;

  if (requestSubscribers.size === 0 || !isCurrentUser(uid)) {
    return;
  }

  requestSubscription = subscribeToRequests(
    uid,
    async (requests) => {
      if (!isCurrentUser(uid)) {
        return;
      }
      const archived = await loadArchivedRequests(uid);
      if (!isCurrentUser(uid)) {
        return;
      }
      const visibleRequests = requests.filter((request) => isActiveRequest(request));
      const archivedEntries = requests.filter((request) => !isActiveRequest(request))
        .filter((request) => isArchivedRequest(request, archived) || !isActiveRequest(request));
      useStatusStore.setState({
        requests: visibleRequests,
        error: null,
        archivedRequests: archivedEntries,
        loading: false,
      });
    },
    (error) => {
      if (isCurrentUser(uid)) {
        useStatusStore.setState({ error: error.message });
      }
    },
  );
}

onAuthStateChanged(auth, (user) => {
  const uid = user?.uid ?? null;
  if (activeUid === uid) {
    return;
  }

  requestSubscription?.();
  requestSubscription = null;
  requestSubscriptionUid = null;
  activeUid = uid;
  useStatusStore.setState({
    requests: [],
    archivedRequests: [],
    loading: Boolean(uid),
    refreshing: false,
    error: null,
  });

  if (uid) {
    bindRequestSubscription(uid);
  }
});
