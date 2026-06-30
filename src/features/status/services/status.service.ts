import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import type {
  UnifiedRequest,
  CertificateRequest,
  AppointmentRequest,
} from "../types/status.types";
import { loadStatusCache, saveStatusCache } from "./statusCache.service";
import { getCertificateTypeLabel } from "../utils/statusLabel";

const unifyRequests = (
  certificates: CertificateRequest[],
  appointments: AppointmentRequest[],
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

  appointments.forEach((appt) => {
    unified.push({
      id: appt.appointmentId,
      type: "appointment",
      title: appt.purpose || "Appointment",
      status: appt.status,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
      raw: appt,
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
    return {
      certificateId: doc.id,
      uid: data.uid ?? "",
      certificateType: data.certificateType ?? "barangay_clearance",
      status: data.status ?? "submitted",
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    } satisfies CertificateRequest;
  });

  const apptRef = collection(db, "appointments");
  const apptQuery = query(apptRef, where("uid", "==", currentUser.uid));
  const apptSnapshot = await getDocs(apptQuery);
  const appointments = apptSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      appointmentId: doc.id,
      uid: data.uid ?? "",
      purpose: data.purpose ?? "",
      status: data.status ?? "submitted",
      createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    } satisfies AppointmentRequest;
  });

  const unified = unifyRequests(certificates, appointments);
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
  let certUnsubscribe: (() => void) | null = null;
  let apptUnsubscribe: (() => void) | null = null;

  const updateUI = () => {
    const unified = unifyRequests(certificates, appointments);
    saveStatusCache(unified);
    onUpdate(unified);
  };

  certUnsubscribe = onSnapshot(
    certQuery,
    (snapshot) => {
      certificates = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          certificateId: doc.id,
          uid: data.uid ?? "",
          certificateType: data.certificateType ?? "barangay_clearance",
          status: data.status ?? "submitted",
          createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
        } satisfies CertificateRequest;
      });
      updateUI();
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
        return {
          appointmentId: doc.id,
          uid: data.uid ?? "",
          purpose: data.purpose ?? "",
          status: data.status ?? "submitted",
          createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
        } satisfies AppointmentRequest;
      });
      updateUI();
    },
    (error) => {
      console.error("Appointment listener error:", error);
      onError?.(error as Error);
    },
  );

  return () => {
    certUnsubscribe?.();
    apptUnsubscribe?.();
  };
};
