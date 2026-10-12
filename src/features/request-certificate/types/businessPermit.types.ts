export type BusinessApplicationType = "New" | "Renewal";
export type BusinessPermitRequestFor = "new" | "renew";

export interface BusinessPermitFormValues {
  businessName: string;
  natureOfBusiness: string;
  initialCapital: string;
  businessAddress: string;
  applicationType: BusinessApplicationType | "";
  businessOwnerFullName: string;
  homeAddress: string;
  contactNumber: string;
}

export interface BusinessPermitSubmission {
  requestFor: BusinessPermitRequestFor;
  businessInformation: {
    businessName: string;
    natureOfBusiness: string;
    initialCapital: number;
    businessAddress: string;
    applicationType: BusinessApplicationType;
    businessOwnerFullName: string;
    homeAddress: string;
    contactNumber: string;
  };
}
