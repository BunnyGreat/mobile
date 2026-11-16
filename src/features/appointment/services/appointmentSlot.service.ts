import type { AppointmentSlot } from "../types/appointment.types";

const APPOINTMENT_TIME_ZONE = "Asia/Manila";
const DEFAULT_START_MINUTES = 8 * 60;
const MONDAY_START_MINUTES = 12 * 60;
const END_MINUTES = 17 * 60;
const SLOT_INTERVAL_MINUTES = 30;

const getSlotDefinitions = (startMinutes: number) =>
  Array.from(
    {
      length: (END_MINUTES - startMinutes) / SLOT_INTERVAL_MINUTES + 1,
    },
    (_, index) => {
      const minutesAfterMidnight =
        startMinutes + index * SLOT_INTERVAL_MINUTES;
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

const getSelectedDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getWeekdayInManila = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dateAtManilaNoon = new Date(Date.UTC(year, month - 1, day, 4));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: APPOINTMENT_TIME_ZONE,
    weekday: "long",
  }).format(dateAtManilaNoon);
};

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
    : getSelectedDateKey(selected);
  const todayDateKey = getManilaDateKey(now);
  const isToday = selectedDateKey === todayDateKey;
  const isPastDate = !selectedDateKey || selectedDateKey < todayDateKey;
  const currentMinutes = getManilaMinutesAfterMidnight(now);
  const selectedWeekday = selectedDateKey
    ? getWeekdayInManila(selectedDateKey)
    : null;
  const startMinutes =
    selectedWeekday === "Monday"
      ? MONDAY_START_MINUTES
      : DEFAULT_START_MINUTES;
  const slotDefinitions = getSlotDefinitions(startMinutes);

  return slotDefinitions.map(({ value, label, minutesAfterMidnight }) => {
    const available =
      !isPastDate && (!isToday || minutesAfterMidnight > currentMinutes);
    return {
      value,
      label,
      available,
    };
  });
};
