import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import { getProfile } from "../../profile/services/profile.service";
import type { AppointmentFormValues, AppointmentRecord } from "../types/appointment.types";
import { validateAppointment } from "../utils/appointmentValidation";
import { uploadAppointmentDocument } from "./appointmentDocument.service";

export const createAppointment = async (
  values: AppointmentFormValues,
): Promise<AppointmentRecord> => {
  const validationError = validateAppointment({
    purpose: values.purpose,
    appointmentDate: values.appointmentDate,
    appointmentTime: values.appointmentTime,
    supportingDocumentName: values.supportingDocumentName,
    supportingDocumentUri: values.supportingDocumentUri,
  });

  if (validationError) {
    throw new Error(validationError);
  }

  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error("Authentication required.");
  }

  const profile = await getProfile();

  let supportingDocumentUrl = "";
  let supportingDocumentPath = "";

  if (values.supportingDocumentUri && values.supportingDocumentName) {
    const uploadResult = await uploadAppointmentDocument(
      values.supportingDocumentUri,
      currentUser.uid,
      values.supportingDocumentName,
    );
    supportingDocumentUrl = uploadResult.documentUrl;
    supportingDocumentPath = uploadResult.documentPath;
  }

  if (!supportingDocumentUrl || !supportingDocumentPath) {
    throw new Error("Unable to upload supporting document. Please try again.");
  }

  const payload: Omit<AppointmentRecord, "appointmentId"> = {
    uid: currentUser.uid,
    fullName: profile.fullName,
    profilePhotoUrl: profile.profilePhotoUrl ?? null,
    email: profile.email,
    contactNumber: profile.phoneNumber,
    purpose: values.purpose,
    description: values.concern.trim(),
    appointmentDate: values.appointmentDate,
    appointmentSlot: values.appointmentTime,
    supportingDocumentName: values.supportingDocumentName ?? "",
    supportingDocumentUrl,
    supportingDocumentPath,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, "appointments"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    appointmentId: docRef.id,
    ...payload,
  };
};
