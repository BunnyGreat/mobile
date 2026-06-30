import type { CertificateStatus, AppointmentStatus, RequestType, RequestStatus } from "../types/status.types";

export const getStatusDescription = (status: RequestStatus): string => {
  switch (status) {
    case "submitted":
      return "Your request has been successfully submitted and is waiting for review.";
    case "under_review":
      return "Our barangay staff is currently reviewing your request.";
    case "approved":
      return "Your request has been approved.";
    case "ready_for_pickup":
      return "Your document is ready for pickup at the Barangay Office.";
    case "completed":
      return "This request has been completed.";
    case "rejected":
      return "Unfortunately, your request has been rejected.\nPlease review the reason provided by the Barangay Office.";
    default:
      return "";
  }
};

export const getCertificateTimeline = (): CertificateStatus[] => [
  "submitted",
  "under_review",
  "approved",
  "ready_for_pickup",
  "completed",
];

export const getCertificateTimelineWithRejection = (): CertificateStatus[] => [
  "submitted",
  "under_review",
  "rejected",
];

export const getAppointmentTimeline = (): AppointmentStatus[] => [
  "submitted",
  "under_review",
  "approved",
  "completed",
];

export const getAppointmentTimelineWithRejection = (): AppointmentStatus[] => [
  "submitted",
  "under_review",
  "rejected",
];

export const getTimelineForRequest = (
  type: RequestType,
  currentStatus: RequestStatus,
): RequestStatus[] => {
  if (type === "certificate") {
    const certStatus = currentStatus as CertificateStatus;
    if (certStatus === "rejected") {
      return getCertificateTimelineWithRejection() as RequestStatus[];
    }
    return getCertificateTimeline() as RequestStatus[];
  } else {
    const appStatus = currentStatus as AppointmentStatus;
    if (appStatus === "rejected") {
      return getAppointmentTimelineWithRejection() as RequestStatus[];
    }
    return getAppointmentTimeline() as RequestStatus[];
  }
};

export const getStepStatus = (
  stepName: RequestStatus,
  currentStatus: RequestStatus,
  timeline: RequestStatus[],
): "completed" | "current" | "future" => {
  const stepIndex = timeline.indexOf(stepName);
  const currentIndex = timeline.indexOf(currentStatus);

  if (stepIndex < currentIndex) {
    return "completed";
  } else if (stepIndex === currentIndex) {
    return "current";
  } else {
    return "future";
  }
};
