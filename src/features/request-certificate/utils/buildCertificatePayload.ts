import type { BarangayClearanceFormValues } from "../types/barangayClearance.types";

export const buildCertificatePayload = (
  certificateTypeId: string,
  values: BarangayClearanceFormValues,
): Record<string, unknown> => {
  if (certificateTypeId === "barangay-clearance") {
    return {
      type: "Barangay Clearance",
      residentName: `${values.firstName} ${values.middleName} ${values.lastName}`.trim(),
      address: values.address,
      birthdate: values.birthdate,
      birthplace: values.birthplace,
      contactNumber: values.contactNumber,
      purpose: values.purpose,
      additionalInformation: values.dynamicFieldValue ?? values.loanType ?? "",
    };
  }

  return {
    type: certificateTypeId,
  };
};
