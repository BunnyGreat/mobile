import type { AppointmentSlot } from "../types/appointment.types";

const APPOINTMENT_TIME_ZONE = "Asia/Manila";
const START_MINUTES = 8 * 60;
const END_MINUTES = 17 * 60;
const SLOT_INTERVAL_MINUTES = 30;

const SLOT_DEFINITIONS: Array<{
  value: string;
  label: string;
  minutesAfterMidnight: number;
}> = Array.from(
  {
    length: (END_MINUTES - START_MINUTES) / SLOT_INTERVAL_MINUTES + 1,
  },
  (_, index) => {
    const minutesAfterMidnight =
      START_MINUTES + index * SLOT_INTERVAL_MINUTES;
    const hour24 = Math.floor(minutesAfterMidnight / 60);
    const minute = minutesAfterMidnight % 60;
    const hour12 = hour24 % 12 || 12;
    const period = hour24 < 12 ? "AM" : "PM";

    return {
      value: `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      label: `${hour12}:${String(minute).padStart(2, "0")} ${period}`,
      minutesAfterMidnight,
    };
  },
);

const getLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getManilaDateKey = (date: Date): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the current date in Asia/Manila.");
  }

  return `${year}-${month}-${day}`;
};

const getManilaMinutesAfterMidnight = (date: Date): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APPOINTMENT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error("Unable to determine the current time in Asia/Manila.");
  }

  return hour * 60 + minute;
};

export const getAvailableSlots = async (
  selectedDate: string,
): Promise<AppointmentSlot[]> => {
  const selected = new Date(selectedDate);
  const now = new Date();
  const selectedDateKey = Number.isNaN(selected.getTime())
    ? null
    : getLocalDateKey(selected);
  const todayDateKey = getManilaDateKey(now);
  const isToday = selectedDateKey === todayDateKey;
  const isPastDate = !selectedDateKey || selectedDateKey < todayDateKey;
  const currentMinutes = getManilaMinutesAfterMidnight(now);

  return SLOT_DEFINITIONS.map(({ value, label, minutesAfterMidnight }) => {
    const available =
      !isPastDate && (!isToday || minutesAfterMidnight > currentMinutes);
    return {
      value,
      label,
      available,
    };
  });
};
