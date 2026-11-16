import type { AppointmentPurpose } from "../constants/appointmentPurposes";

export interface AppointmentFormValues {
  purpose: AppointmentPurpose | "";
  concern: string;
  appointmentDate: string;
  appointmentTime: string;
  supportingDocumentName: string | null;
  supportingDocumentUrl: string | null;
  supportingDocumentPath: string | null;
  supportingDocumentUri: string | null;
}

export interface AppointmentRecord {
  appointmentId: string;
  uid: string;
  fullName: string;
  profilePhotoUrl: string | null;
  email: string;
  contactNumber: string;
  purpose: string;
  description: string;
  appointmentDate: string;
  appointmentSlot: string;
  supportingDocumentName: string | null;
  supportingDocumentUrl: string;
  supportingDocumentPath: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlot {
  value: string;
  label: string;
  available: boolean;
}

export interface AppointmentStore {
  form: AppointmentFormValues;
  loading: boolean;
  error: string | null;
  success: boolean;
  setPurpose: (purpose: AppointmentPurpose | "") => void;
  setConcern: (concern: string) => void;
  setAppointmentDate: (date: string) => void;
  setAppointmentTime: (time: string) => void;
  setSupportingDocument: (name: string | null, uri: string | null) => void;
  submitAppointment: () => Promise<void>;
  clearState: () => void;
  resetForm: () => void;
}
