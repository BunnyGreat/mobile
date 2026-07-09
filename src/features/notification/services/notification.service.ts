import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase/firebase";
import type { Notification } from "../types/notification.types";
import {
  loadNotificationReadStateMap,
  loadNotificationsCache,
  saveNotificationReadState,
  saveNotificationsCache,
} from "./notificationCache.service";

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

const toNotification = (
  docSnap: { id: string; data: () => Record<string, unknown> },
  readStateMap: Record<string, boolean>,
): Notification => {
  const data = docSnap.data();
  const createdAtValue = getDateValue(data.createdAt);
  const updatedAtValue = getDateValue(data.updatedAt);

  return {
    notificationId: docSnap.id,
    uid: (data.uid as string | undefined) ?? "",
    title: (data.title as string | undefined) ?? "",
    message: (data.message as string | undefined) ?? "",
    type: (data.type as Notification["type"]) ?? "announcement",
    referenceId: ((data.announcementId as string | null | undefined) ?? (data.referenceId as string | null | undefined) ?? null),
    isRead: readStateMap[docSnap.id] ?? Boolean(data.isRead),
    createdAt: createdAtValue || new Date().toISOString(),
    updatedAt: updatedAtValue || createdAtValue || new Date().toISOString(),
  };
};

const sortByCreatedAtDesc = (a: Notification, b: Notification): number => {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
};

export const fetchNotifications = async (): Promise<Notification[]> => {
  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("type", "==", "announcement"), orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  const readStateMap = await loadNotificationReadStateMap();
  const notifications = snapshot.docs.map((docSnap) => toNotification(docSnap, readStateMap)).sort(sortByCreatedAtDesc);

  await saveNotificationsCache(notifications);
  return notifications;
};

export const getCachedNotifications = async (): Promise<Notification[]> => {
  const cached = await loadNotificationsCache();
  const readStateMap = await loadNotificationReadStateMap();

  return cached
    .map((notification) => ({
      ...notification,
      isRead: readStateMap[notification.notificationId] ?? notification.isRead,
    }))
    .sort(sortByCreatedAtDesc);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await saveNotificationReadState(notificationId, true);
};

export const subscribeToNotifications = (
  _uid: string,
  onUpdate: (notifications: Notification[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("type", "==", "announcement"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const readStateMap = await loadNotificationReadStateMap();
      const notifications = snapshot.docs
        .map((docSnap) => toNotification(docSnap, readStateMap))
        .sort(sortByCreatedAtDesc);

      await saveNotificationsCache(notifications);
      onUpdate(notifications);
    },
    (error) => {
      console.error("Notification listener error:", error);
      onError?.(error as Error);
    },
  );

  return unsubscribe;
};
