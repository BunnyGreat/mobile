export const APPOINTMENT_PURPOSES = [
  { label: "Dispute Mediation", icon: "message-square" },
  { label: "Lupon Hearing", icon: "users" },
  { label: "Financial Assistance", icon: "dollar-sign" },
  { label: "Medical Assistance", icon: "heart" },
  { label: "Burial Assistance", icon: "life-buoy" },
  { label: "Community Infrastructure Request", icon: "home" },
  { label: "Event Permit", icon: "calendar" },
  { label: "Road Closure Request", icon: "slash" },
  { label: "Community Outreach Proposal", icon: "globe" },
  { label: "NGO Partnership", icon: "users" },
  { label: "Security Concern", icon: "shield" },
  { label: "Tanod Patrol Request", icon: "shield" },
  { label: "Business Consultation", icon: "briefcase" },
  { label: "Construction Consultation", icon: "tool" },
  { label: "Courtesy Call", icon: "phone" },
  { label: "Official Meeting", icon: "users" },
] as const;

export type AppointmentPurpose =
  (typeof APPOINTMENT_PURPOSES)[number]["label"];

export const isAppointmentPurpose = (
  value: unknown,
): value is AppointmentPurpose =>
  typeof value === "string" &&
  APPOINTMENT_PURPOSES.some((purpose) => purpose.label === value);
