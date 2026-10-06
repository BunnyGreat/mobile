import { auth, db } from "../../../services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Profile } from "../../profile/types/profile.types";
import { generateReferenceNumber } from "../utils/generateReferenceNumber";

export type CertificateRequestType =
  | "Barangay Clearance"
  | "Barangay Certification";

export const submitCertificateRequest = async (
  profile: Profile,
  certificateType: CertificateRequestType,
  purpose?: string,
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

  const requestPurpose =
    certificateType === "Barangay Clearance" ? purpose?.trim() : undefined;

  if (certificateType === "Barangay Clearance" && !requestPurpose) {
    throw new Error("Purpose is required.");
  }

  const requestId = generateReferenceNumber();
  const now = new Date().toISOString();

  const requestRef = doc(db, "certificate_requests", requestId);

  await setDoc(requestRef, {
    requestId,
    uid: currentUser.uid,
    certificateType,
    ...(certificateType === "Barangay Clearance"
      ? { purpose: requestPurpose }
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
