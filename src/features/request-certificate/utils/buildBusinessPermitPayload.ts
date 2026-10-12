import type {
  BusinessPermitFormValues,
  BusinessPermitSubmission,
} from "../types/businessPermit.types";

export const buildBusinessPermitPayload = (
  values: BusinessPermitFormValues,
): BusinessPermitSubmission => {
  if (
    values.applicationType !== "New" &&
    values.applicationType !== "Renewal"
  ) {
    throw new Error("Select New Application or Renewal.");
  }

  return {
    requestFor: values.applicationType === "New" ? "new" : "renew",
    businessInformation: {
      businessName: values.businessName.trim(),
      natureOfBusiness: values.natureOfBusiness,
      initialCapital: Number(values.initialCapital),
      businessAddress: values.businessAddress.trim(),
      applicationType: values.applicationType,
      businessOwnerFullName: values.businessOwnerFullName.trim(),
      homeAddress: values.homeAddress.trim(),
      contactNumber: values.contactNumber.trim(),
    },
  };
};
