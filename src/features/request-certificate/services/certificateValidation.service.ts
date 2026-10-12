import { CLEARANCE_PURPOSES } from "../constants/clearancePurposes";

export const validateBarangayClearance = (
  values: { purpose: string },
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!CLEARANCE_PURPOSES.some((purpose) => purpose === values.purpose)) {
    errors.purpose = "Select a valid purpose for your Barangay Clearance request.";
  }

  return errors;
};
