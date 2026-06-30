import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import type { Notification } from "../types/notification.types";
import { loadNotificationsCache, saveNotificationsCache } from "./notificationCache.service";

export const fetchNotifications = async (): Promise<Notification[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error("Authentication required.");
  }

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("uid", "==", currentUser.uid),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      notificationId: docSnap.id,
      uid: data.uid ?? "",
      title: data.title ?? "",
      message: data.message ?? "",
      type: data.type ?? "announcement",
      referenceId: data.referenceId ?? null,
      isRead: Boolean(data.isRead),
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    } satisfies Notification;
  });

  await saveNotificationsCache(notifications);
  return notifications;
};

export const getCachedNotifications = async (): Promise<Notification[]> => {
  return loadNotificationsCache();
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error("Authentication required.");
  }

  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, {
    isRead: true,
    updatedAt: new Date().toISOString(),
  });
};

export const subscribeToNotifications = (
  uid: string,
  onUpdate: (notifications: Notification[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("uid", "==", uid), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          notificationId: docSnap.id,
          uid: data.uid ?? "",
          title: data.title ?? "",
          message: data.message ?? "",
          type: data.type ?? "announcement",
          referenceId: data.referenceId ?? null,
          isRead: Boolean(data.isRead),
          createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
        } satisfies Notification;
      });

      saveNotificationsCache(notifications);
      onUpdate(notifications);
    },
    (error) => {
      console.error("Notification listener error:", error);
      onError?.(error as Error);
    },
  );

  return unsubscribe;
};
