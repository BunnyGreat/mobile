import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "./supabase";

export interface SupabaseUploadResult {
  url: string;
  path: string;
}

interface UploadArgs {
  uid: string;
  bucketName: string;
  fileName: string; // e.g. front_id.jpg, profile.jpg
  uri: string;
  contentType?: string;
  compressImage?: boolean;
  maxFileSizeBytes?: number;
  upsert?: boolean;
}

export const uploadFileToSupabase = async ({
  uid,
  bucketName,
  fileName,
  uri,
  contentType = "application/octet-stream",
  compressImage = false,
  maxFileSizeBytes,
  upsert = true,
}: UploadArgs): Promise<{ path: string }> => {
  let uploadUri = uri;

  if (compressImage) {
    const compressedResult = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    uploadUri = compressedResult.uri;
  }

  const response = await fetch(uploadUri);
  if (!response.ok) {
    throw new Error(`Unable to read file for upload (status ${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  if (maxFileSizeBytes && fileBuffer.byteLength > maxFileSizeBytes) {
    throw new Error("File size exceeds the maximum allowed limit.");
  }

  const filePath = `${uid}/${fileName}`;

  const { error } = await supabase.storage.from(bucketName).upload(filePath, fileBuffer as any, {
    cacheControl: "3600",
    contentType,
    upsert,
  });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  // Do not return public URL here. Caller should request a signed/public URL when needed.
  return { path: filePath };
};

export const getFileSignedOrPublicUrl = async (
  bucketName: string,
  path: string,
  expiresInSeconds = 60 * 60,
): Promise<string> => {
  // Try to create a signed URL first (works for private buckets)
  try {
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresInSeconds);

    if (!signedError && signedData?.signedUrl) {
      return signedData.signedUrl;
    }
  } catch (err) {
    // fall through to public URL attempt
  }

  // Fallback to public URL (works if bucket is public)
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  if (data?.publicUrl) return data.publicUrl;

  throw new Error("Failed to generate access URL for storage path.");
};

// Backwards-compatible wrapper for older callers that passed full filePath
export const uploadFileToSupabaseStorage = async ({
  uri,
  bucketName,
  filePath,
  contentType = "application/octet-stream",
  compressImage = false,
  maxFileSizeBytes,
}: {
  uri: string;
  bucketName: string;
  filePath: string;
  contentType?: string;
  compressImage?: boolean;
  maxFileSizeBytes?: number;
}): Promise<SupabaseUploadResult> => {
  // Reuse upload logic but preserve original behavior: do not overwrite and return public URL
  let uploadUri = uri;
  if (compressImage) {
    const compressedResult = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    uploadUri = compressedResult.uri;
  }

  const response = await fetch(uploadUri);
  if (!response.ok) throw new Error(`Unable to read file for upload (status ${response.status}).`);
  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  if (maxFileSizeBytes && fileBuffer.byteLength > maxFileSizeBytes) {
    throw new Error("File size exceeds the maximum allowed limit.");
  }

  const { error } = await supabase.storage.from(bucketName).upload(filePath, fileBuffer as any, {
    cacheControl: "3600",
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Supabase storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("Failed to retrieve public URL from Supabase storage.");

  return { url: data.publicUrl, path: filePath };
};
