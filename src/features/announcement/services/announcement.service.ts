import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase/firebase";
import type { Announcement } from "../types/announcement.types";
import { loadAnnouncementsCache, saveAnnouncementsCache } from "./announcementCache.service";

const getDateValue = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return "";
};

const toAnnouncement = (docSnap: { id: string; data: () => Record<string, unknown> }): Announcement => {
  const data = docSnap.data();
  const publishedAt = getDateValue(data.publishedAt);
  const publishDate = getDateValue(data.publishDate);
  const createdAtValue = getDateValue(data.createdAt);
  const updatedAtValue = getDateValue(data.updatedAt);

  return {
    announcementId: docSnap.id,
    title: (data.title as string | undefined) ?? "",
    description: (data.description as string | undefined) ?? "",
    bannerUrl: (data.bannerUrl as string | null | undefined) ?? null,
    category: (data.category as string | undefined) ?? "Community Notice",
    status: (data.status as Announcement["status"]) ?? "Published",
    publishDate: publishDate || null,
    publishedAt: publishedAt || null,
    createdAt: createdAtValue || publishedAt || publishDate || new Date().toISOString(),
    updatedAt: updatedAtValue || createdAtValue || publishedAt || publishDate || new Date().toISOString(),
    isActive: Boolean(data.isActive),
    createdBy: (data.createdBy as string | null | undefined) ?? null,
    createdById: (data.createdById as string | null | undefined) ?? null,
    staffRole: (data.staffRole as string | null | undefined) ?? null,
  };
};

const getSortTimestamp = (announcement: Announcement): number => {
  const value = announcement.publishedAt || announcement.publishDate || announcement.createdAt;
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const announcementsRef = collection(db, "announcements");
  const q = query(announcementsRef, where("status", "==", "Published"));

  const snapshot = await getDocs(q);
  const announcements = snapshot.docs.map(toAnnouncement).sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));

  await saveAnnouncementsCache(announcements);
  return announcements;
};

export const getCachedAnnouncements = async (): Promise<Announcement[]> => {
  const cached = await loadAnnouncementsCache();

  return cached
    .filter((announcement) => announcement.status === "Published")
    .sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));
};
