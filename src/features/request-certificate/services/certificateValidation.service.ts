export const validateBarangayClearance = (
  values: { purpose: string },
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.purpose?.trim()) {
    errors.purpose = "Please enter the purpose of your Barangay Clearance request.";
  }

  return errors;
};
