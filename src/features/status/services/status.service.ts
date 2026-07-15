import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import type {
  UnifiedRequest,
  CertificateRequest,
  AppointmentRequest,
  RequestStatus,
} from "../types/status.types";
import { loadStatusCache, saveStatusCache } from "./statusCache.service";
import { getCertificateTypeLabel } from "../utils/statusLabel";
import {
  createResidentNotification,
  fetchNotifications,
  subscribeToNotifications,
} from "../../notification/services/notification.service";
import { archiveRequest } from "./archive.service";
import type {
  Notification,
  NotificationType,
} from "../../notification/types/notification.types";

const normalizeCertificateStatus = (status: unknown): CertificateRequest["status"] => {
  const value = String(status ?? "submitted").toLowerCase();
  if (value === "pending") {
    return "submitted";
  }
  if (value === "under_review" || value === "under review") {
    return "under_review";
  }
  if (value === "approved") {
    return "approved";
  }
  if (value === "ready_for_pickup" || value === "ready for pickup") {
    return "ready_for_pickup";
  }
  if (value === "completed") {
    return "completed";
  }
  if (value === "rejected") {
    return "rejected";
  }
  return "submitted";
};

const normalizeAppointmentStatus = (status: unknown): AppointmentRequest["status"] => {
  const value = String(status ?? "submitted").toLowerCase();
  if (value === "pending") {
    return "pending";
  }
  if (value === "under_review" || value === "under review") {
    return "under_review";
  }
  if (value === "rescheduled") {
    return "rescheduled";
  }
  if (value === "approved") {
    return "approved";
  }
  if (value === "completed") {
    return "completed";
  }
  if (value === "rejected") {
    return "rejected";
  }
  return "submitted";
};

const appointmentStatusHistory = new Map<string, AppointmentRequest["status"]>();
const certificateStatusHistory = new Map<string, CertificateRequest["status"]>();

const buildAppointmentNotificationMessage = (
  status: AppointmentRequest["status"],
  appointment: AppointmentRequest,
): { title: string; message: string } => {
  switch (status) {
    case "pending":
      return {
        title: "Appointment Pending",
        message: "Your appointment is waiting for review.",
      };
    case "under_review":
      return {
        title: "Appointment Under Review",
        message: "Barangay staff are reviewing your appointment.",
      };
    case "rescheduled":
      return {
        title: "Appointment Rescheduled",
        message: `Your appointment has been rescheduled.\n\nNew Schedule\n${appointment.rescheduledDate || appointment.appointmentDate || "TBD"}\n${appointment.rescheduledTime || appointment.appointmentTime || "TBD"}`,
      };
    case "approved":
      return {
        title: "Appointment Approved",
        message: "Your appointment has been approved.",
      };
    case "completed":
      return {
        title: "Appointment Completed",
        message: "Thank you for completing your appointment.",
      };
    case "rejected":
      return {
        title: "Appointment Rejected",
        message: appointment.rejectionReason
          ? `Your appointment request has been rejected. Reason: ${appointment.rejectionReason}`
          : "Your appointment request has been rejected.",
      };
    default:
      return {
        title: "Appointment Submitted",
        message: "Your appointment request has been submitted successfully.",
      };
  }
};

const buildCertificateNotificationMessage = (
  status: CertificateRequest["status"],
  certificate: CertificateRequest,
): { title: string; message: string } => {
  switch (status) {
    case "under_review":
      return {
        title: "Certificate Under Review",
        message: "Barangay staff are reviewing your certificate request.",
      };
    case "approved":
      return {
        title: "Certificate Approved",
        message: "Your certificate request has been approved.",
      };
    case "ready_for_pickup":
      return {
        title: "Certificate Ready for Pickup",
        message: "Your certificate is ready for pickup at the Barangay Office.",
      };
    case "completed":
      return {
        title: "Certificate Completed",
        message: "Your certificate request has been completed.",
      };
    case "rejected":
      return {
        title: "Certificate Rejected",
        message: certificate.rejectionReason
          ? `Your certificate request has been rejected. Reason: ${certificate.rejectionReason}`
          : "Your certificate request has been rejected.",
      };
    default:
      return {
        title: "Certificate Submitted",
        message: "Your certificate request has been submitted successfully.",
      };
  }
};

