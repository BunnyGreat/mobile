import { useEffect, useMemo } from "react";
import { useHomeStore } from "../store/home.store";

export const useDashboard = () => {
  const dashboard = useHomeStore((state) => state.dashboard);
  const loading = useHomeStore((state) => state.loading);
  const refreshing = useHomeStore((state) => state.refreshing);
  const error = useHomeStore((state) => state.error);
  const loadDashboard = useHomeStore((state) => state.loadDashboard);
  const refreshDashboard = useHomeStore((state) => state.refreshDashboard);

  useEffect(() => {
    if (dashboard !== null) {
      return;
    }

    void loadDashboard();
  }, [dashboard, loadDashboard]);

  return useMemo(
    () => ({
      dashboard,
      greeting: dashboard?.greeting,
      quickActions: dashboard?.quickActions ?? [],
      loading,
      refreshing,
      error,
      loadDashboard,
      refreshDashboard,
    }),
    [dashboard, loading, refreshing, error, loadDashboard, refreshDashboard],
  );
};

export default useDashboard;
