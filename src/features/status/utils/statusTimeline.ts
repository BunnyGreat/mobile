import { getStatusLabel } from "./statusLabel";
import type {
  CertificateStatus,
  AppointmentStatus,
  RequestStatus,
  RequestType,
  StatusTimelineItem,
} from "../types/status.types";

const buildTimelineItem = (status: RequestStatus): StatusTimelineItem => ({
  status,
  title: getStatusLabel(status),
  description:
    status === "submitted"
      ? "Your request has been successfully submitted and is waiting for review."
      : status === "under_review"
      ? "Our barangay staff is currently reviewing your request."
      : status === "approved"
      ? "Your request has been approved."
      : status === "ready_for_pickup"
      ? "Your document is ready for pickup at the Barangay Office."
      : status === "completed"
      ? "This request has been completed."
      : status === "rejected"
      ? "Unfortunately, your request has been rejected.\nPlease review the reason provided by the Barangay Office."
      : "",
});

export const getCertificateTimeline = (): StatusTimelineItem[] => [
  buildTimelineItem("submitted"),
  buildTimelineItem("under_review"),
  buildTimelineItem("approved"),
  buildTimelineItem("ready_for_pickup"),
  buildTimelineItem("completed"),
];

export const getCertificateTimelineWithRejection = (): StatusTimelineItem[] => [
  buildTimelineItem("submitted"),
  buildTimelineItem("under_review"),
  buildTimelineItem("rejected"),
];

export const getAppointmentTimeline = (): StatusTimelineItem[] => [
  buildTimelineItem("submitted"),
  buildTimelineItem("under_review"),
  buildTimelineItem("approved"),
  buildTimelineItem("completed"),
];

export const getAppointmentTimelineWithRejection = (): StatusTimelineItem[] => [
  buildTimelineItem("submitted"),
  buildTimelineItem("under_review"),
  buildTimelineItem("rejected"),
];

export const getTimelineForRequest = (
  type: RequestType,
  currentStatus: RequestStatus,
): StatusTimelineItem[] => {
  if (type === "certificate") {
    const certStatus = currentStatus as CertificateStatus;
    if (certStatus === "rejected") {
      return getCertificateTimelineWithRejection();
    }
    return getCertificateTimeline();
  }

  const appStatus = currentStatus as AppointmentStatus;
  if (appStatus === "rejected") {
    return getAppointmentTimelineWithRejection();
  }
  return getAppointmentTimeline();
};

export const getStepStatus = (
  step: StatusTimelineItem,
  currentStatus: RequestStatus,
  timeline: StatusTimelineItem[],
): "completed" | "current" | "future" => {
  const stepIndex = timeline.findIndex((item) => item.status === step.status);
  const currentIndex = timeline.findIndex(
    (item) => item.status === currentStatus,
  );

  if (stepIndex < currentIndex) {
    return "completed";
  }
  if (stepIndex === currentIndex) {
    return "current";
  }
  return "future";
};
