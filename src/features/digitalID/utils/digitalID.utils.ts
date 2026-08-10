import type { Profile } from "../../profile/types/profile.types";
import type { DigitalIDDisplayData } from "../types/digitalID.types";
import { format } from "date-fns";

export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not Available";

  try {
    // Parse the date string directly
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString || "Not Available";
    }

    return format(date, "MMM dd, yyyy");
  } catch (error) {
    return dateString || "Not Available";
  }
};

export const capitalizeWords = (str: string | null | undefined): string => {
  if (!str) return "";
  return str
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const extractDigitalIDData = (profile: Profile | null): DigitalIDDisplayData | null => {
  if (!profile) return null;

  const { personalInformation, residenceInformation } = profile;

  return {
    // Front side
    fullName: profile.fullName || "Resident",
    referenceId: profile.referenceId || "ID-XXXX-XXXX",
    municipality: capitalizeWords(residenceInformation?.municipality) || "Rodriguez",
    barangay: capitalizeWords(residenceInformation?.barangay) || "San Isidro",
    province: capitalizeWords(residenceInformation?.province) || "Rizal",
    profilePhotoUrl: profile.profilePhotoUrl || null,
    residencyInfo: `${capitalizeWords(residenceInformation?.houseNumber)} ${capitalizeWords(
      residenceInformation?.street,
    )}`,

    // Back side
    houseNumber: capitalizeWords(residenceInformation?.houseNumber) || "Not Available",
    street: capitalizeWords(residenceInformation?.street) || "Not Available",
    purok: capitalizeWords(residenceInformation?.purok) || "Not Available",
    birthDate: formatDateForDisplay(personalInformation?.dateOfBirth),
    birthPlace: capitalizeWords(personalInformation?.birthplace) || "Not Available",
    contactNumber: personalInformation?.contactNumber || "Not Available",
    email: profile.email || "Not Available",
    civilStatus: capitalizeWords(personalInformation?.civilStatus) || "Not Available",
    gender: capitalizeWords(personalInformation?.gender) || "Not Available",
    residentStatus: profile.residentStatus || "Pending Verification",
  };
};

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "Not Available";

  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)} (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  return phone;
};
