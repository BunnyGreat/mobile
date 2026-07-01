import type { CertificateTypeItem } from "../types/certificate.types";
import { CERTIFICATE_TYPES } from "../constants/certificateTypes";

export const getCertificateTypes = (): CertificateTypeItem[] => {
  return CERTIFICATE_TYPES;
};

export const submitCertificateRequest = async (): Promise<void> => {
  // This action is intentionally disabled for the current phase.
  return Promise.resolve();
};
