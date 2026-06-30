import { format } from "date-fns";

export const formatAppointmentDate = (value: string): string => {
  if (!value) {
    return "Not selected";
  }

  return format(new Date(value), "MMMM d, yyyy");
};
