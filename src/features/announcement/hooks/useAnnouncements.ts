import { useEffect, useMemo } from "react";
import { useAnnouncementStore } from "../store/announcement.store";

export const useAnnouncements = () => {
  const announcements = useAnnouncementStore((state) => state.announcements);
  const loading = useAnnouncementStore((state) => state.loading);
  const refreshing = useAnnouncementStore((state) => state.refreshing);
  const error = useAnnouncementStore((state) => state.error);
  const activeCategory = useAnnouncementStore((state) => state.activeCategory);
  const loadAnnouncements = useAnnouncementStore((state) => state.loadAnnouncements);
  const refreshAnnouncements = useAnnouncementStore((state) => state.refreshAnnouncements);
  const setActiveCategory = useAnnouncementStore((state) => state.setActiveCategory);
  const clearError = useAnnouncementStore((state) => state.clearError);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  return useMemo(
    () => ({
      announcements,
      loading,
      refreshing,
      error,
      activeCategory,
      loadAnnouncements,
      refreshAnnouncements,
      setActiveCategory,
      clearError,
    }),
    [announcements, loading, refreshing, error, activeCategory, loadAnnouncements, refreshAnnouncements, setActiveCategory, clearError],
  );
};

export default useAnnouncements;
