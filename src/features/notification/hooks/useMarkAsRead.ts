import { useCallback } from "react";
import { useNotificationStore } from "../store/notification.store";

export const useMarkAsRead = () => {
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  return useCallback((notificationId: string) => markAsRead(notificationId), [markAsRead]);
};

export default useMarkAsRead;
