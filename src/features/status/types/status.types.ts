export type CertificateStatus = "submitted" | "under_review" | "approved" | "ready_for_pickup" | "completed" | "rejected";
export type AppointmentStatus = "submitted" | "pending" | "under_review" | "rescheduled" | "approved" | "completed" | "rejected";
export type RequestStatus = CertificateStatus | AppointmentStatus;

export type CertificateType =
  | "barangay_clearance"
  | "certificate_of_indigency"
  | "certificate_of_residency"
  | "Barangay Certification"
  | "Certificate of Indigency"
  | "Business Permit";
export type RequestType = "certificate" | "appointment";

export interface CertificateRequest {
  certificateId: string;
  uid: string;
  certificateType: CertificateType;
  status: CertificateStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface AppointmentRequest {
  appointmentId: string;
  uid: string;
  purpose: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  appointmentDate?: string;
  appointmentTime?: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
  displayAppointmentDate?: string;
  displayAppointmentTime?: string;
  hasRescheduleNotification?: boolean;
  rejectionReason?: string;
}

export interface UnifiedRequest {
  id: string;
  type: RequestType;
  title: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  raw: CertificateRequest | AppointmentRequest;
}

export interface StatusTimelineItem {
  status: RequestStatus;
  title: string;
  description: string;
  detail?: string;
}

export type FilterType = "all" | "certificates" | "appointments" | "archive";

export interface StatusStoreState {
  requests: UnifiedRequest[];
  archivedRequests: UnifiedRequest[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  activeFilter: FilterType;
  fetchRequests: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  subscribeToRequests: () => () => void;
  setActiveFilter: (filter: FilterType) => void;
  clearError: () => void;
}
