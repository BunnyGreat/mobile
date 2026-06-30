import type { RequestStatus } from "../types/status.types";

export const getStatusIcon = (status: RequestStatus): string => {
  switch (status) {
    case "submitted":
      return "send";
    case "under_review":
      return "eye";
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
