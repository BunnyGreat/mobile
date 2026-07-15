import type { RequestStatus } from "../types/status.types";

export const getStatusIcon = (status: RequestStatus): string => {
  switch (status) {
    case "submitted":
      return "send";
    case "pending":
      return "clock";
    case "under_review":
      return "eye";
    case "rescheduled":
      return "calendar";
    case "approved":
      return "check-circle";
    case "ready_for_pickup":
      return "package";
    case "completed":
      return "check";
    case "rejected":
      return "x-circle";
    default:
      return "help-circle";
  }
};
