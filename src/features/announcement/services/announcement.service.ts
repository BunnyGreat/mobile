import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase/firebase";
import type { Announcement } from "../types/announcement.types";
import { loadAnnouncementsCache, saveAnnouncementsCache } from "./announcementCache.service";

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const announcementsRef = collection(db, "announcements");
  const q = query(
    announcementsRef,
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  const announcements = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      announcementId: doc.id,
      title: data.title ?? "",
      description: data.description ?? "",
      bannerUrl: data.bannerUrl ?? null,
      category: data.category ?? "Community Notice",
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      isActive: Boolean(data.isActive),
    } satisfies Announcement;
  });

  await saveAnnouncementsCache(announcements);
  return announcements;
};

export const getCachedAnnouncements = async (): Promise<Announcement[]> => {
  return loadAnnouncementsCache();
};
