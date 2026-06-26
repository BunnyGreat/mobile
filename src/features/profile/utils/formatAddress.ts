import type { ProfileResidenceInformation } from "../types/profile.types";

export interface AddressFields extends Partial<ProfileResidenceInformation> {
  houseNumber?: string;
  street?: string;
  purok?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
}

export const formatAddress = (address: AddressFields): string => {
  const parts = [
    address.houseNumber,
    address.street,
    address.purok,
    address.barangay,
    address.municipality,
    address.province,
  ].filter(Boolean);

  return parts.join(", ");
};
