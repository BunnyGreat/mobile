import { useEffect, useMemo } from "react";
import { useStatusStore } from "../store/status.store";

export const useStatus = () => {
  const requests = useStatusStore((state) => state.requests);
  const loading = useStatusStore((state) => state.loading);
  const refreshing = useStatusStore((state) => state.refreshing);
  const error = useStatusStore((state) => state.error);
  const activeFilter = useStatusStore((state) => state.activeFilter);
  const fetchRequests = useStatusStore((state) => state.fetchRequests);
  const subscribeToRequests = useStatusStore((state) => state.subscribeToRequests);
  const setActiveFilter = useStatusStore((state) => state.setActiveFilter);
  const clearError = useStatusStore((state) => state.clearError);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const unsubscribe = subscribeToRequests();
    return () => unsubscribe();
  }, [subscribeToRequests]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") {
      return requests;
    } else if (activeFilter === "certificates") {
      return requests.filter((r) => r.type === "certificate");
    } else {
      return requests.filter((r) => r.type === "appointment");
    }
  }, [requests, activeFilter]);

  return useMemo(
    () => ({
      requests: filtered,
      allRequests: requests,
      loading,
      refreshing,
      error,
      activeFilter,
      setActiveFilter,
      clearError,
    }),
    [filtered, requests, loading, refreshing, error, activeFilter, setActiveFilter, clearError],
  );
};

export default useStatus;
