import {
  BUSINESS_APPLICATION_TYPES,
  BUSINESS_TYPES,
} from "../constants/businessPermitTypes";
import type { BusinessPermitFormValues } from "../types/businessPermit.types";

const MONETARY_AMOUNT_PATTERN = /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/;

export const validateBusinessPermit = (
  values: BusinessPermitFormValues,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.businessName.trim()) {
    errors.businessName = "Enter the business name.";
  }
  if (!BUSINESS_TYPES.some((type) => type === values.natureOfBusiness)) {
    errors.natureOfBusiness = "Select the nature of the business.";
  }
  if (
    !MONETARY_AMOUNT_PATTERN.test(values.initialCapital.trim()) ||
    !Number.isFinite(Number(values.initialCapital)) ||
    Number(values.initialCapital) < 0
  ) {
    errors.initialCapital =
      "Enter a valid non-negative amount with up to two decimal places.";
  }
  if (!values.businessAddress.trim()) {
    errors.businessAddress = "Enter the business address.";
  }
  if (
    !BUSINESS_APPLICATION_TYPES.some(
      (type) => type === values.applicationType,
    )
  ) {
    errors.applicationType = "Select New or Renewal.";
  }
  if (!values.businessOwnerFullName.trim()) {
    errors.businessOwnerFullName = "Enter the business owner's full name.";
  }
  if (!values.homeAddress.trim()) {
    errors.homeAddress = "Enter the business owner's home address.";
  }
  if (!values.contactNumber.trim()) {
    errors.contactNumber = "Enter the business owner's contact number.";
  }

  return errors;
};
