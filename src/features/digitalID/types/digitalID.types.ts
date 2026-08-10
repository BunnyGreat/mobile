import type { Profile } from "../../profile/types/profile.types";

export interface DigitalIDState {
  isFlipped: boolean;
  toggleFlip: () => void;
  resetFlip: () => void;
}

export interface DigitalIDData {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface DigitalIDDisplayData {
  // Front side data
  fullName: string;
  referenceId: string;
  municipality: string;
  barangay: string;
  province: string;
  profilePhotoUrl: string | null;
  residencyInfo: string;

  // Back side data
  houseNumber: string;
  street: string;
  purok: string;
  birthDate: string;
  birthPlace: string;
  contactNumber: string;
  email: string;
  civilStatus: string;
  gender: string;
  residentStatus: string;
}

export type DigitalIDLoadingState = "idle" | "loading" | "success" | "error";
