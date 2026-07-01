import type { CertificatePurpose, LoanType } from "./certificatePurpose.types";

export interface BarangayClearanceFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  birthdate: string;
  birthplace: string;
  contactNumber: string;
  purpose: CertificatePurpose | "";
  dynamicFieldValue?: string;
  loanType?: LoanType;
}

export interface BarangayClearancePayload {
  residentName: string;
  address: string;
  birthdate: string;
  birthplace: string;
  contactNumber: string;
  purpose: string;
  additionalInformation?: string;
}
