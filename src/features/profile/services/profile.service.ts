import { auth, db } from "../../../services/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deletePreviousPhoto, uploadPhoto } from "./profilePhoto.service";
import { saveProfileCache } from "./profileCache.service";
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

const safeTrim = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value == null) {
    return "";
  }

  return String(value).trim();
};

const formatFullName = (personalInformation: ProfilePersonalInformation): string => {
  const middleName = safeTrim(personalInformation.middleName);
  const middleInitial = middleName
    ? `${middleName.charAt(0).toUpperCase()}.`
    : null;

  return [
    safeTrim(personalInformation.firstName),
    middleInitial,
    safeTrim(personalInformation.lastName),
    safeTrim(personalInformation.suffix),
  ]
    .filter(Boolean)
    .join(" ");
};

const buildProfileFromRow = (row: Record<string, any>, uid: string, email: string | null): Profile => {
  const personal = (row.personalInformation ?? {}) as Record<string, unknown>;
  const residence = (row.residenceInformation ?? {}) as Record<string, unknown>;
  const documents = (row.documents ?? {}) as Record<string, unknown>;

  const allowedGenders = ["male", "female", "other"] as const;
  const allowedCivilStatuses = ["single", "married", "widowed", "separated", "divorced"] as const;

  const gender = safeTrim(personal.gender) as ProfilePersonalInformation["gender"];
  const civilStatus = safeTrim(personal.civilStatus) as ProfilePersonalInformation["civilStatus"];

  const personalInformation: ProfilePersonalInformation = {
    firstName: safeTrim(personal.firstName),
    middleName: safeTrim(personal.middleName) || null,
    lastName: safeTrim(personal.lastName),
    suffix: safeTrim(personal.suffix) || null,
    dateOfBirth: safeTrim(personal.dateOfBirth),
    gender: allowedGenders.includes(gender as any) ? gender : "other",
    civilStatus: allowedCivilStatuses.includes(civilStatus as any) ? civilStatus : "single",
    contactNumber: safeTrim(personal.contactNumber) || "Not Available",
    profilePhotoUri: safeTrim(personal.profilePhotoUri) || null,
    profilePhotoUrl:
      safeTrim(personal.profilePhotoUrl) || safeTrim(row.profilePhotoUrl) || null,
    profilePhotoPath:
      safeTrim(personal.profilePhotoPath) || safeTrim(row.profilePhotoPath) || null,
  };

  const residenceInformation: ProfileResidenceInformation = {
    houseNumber: safeTrim(residence.houseNumber),
    street: safeTrim(residence.street),
    purok: safeTrim(residence.purok),
    barangay: safeTrim(residence.barangay),
    municipality: safeTrim(residence.municipality),
    province: safeTrim(residence.province),
  };

  const documentsSection: ProfileDocuments = {
    frontIdUrl: safeTrim(documents.frontIdUrl) || null,
    backIdUrl: safeTrim(documents.backIdUrl) || null,
  };

  return {
    uid,
    fullName: formatFullName(personalInformation) || "Resident",
    email: email ?? (safeTrim(row.email) || "Not Available"),
    phoneNumber: personalInformation.contactNumber || "Not Available",
    referenceId: safeTrim(row.referenceId) || "Not Available",
    residentStatus: mapResidentStatus(safeTrim(row.status)),
    profilePhotoUrl: personalInformation.profilePhotoUrl ?? null,
    profilePhotoPath: personalInformation.profilePhotoPath ?? null,
    updatedAt: safeTrim(row.updatedAt) || null,
    personalInformation,
    residenceInformation,
    documents: documentsSection,
  };
};

export interface UpdateProfilePayload {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  contactNumber: string;
  gender: ProfilePersonalInformation["gender"];
  civilStatus: ProfilePersonalInformation["civilStatus"];
  houseNumber: string;
  street: string;
  subdivision: string;
  barangay: string;
  municipality: string;
  province: string;
  profilePhotoUrl?: string | null;
  profilePhotoPath?: string | null;
}

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
  const profile = buildProfileFromRow(data, currentUser.uid, currentUser.email);
  await saveProfileCache(profile);

  return profile;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<Profile> => {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error("[PROFILE] Authentication required.");
  }

  const updateData: Record<string, unknown> = {
    "personalInformation.firstName": safeTrim(payload.firstName),
    "personalInformation.middleName": payload.middleName ? safeTrim(payload.middleName) : null,
    "personalInformation.lastName": safeTrim(payload.lastName),
    "personalInformation.contactNumber": safeTrim(payload.contactNumber),
    "personalInformation.gender": payload.gender,
    "personalInformation.civilStatus": payload.civilStatus,
    "residenceInformation.houseNumber": safeTrim(payload.houseNumber),
    "residenceInformation.street": safeTrim(payload.street),
    "residenceInformation.purok": safeTrim(payload.subdivision),
    "residenceInformation.barangay": safeTrim(payload.barangay),
    "residenceInformation.municipality": safeTrim(payload.municipality),
    "residenceInformation.province": safeTrim(payload.province),
    updatedAt: new Date().toISOString(),
  };

  if (payload.profilePhotoUrl !== undefined) {
    updateData["personalInformation.profilePhotoUrl"] = payload.profilePhotoUrl;
  }

  if (payload.profilePhotoPath !== undefined) {
    updateData["personalInformation.profilePhotoPath"] = payload.profilePhotoPath;
  }

  const userRef = doc(db, "users", currentUser.uid);
  await updateDoc(userRef, updateData);

  const updatedDoc = await getDoc(userRef);
  if (!updatedDoc.exists()) {
    throw new Error("[PROFILE] Resident profile update failed.");
  }

  const updatedData = updatedDoc.data() as Record<string, any>;
  const profile = buildProfileFromRow(updatedData, currentUser.uid, currentUser.email);
  await saveProfileCache(profile);

  return profile;
};

export const updateProfilePhoto = async (
  compressedUri: string,
  existingPhotoPath?: string | null,
): Promise<{ profilePhotoUrl: string; profilePhotoPath: string }> => {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw new Error("[PROFILE] Authentication required.");
  }

  if (existingPhotoPath) {
    await deletePreviousPhoto(existingPhotoPath);
  }

  return uploadPhoto(compressedUri, currentUser.uid);
};

export const refreshProfile = async (): Promise<Profile> => {
  return getProfile();
};
