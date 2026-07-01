export type AccountStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PersonalInformation {
  firstName: string;
  middleName?: string;
  lastName: string;
  profilePhotoUrl?: string;
  profilePhotoPath?: string;
}

export interface LoginUser {
  uid: string;
  email: string;
  role: string;
  status: AccountStatus;
  referenceId?: string;
  personalInformation: PersonalInformation;
  profilePhotoUrl?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: LoginUser;
  error?: string;
}
