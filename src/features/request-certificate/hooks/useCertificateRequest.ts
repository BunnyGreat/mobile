import { useCallback, useMemo, useState } from "react";
import { getCachedCertificateTypes } from "../services/certificateCache.service";
import { useCertificateStore } from "../store/certificate.store";
import { useProfileStore } from "../../profile/store/profile.store";
import { submitBarangayClearanceRequest } from "../services/barangayClearance.service";
import { validateBarangayClearance } from "../services/certificateValidation.service";
import type { CertificateTypeItem } from "../types/certificate.types";
import type { CertificateStore } from "../store/certificate.store";

export const useCertificateRequest = () => {
  const certificateTypes = useMemo(
    () => getCachedCertificateTypes(),
    [],
  );
  const selectedCertificateTypeId = useCertificateStore(
    (state: CertificateStore) => state.selectedCertificateTypeId,
  );
  const setSelectedCertificateTypeId = useCertificateStore(
    (state: CertificateStore) => state.setSelectedCertificateTypeId,
  );

  const selectedType = useMemo<CertificateTypeItem | null>(() => {
    const foundType = certificateTypes.find(
      (type) => type.id === selectedCertificateTypeId,
    );
    return foundType ?? null;
  }, [certificateTypes, selectedCertificateTypeId]);

  const profile = useProfileStore((state) => state.profile);
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectCertificateType = useCallback(
    (type: CertificateTypeItem) => {
      if (type.disabled) return;
      setSelectedCertificateTypeId(type.id);
    },
    [setSelectedCertificateTypeId],
  );

  const validate = useCallback(() => {
    const validationErrors = validateBarangayClearance({ purpose });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [purpose]);

  const submitRequest = useCallback(async () => {
    if (!profile) {
      setErrors({ purpose: "Resident profile must be loaded before submitting." });
      return null;
    }

    if (!validate()) {
      return null;
    }

    setIsSubmitting(true);

    try {
      const requestId = await submitBarangayClearanceRequest(purpose, profile);
      return requestId;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit Barangay Clearance request.";
      setErrors({ purpose: message });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [profile, purpose, validate]);

  return {
    certificateTypes,
    selectedType,
    selectCertificateType,
    purpose,
    setPurpose,
    errors,
    isSubmitting,
    submitRequest,
  };
};

export default useCertificateRequest;
