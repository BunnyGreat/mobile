import { useEffect, useMemo } from "react";
import { useNotificationStore } from "../store/notification.store";

export const useNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const loading = useNotificationStore((state) => state.loading);
  const refreshing = useNotificationStore((state) => state.refreshing);
  const error = useNotificationStore((state) => state.error);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const clearError = useNotificationStore((state) => state.clearError);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshing,
      error,
      clearError,
    }),
    [notifications, unreadCount, loading, refreshing, error, clearError],
  );
};

export default useNotifications;
