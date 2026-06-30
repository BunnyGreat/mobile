import { COLORS } from "../../../theme";
import type { RequestStatus } from "../types/status.types";

export const getStatusColor = (status: RequestStatus): string => {
  switch (status) {
    case "submitted":
      return COLORS.primary;
    case "under_review":
      return COLORS.warning;
    case "approved":
      return COLORS.success;
    case "ready_for_pickup":
      return COLORS.success;
    case "completed":
      return COLORS.success;
    case "rejected":
      return COLORS.danger;
    default:
      return COLORS.placeholder;
  }
};
