import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../services/supabase/supabase";

export const requestLibraryPermission = async (): Promise<boolean> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.status === "granted";
};

export const pickImage = async (): Promise<string | null> => {
  const hasPermission = await requestLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
};

export const compressPhoto = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
};

const getUploadPath = (uid: string): string => `${uid}/${Date.now()}.jpg`;

const fetchBlobFromUri = async (
  uri: string,
): Promise<Uint8Array | ArrayBuffer> => {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Unable to read image file for upload (status ${response.status}).`);
    }

    // Prefer arrayBuffer in React Native environments where Blob may be unreliable
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fetch file at ${uri}: ${message}`);
  }
};

export const uploadPhoto = async (
  uri: string,
  uid: string,
): Promise<{ profilePhotoUrl: string; profilePhotoPath: string }> => {
  const filePath = getUploadPath(uid);
  const fileBuffer = await fetchBlobFromUri(uri);

  const { data: uploadData, error } = await supabase.storage
    .from("profile_photo")
    .upload(filePath, fileBuffer as any, {
      cacheControl: "3600",
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    // Log full error details for debugging
    console.error("[SUPABASE UPLOAD ERROR]", {
      message: error.message,
      status: (error as any)?.status,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
    });
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("profile_photo").getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase storage.");
  }

  return {
    profilePhotoUrl: data.publicUrl,
    profilePhotoPath: filePath,
  };
};

export const deletePreviousPhoto = async (path?: string): Promise<void> => {
  if (!path) {
    return;
  }

  const { error } = await supabase.storage.from("profile_photo").remove([path]);
  if (error) {
    const message = error.message ?? "Unknown storage error.";
    const notFound = /not found|No such object/i.test(message);
    if (!notFound) {
      throw new Error(`Failed to delete previous photo: ${message}`);
    }
  }
};

export const getPublicUrl = async (path: string): Promise<string> => {
  const { data } = supabase.storage.from("profile_photo").getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase storage.");
  }

  return data.publicUrl;
};
