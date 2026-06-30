import { useCallback } from "react";
import { useAnnouncementStore } from "../store/announcement.store";

export const useRefreshAnnouncements = () => {
  const refreshAnnouncements = useAnnouncementStore((state) => state.refreshAnnouncements);

  return useCallback(() => refreshAnnouncements(), [refreshAnnouncements]);
};

export default useRefreshAnnouncements;
