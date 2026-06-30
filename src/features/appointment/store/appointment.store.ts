import { create } from "zustand";
import { createAppointment } from "../services/appointment.service";
import type { AppointmentFormValues, AppointmentStore } from "../types/appointment.types";

const initialForm: AppointmentFormValues = {
  purpose: "",
  concern: "",
  appointmentDate: "",
  appointmentTime: "",
  supportingDocumentName: null,
  supportingDocumentUrl: null,
  supportingDocumentPath: null,
  supportingDocumentUri: null,
};

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  form: initialForm,
  loading: false,
  error: null,
  success: false,
  setPurpose: (purpose) => set((state) => ({ form: { ...state.form, purpose } })),
  setConcern: (concern) => set((state) => ({ form: { ...state.form, concern } })),
  setAppointmentDate: (appointmentDate) =>
    set((state) => ({ form: { ...state.form, appointmentDate, appointmentTime: "" } })),
  setAppointmentTime: (appointmentTime) =>
    set((state) => ({ form: { ...state.form, appointmentTime } })),
  setSupportingDocument: (supportingDocumentName, supportingDocumentUri) =>
    set((state) => ({
      form: {
        ...state.form,
        supportingDocumentName,
        supportingDocumentUri,
        supportingDocumentUrl: null,
        supportingDocumentPath: null,
      },
    })),
  submitAppointment: async () => {
    set({ loading: true, error: null, success: false });

    try {
      await createAppointment({ ...useAppointmentStore.getState().form });
      set({ loading: false, success: true, error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to book appointment.";
      set({ loading: false, success: false, error: message });
    }
  },
  clearState: () => set({ loading: false, error: null, success: false }),
  resetForm: () => set({ form: initialForm, loading: false, error: null, success: false }),
}));
