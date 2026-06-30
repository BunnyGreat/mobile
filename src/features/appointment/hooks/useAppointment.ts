import { useMemo } from "react";
import { useAppointmentStore } from "../store/appointment.store";

export const useAppointment = () => {
  const loading = useAppointmentStore((state) => state.loading);
  const error = useAppointmentStore((state) => state.error);
  const success = useAppointmentStore((state) => state.success);
  const form = useAppointmentStore((state) => state.form);
  const submitAppointment = useAppointmentStore((state) => state.submitAppointment);
  const clearState = useAppointmentStore((state) => state.clearState);
  const resetForm = useAppointmentStore((state) => state.resetForm);

  return useMemo(
    () => ({
      loading,
      error,
      success,
      form,
      submitAppointment,
      clearState,
      resetForm,
    }),
    [loading, error, success, form, submitAppointment, clearState, resetForm],
  );
};

export default useAppointment;
