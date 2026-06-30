import type { AppointmentSlot } from "../types/appointment.types";

const SLOT_DEFINITIONS: Array<{ value: string; label: string }> = [
  { value: "08:00", label: "8:00 AM" },
  { value: "08:30", label: "8:30 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "09:30", label: "9:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
];

export const getAvailableSlots = async (
  selectedDate: string,
): Promise<AppointmentSlot[]> => {
  const selected = new Date(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = selected.toDateString() === today.toDateString();
  const nowHour = new Date().getHours();

  return SLOT_DEFINITIONS.map(({ value, label }) => {
    const [slotHour] = value.split(":").map(Number);
    const available = !isToday || slotHour > nowHour;

    return {
      value,
      label,
      available,
    };
  });
};
