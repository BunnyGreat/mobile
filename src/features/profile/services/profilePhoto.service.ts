import { getFileSignedOrPublicUrl } from "../../../services/supabase/storageUpload.service";

export const getPublicUrl = async (path: string): Promise<string> => {
  return getFileSignedOrPublicUrl("profile_photo", path);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const resolveOwnProfilePhotoPath = async (
  uid: string,
  path: string,
): Promise<string> => {
  const pathSegments = path.split("/");
  if (
    pathSegments[0] !== uid ||
    pathSegments.length < 2 ||
    pathSegments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Profile photo path does not belong to the authenticated user.");
  }

  return getFileSignedOrPublicUrl("profile_photo", path);
};

export const resolveProfilePhotoUrl = async (
  uid: string,
  profileData: Record<string, unknown>,
  authPhotoUrl?: string | null,
): Promise<string | null> => {
  if (!uid) {
    throw new Error("Authentication required to resolve a profile photo.");
  }

  const personalInformation = isRecord(profileData.personalInformation)
    ? profileData.personalInformation
    : {};
  const profilePhotoPath =
    getString(personalInformation.profilePhotoPath) ??
    getString(profileData.profilePhotoPath);

  if (profilePhotoPath) {
    return resolveOwnProfilePhotoPath(uid, profilePhotoPath);
  }

  const storedUrl =
    getString(personalInformation.profilePhotoUrl) ??
    getString(profileData.profilePhotoUrl) ??
    getString(profileData.photoURL) ??
    getString(authPhotoUrl);

  if (!storedUrl) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(storedUrl);
  } catch {
    return null;
  }

  const storagePathMatch = url.pathname.match(
    /\/storage\/v1\/object\/(?:sign|public)\/profile_photo\/(.+)$/,
  );
  if (storagePathMatch) {
    let storagePath: string;
    try {
      storagePath = decodeURIComponent(storagePathMatch[1]);
    } catch {
      throw new Error("Profile photo URL contains an invalid storage path.");
    }
    return resolveOwnProfilePhotoPath(uid, storagePath);
  }

  return url.protocol === "http:" || url.protocol === "https:"
    ? url.toString()
    : null;
};
