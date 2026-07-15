import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import { generateReadableId } from "../../../services/idGenerator";
import { getProfile } from "../../profile/services/profile.service";
import { createResidentNotification } from "../../notification/services/notification.service";
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

  const appointmentId = await generateReadableId({
    prefix: "APT",
    collectionName: "appointments",
    fieldName: "appointmentId",
  });

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
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await addDoc(collection(db, "appointments"), {
    ...payload,
    appointmentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createResidentNotification({
    uid: currentUser.uid,
    title: "Appointment Submitted",
    message: "Your appointment request has been submitted successfully.",
    type: "appointment",
    referenceId: appointmentId,
  });

  return {
    appointmentId,
    ...payload,
  };
};
