import { useCallback, useMemo, useRef, useState } from "react";
import { getCachedCertificateTypes } from "../services/certificateCache.service";
import { useCertificateStore } from "../store/certificate.store";
import { useProfileStore } from "../../profile/store/profile.store";
import {
  submitCertificateRequest,
  type CertificateFamilyInformation,
  type CertificateIndigencyRequestFor,
  type CertificateRequestType,
} from "../services/barangayClearance.service";
import { validateBarangayClearance } from "../services/certificateValidation.service";
import type { CertificateTypeItem } from "../types/certificate.types";
import type { CertificateStore } from "../store/certificate.store";
import { INDIGENCY_PURPOSES } from "../constants/indigencyPurposes";
import { validateBusinessPermit } from "../services/businessPermitValidation.service";
import type {
  BusinessPermitFormValues,
  BusinessPermitRequestFor,
} from "../types/businessPermit.types";

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
  const submissionInProgress = useRef(false);

  const selectCertificateType = useCallback(
    (type: CertificateTypeItem) => {
      if (type.disabled) return;
      setSelectedCertificateTypeId(type.id);
    },
    [setSelectedCertificateTypeId],
  );

  const validate = useCallback((
    certificateType: CertificateRequestType,
    familyInformation?: CertificateFamilyInformation,
    requestFor?: CertificateIndigencyRequestFor | BusinessPermitRequestFor,
    businessInformation?: BusinessPermitFormValues,
  ) => {
    const validationErrors: Record<string, string> = {};
    if (certificateType === "Barangay Clearance") {
      Object.assign(validationErrors, validateBarangayClearance({ purpose }));
    } else if (
      certificateType === "Certificate of Indigency" &&
      !INDIGENCY_PURPOSES.some((option) => option === purpose)
    ) {
      validationErrors.purpose =
        "Select a valid purpose for your Certificate of Indigency request.";
    } else if (certificateType === "Business Permit") {
      Object.assign(
        validationErrors,
        validateBusinessPermit(
          businessInformation ?? {
            businessName: "",
            natureOfBusiness: "",
            initialCapital: "",
            businessAddress: "",
            applicationType: "",
            businessOwnerFullName: "",
            homeAddress: "",
            contactNumber: "",
          },
        ),
      );
      if (requestFor !== "new" && requestFor !== "renew") {
        validationErrors.applicationType =
          "Select New Application or Renewal.";
      }
    }

    if (certificateType === "Certificate of Indigency" && familyInformation) {
      if (!familyInformation.name.trim()) {
        validationErrors.familyName = "Enter the name of the person.";
      }
      if (!familyInformation.relationship.trim()) {
        validationErrors.relationship = "Enter the relationship to the person.";
      }
      if (!familyInformation.whereItWillBeUsed.trim()) {
        validationErrors.whereItWillBeUsed =
          "Enter where the certificate will be used.";
      }
    }

    if (certificateType === "Certificate of Indigency" && !requestFor) {
      validationErrors.requestFor = "Select who the certificate is for.";
    }

    if (
      certificateType === "Certificate of Indigency" &&
      requestFor === "relative" &&
      !familyInformation
    ) {
      validationErrors.familyName =
        "Complete the family information for this request.";
    }

    if (certificateType !== "Barangay Clearance") {
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
          profile.personalInformation.contactNumber,
          ...(certificateType === "Business Permit"
            ? []
            : [profile.personalInformation.dateOfBirth]),
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
    familyInformation?: CertificateFamilyInformation,
    requestFor?: CertificateIndigencyRequestFor | BusinessPermitRequestFor,
    businessInformation?: BusinessPermitFormValues,
  ) => {
    if (submissionInProgress.current) return null;

    if (!profile) {
      setErrors({
        [certificateType === "Barangay Clearance" ? "purpose" : "profile"]:
          "Resident profile must be loaded before submitting.",
      });
      return null;
    }

    if (
      !validate(
        certificateType,
        familyInformation,
        requestFor,
        businessInformation,
      )
    ) {
      return null;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const requestId = await submitCertificateRequest(
        profile,
        certificateType,
        certificateType === "Barangay Clearance" ||
          certificateType === "Certificate of Indigency"
          ? purpose
          : undefined,
        familyInformation,
        requestFor,
        businessInformation,
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
      submissionInProgress.current = false;
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
