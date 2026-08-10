import type { ProfilePersonalInformation } from "../types/profile.types";

const safeTrim = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value == null) {
    return "";
  }

  return String(value).trim();
};

export const formatFullName = (
  personalInformation: ProfilePersonalInformation,
): string => {
  const middleName = safeTrim(personalInformation.middleName);

  return [
    safeTrim(personalInformation.firstName),
    middleName,
    safeTrim(personalInformation.lastName),
    safeTrim(personalInformation.suffix),
  ]
    .filter(Boolean)
    .join(" ");
};
