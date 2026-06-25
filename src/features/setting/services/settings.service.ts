import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import { signOut } from "firebase/auth";
import type { SettingsProfile } from "../types/settings.types";

const buildFullName = (firstName?: string, middleName?: string, lastName?: string) => {
  return [
    firstName?.trim(),
    middleName ? `${middleName.trim().charAt(0)}.` : null,
    lastName?.trim(),
  ]
    .filter(Boolean)
    .join(" ");
};

const mapStatusLabel = (status?: string) => {
  switch (status) {
    case "approved":
      return "Verified Resident";
    case "pending":
      return "Pending Review";
    case "rejected":
      return "Registration Rejected";
    default:
      return "Resident";
  }
};

export const getSettingsProfile = async (): Promise<SettingsProfile> => {
  const user = auth.currentUser;
  if (!user?.uid) {
    throw new Error("Unable to load profile: user is not authenticated.");
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Profile record not found.");
  }

  const data = userSnap.data() as Record<string, any>;
  const personalInformation = data.personalInformation ?? {};

  return {
    profilePhotoUrl: personalInformation.profilePhotoUrl,
    fullName:
      buildFullName(
        personalInformation.firstName,
        personalInformation.middleName,
        personalInformation.lastName,
      ) || "Resident",
    referenceId: data.referenceId ?? "",
    status: mapStatusLabel(data.status),
  };
};

export const logoutUser = async (): Promise<
  | { success: true }
  | { success: false; error: string }
> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to logout.";
    console.error("[SETTINGS LOGOUT]", error);
    return { success: false, error: message };
  }
};
