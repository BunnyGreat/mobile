import { auth, db } from "../../../services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createResidentNotification } from "../../notification/services/notification.service";
import type { Profile } from "../../profile/types/profile.types";
import { generateReferenceNumber } from "../utils/generateReferenceNumber";

export const submitBarangayClearanceRequest = async (
  purpose: string,
  profile: Profile,
): Promise<string> => {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error("Unable to submit request: user is not authenticated.");
  }

  if (!purpose.trim()) {
    throw new Error("Purpose is required.");
  }

  const requestId = generateReferenceNumber();
  const now = new Date().toISOString();

  const requestRef = doc(db, "certificate_requests", requestId);

  await setDoc(requestRef, {
    requestId,
    uid: currentUser.uid,
    certificateType: "Barangay Clearance",
    purpose: purpose.trim(),
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

  await createResidentNotification({
    uid: currentUser.uid,
    title: "Certificate Submitted",
    message: "Your certificate request has been submitted successfully.",
    type: "certificate",
    referenceId: requestId,
  });

  return requestId;
};
