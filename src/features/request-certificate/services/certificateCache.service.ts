import { getCertificateTypes } from "./certificate.service";
import type { CertificateTypeItem } from "../types/certificate.types";

let cachedCertificateTypes: CertificateTypeItem[] | null = null;

export const getCachedCertificateTypes = (): CertificateTypeItem[] => {
  if (cachedCertificateTypes) {
    return cachedCertificateTypes;
  }

  cachedCertificateTypes = getCertificateTypes();
  return cachedCertificateTypes;
};

export const clearCertificateTypeCache = (): void => {
  cachedCertificateTypes = null;
};
