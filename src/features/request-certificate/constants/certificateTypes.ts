import type { CertificateTypeItem } from "../types/certificate.types";

export const CERTIFICATE_TYPES: CertificateTypeItem[] = [
  {
    id: "barangay-clearance",
    title: "Barangay Clearance",
    description: "Request a barangay clearance for official use.",
    disabled: false,
  },
  {
    id: "certificate-of-indigency",
    title: "Certificate of Indigency",
    description: "Apply for assistance with a Certificate of Indigency.",
    disabled: false,
  },
  {
    id: "barangay-certification",
    title: "Barangay Certification",
    description: "Request an official barangay certification.",
    disabled: false,
  },
  {
    id: "more-soon",
    title: "More Soon",
    description: "More certificates coming soon.",
    disabled: true,
    subtitle: "Coming Soon",
  },
];
