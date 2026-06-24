export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface RegistrationPersonalInformation {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  civilStatus: "single" | "married" | "widowed" | "separated" | "divorced";
  contactNumber: string;
  profilePhotoUri: string | null;
}

export interface RegistrationResidenceInformation {
  houseNumber: string;
  street: string;
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
}

export interface RegistrationDocuments {
  frontIdUri: string | null;
  backIdUri: string | null;
}

export interface RegistrationFormData {
  personalInformation: RegistrationPersonalInformation;
  residenceInformation: RegistrationResidenceInformation;
  documents: RegistrationDocuments;
}

export interface UserDocument {
  uid: string;
  email: string;
  role: string;
  status: RegistrationStatus;
  personalInformation: RegistrationPersonalInformation;
  residenceInformation: RegistrationResidenceInformation;
  documents: RegistrationDocuments;
  createdAt: string;
  updatedAt: string;
}
