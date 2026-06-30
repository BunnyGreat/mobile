import type { AppointmentFormValues } from "../types/appointment.types";

export const allowedDocumentExtensions = ["pdf", "doc", "docx"];

export const isSupportedDocumentFile = (
  fileName: string | null | undefined,
): boolean => {
  if (!fileName) {
    return false;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  return Boolean(extension && allowedDocumentExtensions.includes(extension));
};

export const getAppointmentValidationErrors = (
  values: Pick<
    AppointmentFormValues,
    | "purpose"
    | "appointmentDate"
    | "appointmentTime"
    | "supportingDocumentName"
    | "supportingDocumentUri"
  >,
) => ({
  purpose: !values.purpose?.trim()
    ? "Please select the purpose of your appointment."
    : null,
  appointmentDate: !values.appointmentDate
    ? "Please select an appointment date."
    : null,
  appointmentTime: !values.appointmentTime
    ? "Please select an available time slot."
    : null,
  supportingDocument: !isSupportedDocumentFile(values.supportingDocumentName) || !values.supportingDocumentUri
    ? "Please upload a supporting document."
    : null,
});

export const validateAppointment = (
  values: Pick<
    AppointmentFormValues,
    | "purpose"
    | "appointmentDate"
    | "appointmentTime"
    | "supportingDocumentName"
    | "supportingDocumentUri"
  >,
): string | null => {
  const errors = getAppointmentValidationErrors(values);
  return (
    errors.purpose ??
    errors.appointmentDate ??
    errors.appointmentTime ??
    errors.supportingDocument ??
    null
  );
};
