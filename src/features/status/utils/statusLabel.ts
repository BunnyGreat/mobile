import type { RequestStatus, CertificateType } from "../types/status.types";

export const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "pending":
      return "Pending";
    case "under_review":
      return "Under Review";
    case "rescheduled":
      return "Rescheduled";
    case "approved":
      return "Approved";
    case "ready_for_pickup":
      return "Ready for Pickup";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
    default:
      return "Submitted";
  }
};

export const getCertificateTypeLabel = (type: CertificateType): string => {
  switch (type) {
    case "barangay_clearance":
      return "Barangay Clearance";
    case "certificate_of_indigency":
      return "Certificate of Indigency";
    case "certificate_of_residency":
      return "Certificate of Residency";
    default:
      return "Certificate";
  }
};
