import { addDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import type { Notification, NotificationType } from "../types/notification.types";
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
    action: (data.action as string | undefined) ?? undefined,
    metadata: (data.metadata as Record<string, unknown> | undefined) ?? undefined,
    isRead: readStateMap[docSnap.id] ?? Boolean(data.isRead),
    createdAt: createdAtValue || new Date().toISOString(),
    updatedAt: updatedAtValue || createdAtValue || new Date().toISOString(),
  };
};

const sortByCreatedAtDesc = (a: Notification, b: Notification): number => {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt);
};

const buildNotificationsForCurrentUser = async (
  uid: string,
  snapshots: Array<{ docs: Array<{ id: string; data: () => Record<string, unknown> }> }>,
  readStateMap: Record<string, boolean>,
): Promise<Notification[]> => {
  const filteredDocs = snapshots.flatMap((snapshot) => snapshot.docs);

  const notifications = filteredDocs
    .filter((docSnap) => {
      const data = docSnap.data();
      const type = (data.type as Notification["type"] | undefined) ?? "announcement";
      const residentUid = (data.residentUid as string | undefined) ?? "";

      if (type === "announcement") {
        return true;
      }

      if (!uid) {
        return false;
      }

      return residentUid === uid;
    })
    .map((docSnap) => toNotification(docSnap, readStateMap))
    .sort(sortByCreatedAtDesc);

  return notifications;
};

export const fetchNotifications = async (): Promise<Notification[]> => {
  const uid = auth.currentUser?.uid ?? "";
  const notificationsRef = collection(db, "notifications");
  const announcementQuery = query(notificationsRef, where("type", "==", "announcement"));
  const residentQuery = query(notificationsRef, where("type", "in", ["appointment", "certificate"]));

  const [announcementSnapshot, residentSnapshot] = await Promise.all([
    getDocs(announcementQuery),
    getDocs(residentQuery),
  ]);

  const readStateMap = await loadNotificationReadStateMap();
  const notifications = await buildNotificationsForCurrentUser(
    uid,
    [announcementSnapshot, residentSnapshot],
    readStateMap,
  );

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

export const createResidentNotification = async ({
  uid,
  title,
  message,
  type,
  referenceId,
  action,
  metadata,
}: {
  uid: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId: string;
  action?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> => {
  const now = new Date().toISOString();

  await addDoc(collection(db, "notifications"), {
    uid,
    residentUid: uid,
    title,
    message,
    type,
    referenceId,
    action,
    metadata,
    createdAt: now,
    updatedAt: now,
    isRead: false,
  });
};

export const subscribeToNotifications = (
  uid: string,
  onUpdate: (notifications: Notification[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const notificationsRef = collection(db, "notifications");
  const announcementQuery = query(notificationsRef, where("type", "==", "announcement"));
  const residentQuery = query(notificationsRef, where("type", "in", ["appointment", "certificate"]));

  let announcementDocs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
  let residentDocs: Array<{ id: string; data: () => Record<string, unknown> }> = [];

  const emitNotifications = async () => {
    const readStateMap = await loadNotificationReadStateMap();
    const notifications = await buildNotificationsForCurrentUser(
      uid,
      [{ docs: announcementDocs }, { docs: residentDocs }],
      readStateMap,
    );

    await saveNotificationsCache(notifications);
    onUpdate(notifications);
  };

  const handleError = (error: Error) => {
    console.error("Notification listener error:", error);
    onError?.(error);
  };

  const unsubscribeAnnouncement = onSnapshot(
    announcementQuery,
    (snapshot) => {
      announcementDocs = snapshot.docs;
      void emitNotifications();
    },
    (error) => handleError(error as Error),
  );

  const unsubscribeResident = onSnapshot(
    residentQuery,
    (snapshot) => {
      residentDocs = snapshot.docs.filter((docSnap) => {
        const data = docSnap.data();
        const residentUid = (data.residentUid as string | undefined) ?? "";
        return !uid || residentUid === uid;
      });
      void emitNotifications();
    },
    (error) => handleError(error as Error),
  );

  return () => {
    unsubscribeAnnouncement();
    unsubscribeResident();
  };
};
