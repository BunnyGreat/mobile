export type AccountStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginUser {
  uid: string;
  email: string;
  role: string;
  status: AccountStatus;
  referenceId?: string;
  profilePhotoUrl?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: LoginUser;
  error?: string;
}
