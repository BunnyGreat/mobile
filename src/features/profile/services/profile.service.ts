import { auth, db } from "../../../services/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import type {
  Profile,
  ProfilePersonalInformation,
  ProfileResidenceInformation,
  ProfileDocuments,
} from "../types/profile.types";

const mapResidentStatus = (status?: string): string => {
  switch (status) {
    case "approved":
      return "Verified Resident";
    case "pending":
      return "Under Review";
    case "rejected":
      return "Registration Rejected";
    default:
      return "Pending Verification";
  }
};

const formatFullName = (personalInformation: ProfilePersonalInformation): string => {
  const middleInitial = personalInformation.middleName
    ? `${personalInformation.middleName.trim().charAt(0).toUpperCase()}.`
    : null;

  return [
    personalInformation.firstName,
    middleInitial,
    personalInformation.lastName,
    personalInformation.suffix,
  ]
    .filter(Boolean)
    .join(" ");
};

export const getProfile = async (): Promise<Profile> => {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error("[PROFILE] No authenticated user found.");
  }

  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("[PROFILE] User document not found.");
  }

  const data = userSnap.data() as Record<string, any>;
  const personalInformation: ProfilePersonalInformation = {
    firstName: data.personalInformation?.firstName ?? "",
    middleName: data.personalInformation?.middleName ?? null,
    lastName: data.personalInformation?.lastName ?? "",
    suffix: data.personalInformation?.suffix ?? null,
    dateOfBirth: data.personalInformation?.dateOfBirth ?? "",
    gender: data.personalInformation?.gender ?? "other",
    civilStatus: data.personalInformation?.civilStatus ?? "single",
    contactNumber: data.personalInformation?.contactNumber ?? "Not Available",
    profilePhotoUrl: data.personalInformation?.profilePhotoUrl ?? null,
  };

  const residenceInformation: ProfileResidenceInformation = {
    houseNumber: data.residenceInformation?.houseNumber ?? "",
    street: data.residenceInformation?.street ?? "",
    purok: data.residenceInformation?.purok ?? "",
    barangay: data.residenceInformation?.barangay ?? "",
    municipality: data.residenceInformation?.municipality ?? "",
    province: data.residenceInformation?.province ?? "",
  };

  const documents: ProfileDocuments = {
    frontIdUrl: data.documents?.frontIdUrl ?? null,
    backIdUrl: data.documents?.backIdUrl ?? null,
  };

  return {
    uid: currentUser.uid,
    fullName: formatFullName(personalInformation) || "Resident",
    email: currentUser.email ?? data.email ?? "Not Available",
    phoneNumber: personalInformation.contactNumber ?? "Not Available",
    referenceId: data.referenceId ?? "Not Available",
    residentStatus: mapResidentStatus(data.status),
    profilePhotoUrl: personalInformation.profilePhotoUrl ?? null,
    personalInformation,
    residenceInformation,
    documents,
  };
};
