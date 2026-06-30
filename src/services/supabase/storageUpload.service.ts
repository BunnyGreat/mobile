import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "./supabase";

export interface SupabaseUploadResult {
  url: string;
  path: string;
}

interface UploadFileToSupabaseStorageArgs {
  uri: string;
  bucketName: string;
  filePath: string;
  contentType?: string;
  compressImage?: boolean;
  maxFileSizeBytes?: number;
}

export const uploadFileToSupabaseStorage = async ({
  uri,
  bucketName,
  filePath,
  contentType = "application/octet-stream",
  compressImage = false,
  maxFileSizeBytes,
}: UploadFileToSupabaseStorageArgs): Promise<SupabaseUploadResult> => {
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

  const { error } = await supabase.storage.from(bucketName).upload(filePath, fileBuffer as any, {
    cacheControl: "3600",
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Failed to retrieve public URL from Supabase storage.");
  }

  return {
    url: data.publicUrl,
    path: filePath,
  };
};
