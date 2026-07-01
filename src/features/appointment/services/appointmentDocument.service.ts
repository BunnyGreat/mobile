import { uploadFileToSupabase, getFileSignedOrPublicUrl } from "../../../services/supabase/storageUpload.service";

const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;
const allowedContentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const getFileExtension = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ?? "bin";
};

const fetchFileBuffer = async (uri: string): Promise<Uint8Array> => {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Unable to read document file for upload (status ${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export const uploadAppointmentDocument = async (
  uri: string,
  uid: string,
  fileName: string,
): Promise<{ documentUrl: string; documentPath: string }> => {
  const extension = getFileExtension(fileName);
  const normalizedFileName = fileName.toLowerCase().endsWith(`.${extension}`)
    ? fileName
    : `${fileName}.${extension}`;

  const uploadResult = await uploadFileToSupabase({
    uid,
    bucketName: "appointment_docs",
    fileName: normalizedFileName,
    uri,
    contentType: fileName.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : fileName.toLowerCase().endsWith(".doc")
        ? "application/msword"
        : fileName.toLowerCase().endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/octet-stream",
    compressImage: false,
    maxFileSizeBytes: MAX_DOCUMENT_SIZE_BYTES,
    upsert: false,
  });

  const url = await getFileSignedOrPublicUrl("appointment_docs", uploadResult.path);

  return {
    documentUrl: url,
    documentPath: uploadResult.path,
  };
};
