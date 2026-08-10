import { useCallback } from "react";
import { useNotificationStore } from "../store/notification.store";

export const useMarkAllAsRead = () => {
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return useCallback(() => markAllAsRead(), [markAllAsRead]);
};

export default useMarkAllAsRead;
