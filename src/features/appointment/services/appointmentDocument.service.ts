import { supabase } from "../../../services/supabase/supabase";

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
  const documentPath = `appointments/${uid}/${Date.now()}.${extension}`;
  const fileBuffer = await fetchFileBuffer(uri);

  if (fileBuffer.byteLength > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("File size must be 5 MB or less.");
  }

  const contentType =
    fileName.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : fileName.toLowerCase().endsWith(".doc")
        ? "application/msword"
        : fileName.toLowerCase().endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : null;

  if (!contentType || !allowedContentTypes.includes(contentType)) {
    throw new Error("Only PDF, DOC, and DOCX files are allowed.");
  }

  const { data: uploadData, error } = await supabase.storage
    .from("appointment_docs")
    .upload(documentPath, fileBuffer as any, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Unable to upload supporting document. Please try again.`);
  }

  const { data } = supabase.storage.from("appointment_docs").getPublicUrl(documentPath);

  if (!data?.publicUrl) {
    throw new Error("Unable to upload supporting document. Please try again.");
  }

  return {
    documentUrl: data.publicUrl,
    documentPath,
  };
};
