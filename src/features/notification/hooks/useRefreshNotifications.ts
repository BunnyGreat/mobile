import { useCallback } from "react";
import { useNotificationStore } from "../store/notification.store";

export const useRefreshNotifications = () => {
  const refreshNotifications = useNotificationStore((state) => state.refreshNotifications);

  return useCallback(() => refreshNotifications(), [refreshNotifications]);
};

export default useRefreshNotifications;
