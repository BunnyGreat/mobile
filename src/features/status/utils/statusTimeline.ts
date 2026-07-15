import { getStatusLabel } from "./statusLabel";
import type {
  CertificateStatus,
  AppointmentStatus,
  RequestStatus,
  RequestType,
  StatusTimelineItem,
} from "../types/status.types";

const buildTimelineItem = (status: RequestStatus, description: string, detail?: string): StatusTimelineItem => ({
  status,
  title: getStatusLabel(status),
  description,
  detail,
});

const buildAppointmentTimeline = (
  currentStatus: AppointmentStatus,
  includeRescheduledStep: boolean,
): StatusTimelineItem[] => {
  const base = [
    buildTimelineItem("submitted", "Your appointment request has been successfully submitted."),
    buildTimelineItem("pending", "Your appointment is waiting for the barangay office review."),
    buildTimelineItem("under_review", "Barangay staff are reviewing the details of your appointment."),
  ];

  if (currentStatus === "rejected") {
    return [...base, buildTimelineItem("rejected", "Your appointment request was not approved.", "")];
  }

  const approvedStep = buildTimelineItem("approved", "Your appointment has been approved.");
  const completedStep = buildTimelineItem("completed", "Your appointment has been completed.");
  const rescheduledStep = buildTimelineItem(
    "rescheduled",
    "Your appointment was rescheduled.",
    "The new date and time are shown below.",
  );

  if (includeRescheduledStep) {
    if (currentStatus === "completed") {
      return [...base, approvedStep, rescheduledStep, completedStep];
    }

    return [...base, approvedStep, rescheduledStep];
  }

  if (currentStatus === "completed") {
    return [...base, approvedStep, completedStep];
  }

  return [...base, approvedStep];
};

const buildCertificateTimeline = (currentStatus: CertificateStatus): StatusTimelineItem[] => {
  const base = [
    buildTimelineItem("submitted", "Your certificate request has been submitted."),
    buildTimelineItem("under_review", "Barangay staff are reviewing your request."),
  ];

  if (currentStatus === "rejected") {
    return [...base, buildTimelineItem("rejected", "Your certificate request was rejected.", "")];
  }

  if (currentStatus === "approved" || currentStatus === "ready_for_pickup" || currentStatus === "completed") {
    return [...base, buildTimelineItem("approved", "Your certificate request has been approved."), buildTimelineItem("ready_for_pickup", "Your certificate is ready for pickup."), buildTimelineItem("completed", "Your certificate request has been completed.")];
  }

  return [...base, buildTimelineItem("approved", "Your certificate request will be approved after review."), buildTimelineItem("ready_for_pickup", "Your certificate will be ready for pickup."), buildTimelineItem("completed", "Your certificate request will be completed once all steps are finished.")];
};

export const getTimelineForRequest = (
  type: RequestType,
  currentStatus: RequestStatus,
  includeRescheduledStep = false,
): StatusTimelineItem[] => {
  if (type === "certificate") {
    return buildCertificateTimeline(currentStatus as CertificateStatus);
  }

  return buildAppointmentTimeline(currentStatus as AppointmentStatus, includeRescheduledStep);
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
