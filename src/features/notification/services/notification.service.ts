import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import type { Notification, NotificationType } from "../types/notification.types";
import {
  loadNotificationReadStateMap,
  loadNotificationsCache,
  clearNotificationsCache,
  saveNotificationReadState,
  saveNotificationReadStates,
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

const getRecipientUid = (data: Record<string, unknown>): string => {
  const residentUid = data.residentUid;
  if (typeof residentUid === "string" && residentUid.length > 0) {
    return residentUid;
  }

  const uid = data.uid;
  return typeof uid === "string" ? uid : "";
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
    uid: getRecipientUid(data),
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

const mergeNotificationsById = (existing: Notification[], incoming: Notification[]): Notification[] => {
  const byId = new Map<string, Notification>();

  existing.forEach((notification) => {
    if (notification.notificationId) {
      byId.set(notification.notificationId, notification);
    }
  });

  incoming.forEach((notification) => {
    if (notification.notificationId) {
      byId.set(notification.notificationId, notification);
    }
  });

  return Array.from(byId.values()).sort(sortByCreatedAtDesc);
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
      const ownerUid = getRecipientUid(data);
      return ownerUid === uid || (type === "announcement" && data.isBroadcast === true);
    })
    .map((docSnap) => toNotification(docSnap, readStateMap))
    .sort(sortByCreatedAtDesc);

  return notifications;
};

export const fetchNotifications = async (uid: string): Promise<Notification[]> => {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Authentication required.");
  }

  const notificationsRef = collection(db, "notifications");
  const residentQuery = query(notificationsRef, where("residentUid", "==", uid));
  const legacyUserQuery = query(notificationsRef, where("uid", "==", uid));
  const broadcastQuery = query(notificationsRef, where("isBroadcast", "==", true));

  const [residentSnapshot, legacyUserSnapshot, broadcastSnapshot] = await Promise.all([
    getDocs(residentQuery),
    getDocs(legacyUserQuery),
    getDocs(broadcastQuery),
  ]);

  if (auth.currentUser?.uid !== uid) {
    throw new Error("Authentication changed while loading notifications.");
  }
  const readStateMap = await loadNotificationReadStateMap(uid);
  const notifications = await buildNotificationsForCurrentUser(
    uid,
    [residentSnapshot, legacyUserSnapshot, broadcastSnapshot],
    readStateMap,
  );

  const deduped = mergeNotificationsById([], notifications);
  await saveNotificationsCache(uid, deduped);
  if (auth.currentUser?.uid !== uid) {
    await clearNotificationsCache(uid);
    throw new Error("Authentication changed while loading notifications.");
  }
  return deduped;
};

export const getCachedNotifications = async (uid: string): Promise<Notification[]> => {
  if (!uid) {
    return [];
  }

  const cached = await loadNotificationsCache(uid);
  const readStateMap = await loadNotificationReadStateMap(uid);

  return cached
    .map((notification) => ({
      ...notification,
      isRead: readStateMap[notification.notificationId] ?? notification.isRead,
    }))
    .sort(sortByCreatedAtDesc);
};

export const markNotificationAsRead = async (
  uid: string,
  notificationId: string,
): Promise<void> => {
  await saveNotificationReadState(uid, notificationId, true);
};

export const markNotificationsAsRead = async (
  uid: string,
  notificationIds: string[],
): Promise<void> => {
  await saveNotificationReadStates(uid, notificationIds);
};

export const subscribeToNotifications = (
  uid: string,
  onUpdate: (notifications: Notification[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Authentication required.");
  }

  const notificationsRef = collection(db, "notifications");
  const residentQuery = query(notificationsRef, where("residentUid", "==", uid));
  const legacyUserQuery = query(notificationsRef, where("uid", "==", uid));
  const broadcastQuery = query(notificationsRef, where("isBroadcast", "==", true));

  let residentDocs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
  let legacyUserDocs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
  let broadcastDocs: Array<{ id: string; data: () => Record<string, unknown> }> = [];

  const emitNotifications = async () => {
    if (auth.currentUser?.uid !== uid) {
      return;
    }
    const readStateMap = await loadNotificationReadStateMap(uid);
    if (auth.currentUser?.uid !== uid) {
      return;
    }
    const notifications = await buildNotificationsForCurrentUser(
      uid,
      [{ docs: residentDocs }, { docs: legacyUserDocs }, { docs: broadcastDocs }],
      readStateMap,
    );

    const deduped = mergeNotificationsById([], notifications);
    await saveNotificationsCache(uid, deduped);
    if (auth.currentUser?.uid === uid) {
      onUpdate(deduped);
    } else {
      await clearNotificationsCache(uid);
    }
  };

  const handleError = (error: Error) => {
    console.error("Notification listener error:", error);
    onError?.(error);
  };

  const unsubscribeResident = onSnapshot(
    residentQuery,
    (snapshot) => {
      residentDocs = snapshot.docs;
      void emitNotifications();
    },
    (error) => handleError(error as Error),
  );

  const unsubscribeLegacyUser = onSnapshot(
    legacyUserQuery,
    (snapshot) => {
      legacyUserDocs = snapshot.docs;
      void emitNotifications();
    },
    (error) => handleError(error as Error),
  );

  const unsubscribeBroadcast = onSnapshot(
    broadcastQuery,
    (snapshot) => {
      broadcastDocs = snapshot.docs;
      void emitNotifications();
    },
    (error) => handleError(error as Error),
  );

  return () => {
    unsubscribeResident();
    unsubscribeLegacyUser();
    unsubscribeBroadcast();
  };
};
