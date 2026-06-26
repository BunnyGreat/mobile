import { useCallback, useState } from "react";

export const useRefreshProfile = (refresh: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error: unknown) {
      console.warn("[PROFILE REFRESH] Refresh failed", error);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return {
    refreshing,
    refresh: onRefresh,
  };
};
