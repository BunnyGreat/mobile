export type AnnouncementFilter = "latest" | "old";

export interface Announcement {
  announcementId: string;
  title: string;
  description: string;
  bannerUrl?: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AnnouncementStoreState {
  announcements: Announcement[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  activeCategory: AnnouncementFilter;
  loadAnnouncements: () => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
  setActiveCategory: (category: AnnouncementFilter) => void;
  clearError: () => void;
}