const getNotificationMetadataValue = (
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined => {
  const value = metadata?.[key];
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value && typeof value === "object" && "toDate" in value) {
    const dateValue = value as { toDate?: () => Date };
    if (typeof dateValue.toDate === "function") {
      return dateValue.toDate().toISOString();
    }
  }
  return undefined;
};

const resolveAppointmentSchedule = (
  appointment: AppointmentRequest,
  notifications: Notification[],
  fallbackAppointment?: AppointmentRequest,
): AppointmentRequest => {
  const matchingNotifications = notifications
    .filter((notification) => {
      const referenceId = notification.referenceId ?? "";
      return (
        notification.type === "appointment" &&
        Boolean(referenceId) &&
        referenceId === appointment.appointmentId
      );
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const rescheduleNotification = matchingNotifications.find(
    (notification) =>
      notification.action === "rescheduled" ||
      Boolean(
        getNotificationMetadataValue(notification.metadata, "appointmentDate") ||
          getNotificationMetadataValue(notification.metadata, "appointmentTime"),
      ),
  );

  const latestAppointmentDate =
    getNotificationMetadataValue(rescheduleNotification?.metadata, "appointmentDate") ||
    appointment.rescheduledDate ||
    appointment.appointmentDate ||
    fallbackAppointment?.displayAppointmentDate ||
    fallbackAppointment?.rescheduledDate ||
    fallbackAppointment?.appointmentDate;

  const latestAppointmentTime =
    getNotificationMetadataValue(rescheduleNotification?.metadata, "appointmentTime") ||
    appointment.rescheduledTime ||
    appointment.appointmentTime ||
    fallbackAppointment?.displayAppointmentTime ||
    fallbackAppointment?.rescheduledTime ||
    fallbackAppointment?.appointmentTime;

  return {
    ...appointment,
    appointmentDate: latestAppointmentDate || appointment.appointmentDate,
    appointmentTime: latestAppointmentTime || appointment.appointmentTime,
    displayAppointmentDate: latestAppointmentDate,
    displayAppointmentTime: latestAppointmentTime,
    hasRescheduleNotification: Boolean(rescheduleNotification),
  };
};

const maybeNotifyAndArchive = async ({
  uid,
  type,
  referenceId,
  status,
  title,
  createdAt,
  updatedAt,
  raw,
}: {
  uid: string;
  type: "appointment" | "certificate";
  referenceId: string;
  status: RequestStatus;
  title: string;
  createdAt: string;
  updatedAt: string;
  raw: CertificateRequest | AppointmentRequest;
}): Promise<void> => {
  if (!uid) {
    return;
  }

  if (type === "appointment") {
    const appointment = raw as AppointmentRequest;
    const previousStatus = appointmentStatusHistory.get(referenceId);
    const nextStatus = status as AppointmentRequest["status"];

    if (previousStatus && previousStatus !== nextStatus) {
      const notification = buildAppointmentNotificationMessage(nextStatus, appointment);
      await createResidentNotification({
        uid,
        title: notification.title,
        message: notification.message,
        type: "appointment" as NotificationType,
        referenceId,
        action: nextStatus === "rescheduled" ? "rescheduled" : undefined,
        metadata:
          nextStatus === "rescheduled"
            ? {
                appointmentDate: appointment.rescheduledDate || appointment.appointmentDate || "",
                appointmentTime: appointment.rescheduledTime || appointment.appointmentTime || "",
              }
            : undefined,
      });
    }

    if (nextStatus === "completed" || nextStatus === "rejected") {
      await archiveRequest({
        id: referenceId,
        type: "appointment",
        title,
        status: nextStatus,
        createdAt,
        updatedAt,
        raw: appointment,
      } as UnifiedRequest);
    }

    appointmentStatusHistory.set(referenceId, nextStatus);
    return;
  }

  const certificate = raw as CertificateRequest;
  const previousStatus = certificateStatusHistory.get(referenceId);
  const nextStatus = status as CertificateRequest["status"];

  if (previousStatus && previousStatus !== nextStatus) {
    const notification = buildCertificateNotificationMessage(nextStatus, certificate);
    await createResidentNotification({
      uid,
      title: notification.title,
      message: notification.message,
      type: "certificate" as NotificationType,
      referenceId,
    });
  }

  if (nextStatus === "completed" || nextStatus === "rejected") {
    await archiveRequest({
      id: referenceId,
      type: "certificate",
      title,
      status: nextStatus,
      createdAt,
      updatedAt,
      raw: certificate,
    } as UnifiedRequest);
  }

  certificateStatusHistory.set(referenceId, nextStatus);
};

const unifyRequests = (
  certificates: CertificateRequest[],
  appointments: AppointmentRequest[],
  notifications: Notification[] = [],
  fallbackAppointments: AppointmentRequest[] = [],
): UnifiedRequest[] => {
  const unified: UnifiedRequest[] = [];

  certificates.forEach((cert) => {
    unified.push({
      id: cert.certificateId,
      type: "certificate",
      title: getCertificateTypeLabel(cert.certificateType),
      status: cert.status,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt,
      raw: cert,
    });
  });

  const fallbackMap = new Map(
    fallbackAppointments.map((appointment) => [appointment.appointmentId, appointment]),
  );

  appointments.forEach((appt) => {
    const resolvedAppointment = resolveAppointmentSchedule(
      appt,
      notifications,
      fallbackMap.get(appt.appointmentId),
    );

    unified.push({
      id: resolvedAppointment.appointmentId,
      type: "appointment",
      title: resolvedAppointment.purpose || "Appointment",
      status: resolvedAppointment.status,
      createdAt: resolvedAppointment.createdAt,
      updatedAt: resolvedAppointment.updatedAt,
      raw: resolvedAppointment,
    });
  });

  return unified.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const fetchRequests = async (): Promise<UnifiedRequest[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error("Authentication required.");
  }

  const certRef = collection(db, "certificate_requests");
  const certQuery = query(certRef, where("uid", "==", currentUser.uid));
  const certSnapshot = await getDocs(certQuery);
  const certificates = certSnapshot.docs.map((doc) => {
    const data = doc.data();
    const status = normalizeCertificateStatus(data.status);
    return {
      certificateId: doc.id,
      uid: data.uid ?? "",
      certificateType: data.certificateType ?? "barangay_clearance",
      status,
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      rejectionReason: data.rejectionReason as string | undefined,
    } satisfies CertificateRequest;
  });

  const apptRef = collection(db, "appointments");
  const apptQuery = query(apptRef, where("uid", "==", currentUser.uid));
  const apptSnapshot = await getDocs(apptQuery);
  const appointments = apptSnapshot.docs.map((doc) => {
    const data = doc.data();
    const status = normalizeAppointmentStatus(data.status);
    return {
      appointmentId: (data.appointmentId as string | undefined) ?? doc.id,
      uid: data.uid ?? "",
      purpose: data.purpose ?? "",
      status,
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      appointmentDate: data.appointmentDate as string | undefined,
      appointmentTime: data.appointmentSlot as string | undefined,
      rescheduledDate: data.rescheduledDate as string | undefined,
      rescheduledTime: data.rescheduledTime as string | undefined,
      rejectionReason: data.rejectionReason as string | undefined,
    } satisfies AppointmentRequest;
  });

  const cachedRequests = await getCachedRequests();
  const fallbackAppointments = cachedRequests
    .filter((request) => request.type === "appointment")
    .map((request) => request.raw as AppointmentRequest)
    .filter(Boolean);
  const notifications = await fetchNotifications();
  const unified = unifyRequests(
    certificates,
    appointments,
    notifications,
    fallbackAppointments,
  );

  await Promise.all(
    unified.map((request) =>
      maybeNotifyAndArchive({
        uid: currentUser.uid,
        type: request.type,
        referenceId: request.id,
        status: request.status,
        title: request.title,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        raw: request.raw,
      }),
    ),
  );

  await saveStatusCache(unified);
  return unified;
};

export const getCachedRequests = async (): Promise<UnifiedRequest[]> => {
  return loadStatusCache();
};

export const subscribeToRequests = (
  uid: string,
  onUpdate: (requests: UnifiedRequest[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const certRef = collection(db, "certificate_requests");
  const certQuery = query(certRef, where("uid", "==", uid));

  const apptRef = collection(db, "appointments");
  const apptQuery = query(apptRef, where("uid", "==", uid));

  let certificates: CertificateRequest[] = [];
  let appointments: AppointmentRequest[] = [];
  let notifications: Notification[] = [];
  let certUnsubscribe: (() => void) | null = null;
  let apptUnsubscribe: (() => void) | null = null;
  let notificationUnsubscribe: (() => void) | null = null;

  const updateUI = async () => {
    const cachedRequests = await getCachedRequests();
    const fallbackAppointments = cachedRequests
      .filter((request) => request.type === "appointment")
      .map((request) => request.raw as AppointmentRequest)
      .filter(Boolean);

    const unified = unifyRequests(
      certificates,
      appointments,
      notifications,
      fallbackAppointments,
    );

    await Promise.all(
      unified.map((request) =>
        maybeNotifyAndArchive({
          uid,
          type: request.type,
          referenceId: request.id,
          status: request.status,
          title: request.title,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          raw: request.raw,
        }),
      ),
    );

    await saveStatusCache(unified);
    onUpdate(unified);
  };

  certUnsubscribe = onSnapshot(
    certQuery,
    (snapshot) => {
      certificates = snapshot.docs.map((doc) => {
        const data = doc.data();
        const status = normalizeCertificateStatus(data.status);
        return {
          certificateId: doc.id,
          uid: data.uid ?? "",
          certificateType: data.certificateType ?? "barangay_clearance",
          status,
          createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          rejectionReason: data.rejectionReason as string | undefined,
        } satisfies CertificateRequest;
      });
      void updateUI();
    },
    (error) => {
      console.error("Certificate listener error:", error);
      onError?.(error as Error);
    },
  );

  apptUnsubscribe = onSnapshot(
    apptQuery,
    (snapshot) => {
      appointments = snapshot.docs.map((doc) => {
        const data = doc.data();
        const status = normalizeAppointmentStatus(data.status);
        return {
          appointmentId: (data.appointmentId as string | undefined) ?? doc.id,
          uid: data.uid ?? "",
          purpose: data.purpose ?? "",
          status,
          createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          appointmentDate: (data.appointmentDate as string | undefined) ?? undefined,
          appointmentTime: ((data.appointmentTime as string | undefined) ?? (data.appointmentSlot as string | undefined)) ?? undefined,
          rescheduledDate: data.rescheduledDate as string | undefined,
          rescheduledTime: data.rescheduledTime as string | undefined,
          rejectionReason: data.rejectionReason as string | undefined,
        } satisfies AppointmentRequest;
      });
      void updateUI();
    },
    (error) => {
      console.error("Appointment listener error:", error);
      onError?.(error as Error);
    },
  );

  notificationUnsubscribe = subscribeToNotifications(
    uid,
    (nextNotifications) => {
      notifications = nextNotifications;
      void updateUI();
    },
    (error) => {
      console.error("Notification listener error:", error);
      onError?.(error as Error);
    },
  );

  return () => {
    certUnsubscribe?.();
    apptUnsubscribe?.();
    notificationUnsubscribe?.();
  };
};
