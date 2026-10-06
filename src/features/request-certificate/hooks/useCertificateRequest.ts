import { useCallback, useMemo, useState } from "react";
import { getCachedCertificateTypes } from "../services/certificateCache.service";
import { useCertificateStore } from "../store/certificate.store";
import { useProfileStore } from "../../profile/store/profile.store";
import {
  submitCertificateRequest,
  type CertificateRequestType,
} from "../services/barangayClearance.service";
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

  const validate = useCallback((certificateType: CertificateRequestType) => {
    const validationErrors =
      certificateType === "Barangay Clearance"
        ? validateBarangayClearance({ purpose })
        : {};

    if (certificateType === "Barangay Certification") {
      if (!profile) {
        validationErrors.profile = "Resident profile must be loaded before submitting.";
      } else {
        const fullAddress = [
          profile.residenceInformation.houseNumber,
          profile.residenceInformation.street,
          profile.residenceInformation.purok,
          profile.residenceInformation.barangay,
          profile.residenceInformation.municipality,
          profile.residenceInformation.province,
        ]
          .filter(Boolean)
          .join(", ");
        const residentInformation = [
          profile.personalInformation.firstName,
          profile.personalInformation.lastName,
          fullAddress,
          profile.personalInformation.dateOfBirth,
          profile.personalInformation.contactNumber,
        ];
        if (residentInformation.some((value) => !value?.trim())) {
          validationErrors.profile =
            "Complete your registered resident information before submitting this request.";
        }
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [profile, purpose]);

  const submitRequest = useCallback(async (
    certificateType: CertificateRequestType = "Barangay Clearance",
  ) => {
    if (!profile) {
      setErrors({
        [certificateType === "Barangay Clearance" ? "purpose" : "profile"]:
          "Resident profile must be loaded before submitting.",
      });
      return null;
    }

    if (!validate(certificateType)) {
      return null;
    }

    setIsSubmitting(true);

    try {
      const requestId = await submitCertificateRequest(
        profile,
        certificateType,
        certificateType === "Barangay Clearance" ? purpose : undefined,
      );
      return requestId;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : `Unable to submit ${certificateType} request.`;
      setErrors({
        [certificateType === "Barangay Clearance" ? "purpose" : "profile"]:
          message,
      });
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
