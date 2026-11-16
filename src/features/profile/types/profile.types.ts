export type ResidentStatus = "approved" | "pending" | "rejected" | string;

export interface ProfilePersonalInformation {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  dateOfBirth: string;
  birthplace?: string | null;
  gender: "male" | "female" | "other";
  civilStatus: "single" | "married" | "widowed" | "separated" | "divorced";
  contactNumber: string;
  profilePhotoUri?: string | null;
  profilePhotoUrl?: string | null;
  profilePhotoPath?: string | null;
}

export interface ProfileResidenceInformation {
  houseNumber: string;
  street: string;
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
}

export interface ProfileDocuments {
  frontIdPath?: string | null;
  backIdPath?: string | null;
  frontIdUrl?: string | null;
  backIdUrl?: string | null;
}

export interface Profile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  referenceId: string;
  residentStatus: ResidentStatus;
  profilePhotoUrl?: string | null;
  profilePhotoPath?: string | null;
  updatedAt?: string | null;
  personalInformation: ProfilePersonalInformation;
  residenceInformation: ProfileResidenceInformation;
  documents: ProfileDocuments;
}

export interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
  clearProfile: () => void;
}
