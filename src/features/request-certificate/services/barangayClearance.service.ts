import { auth, db } from "../../../services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Profile } from "../../profile/types/profile.types";
import { generateReferenceNumber } from "../utils/generateReferenceNumber";
import { CLEARANCE_PURPOSES } from "../constants/clearancePurposes";
import { INDIGENCY_PURPOSES } from "../constants/indigencyPurposes";
import { validateBusinessPermit } from "./businessPermitValidation.service";
import { buildBusinessPermitPayload } from "../utils/buildBusinessPermitPayload";
import type {
  BusinessPermitFormValues,
  BusinessPermitRequestFor,
} from "../types/businessPermit.types";

export type CertificateRequestType =
  | "Barangay Clearance"
  | "Barangay Certification"
  | "Certificate of Indigency"
  | "Business Permit";

export interface CertificateFamilyInformation {
  name: string;
  relationship: string;
  purpose: string;
  whereItWillBeUsed: string;
}

export type CertificateIndigencyRequestFor = "self" | "relative";

export const submitCertificateRequest = async (
  profile: Profile,
  certificateType: CertificateRequestType,
  purpose?: string,
  familyInformation?: CertificateFamilyInformation,
  requestFor?: CertificateIndigencyRequestFor | BusinessPermitRequestFor,
  businessInformation?: BusinessPermitFormValues,
): Promise<string> => {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error("Unable to submit request: user is not authenticated.");
  }

  if (profile.uid !== currentUser.uid) {
    throw new Error(
      "Unable to submit request: resident profile does not match the authenticated account.",
    );
  }

  const requiresPurpose =
    certificateType === "Barangay Clearance" ||
    certificateType === "Certificate of Indigency";
  const requestPurpose = requiresPurpose ? purpose?.trim() : undefined;

  if (requiresPurpose && !requestPurpose) {
    throw new Error("Purpose is required.");
  }

  if (
    certificateType === "Barangay Clearance" &&
    !CLEARANCE_PURPOSES.some((option) => option === requestPurpose)
  ) {
    throw new Error("Select a valid Barangay Clearance purpose.");
  }

  if (
    certificateType === "Certificate of Indigency" &&
    !INDIGENCY_PURPOSES.some((option) => option === requestPurpose)
  ) {
    throw new Error("Select a valid Certificate of Indigency purpose.");
  }

  if (
    certificateType === "Certificate of Indigency" &&
    requestFor !== "self" &&
    requestFor !== "relative"
  ) {
    throw new Error("Specify whether the request is for yourself or a relative.");
  }

  if (
    certificateType !== "Certificate of Indigency" &&
    (requestFor || familyInformation)
  ) {
    if (
      certificateType !== "Business Permit" ||
      familyInformation ||
      (requestFor !== "new" && requestFor !== "renew")
    ) {
      throw new Error("Invalid request-specific information.");
    }
  }

  if (requestFor === "self" && familyInformation) {
    throw new Error("Family information is not valid for a self request.");
  }

  if (requestFor === "relative" && !familyInformation) {
    throw new Error("Family information is required for a relative request.");
  }

  if (
    certificateType === "Business Permit" &&
    (!businessInformation ||
      (requestFor !== "new" && requestFor !== "renew"))
  ) {
    throw new Error("Select an application type and complete the business information.");
  }

  if (
    certificateType !== "Business Permit" &&
    businessInformation
  ) {
    throw new Error("Business information is only valid for Business Permit requests.");
  }

  if (businessInformation) {
    const businessSubmission =
      buildBusinessPermitPayload(businessInformation);
    if (businessSubmission.requestFor !== requestFor) {
      throw new Error("The Business Permit application type is invalid.");
    }

    if (Object.keys(validateBusinessPermit(businessInformation)).length > 0) {
      throw new Error("Complete all required Business Permit fields correctly.");
    }
  }

  const requestFamilyInformation = familyInformation
    ? {
        name: familyInformation.name.trim(),
        relationship: familyInformation.relationship.trim(),
        purpose: familyInformation.purpose.trim(),
        whereItWillBeUsed: familyInformation.whereItWillBeUsed.trim(),
      }
    : undefined;

  if (
    requestFamilyInformation &&
    (!requestFamilyInformation.name ||
      !requestFamilyInformation.relationship ||
      !requestFamilyInformation.purpose ||
      !requestFamilyInformation.whereItWillBeUsed)
  ) {
    throw new Error("Complete all family information fields.");
  }

  const requestId = generateReferenceNumber();
  const now = new Date().toISOString();
  const businessSubmission = businessInformation
    ? buildBusinessPermitPayload(businessInformation)
    : undefined;

  const requestRef = doc(db, "certificate_requests", requestId);

  await setDoc(requestRef, {
    requestId,
    uid: currentUser.uid,
    certificateType,
    ...(requiresPurpose ? { purpose: requestPurpose } : {}),
    ...(certificateType === "Certificate of Indigency"
      ? { requestFor }
      : {}),
    ...(businessSubmission ?? {}),
    ...(requestFamilyInformation
      ? { familyInformation: requestFamilyInformation }
      : {}),
    residentInformation: {
      firstName: profile.personalInformation.firstName,
      middleName: profile.personalInformation.middleName ?? "",
      lastName: profile.personalInformation.lastName,
      address: `${profile.residenceInformation.houseNumber} ${profile.residenceInformation.street}, ${profile.residenceInformation.purok}, ${profile.residenceInformation.barangay}, ${profile.residenceInformation.municipality}, ${profile.residenceInformation.province}`,
      birthdate: profile.personalInformation.dateOfBirth,
      birthplace: profile.personalInformation.birthplace ?? "",
      contactNumber: profile.personalInformation.contactNumber,
    },
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  });

  return requestId;
};

export const submitBarangayClearanceRequest = async (
  purpose: string,
  profile: Profile,
): Promise<string> =>
  submitCertificateRequest(profile, "Barangay Clearance", purpose);
