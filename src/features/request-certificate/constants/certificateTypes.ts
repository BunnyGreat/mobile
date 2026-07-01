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
    description: "Coming soon",
    disabled: true,
    subtitle: "Coming Soon",
  },
  {
    id: "barangay-certification",
    title: "Barangay Certification",
    description: "Coming soon",
    disabled: true,
    subtitle: "Coming Soon",
  },
  {
    id: "more-soon",
    title: "More Soon",
    description: "More certificates coming soon.",
    disabled: true,
    subtitle: "Coming Soon",
  },
];
