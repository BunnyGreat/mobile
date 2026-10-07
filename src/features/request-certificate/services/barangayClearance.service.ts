import { auth, db } from "../../../services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Profile } from "../../profile/types/profile.types";
import { generateReferenceNumber } from "../utils/generateReferenceNumber";

export type CertificateRequestType =
  | "Barangay Clearance"
  | "Barangay Certification"
  | "Certificate of Indigency";

export interface CertificateFamilyInformation {
  name: string;
  purpose: string;
  whereItWillBeUsed: string;
}

export const submitCertificateRequest = async (
  profile: Profile,
  certificateType: CertificateRequestType,
  purpose?: string,
  familyInformation?: CertificateFamilyInformation,
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

  const requiresPurpose = certificateType !== "Barangay Certification";
  const requestPurpose = requiresPurpose ? purpose?.trim() : undefined;

  if (requiresPurpose && !requestPurpose) {
    throw new Error("Purpose is required.");
  }

  const requestFamilyInformation = familyInformation
    ? {
        name: familyInformation.name.trim(),
        purpose: familyInformation.purpose.trim(),
        whereItWillBeUsed: familyInformation.whereItWillBeUsed.trim(),
      }
    : undefined;

  if (
    requestFamilyInformation &&
    (!requestFamilyInformation.name ||
      !requestFamilyInformation.purpose ||
      !requestFamilyInformation.whereItWillBeUsed)
  ) {
    throw new Error("Complete all family information fields.");
  }

  const requestId = generateReferenceNumber();
  const now = new Date().toISOString();

  const requestRef = doc(db, "certificate_requests", requestId);

  await setDoc(requestRef, {
    requestId,
    uid: currentUser.uid,
    certificateType,
    ...(requiresPurpose
      ? { purpose: requestPurpose }
      : {}),
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
