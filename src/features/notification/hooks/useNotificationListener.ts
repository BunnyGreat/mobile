import { useEffect } from "react";
import { useNotificationStore } from "../store/notification.store";

export const useNotificationListener = () => {
  const subscribeToNotifications = useNotificationStore((state) => state.subscribeToNotifications);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications();
    return () => unsubscribe();
  }, [subscribeToNotifications]);
};

export default useNotificationListener;
