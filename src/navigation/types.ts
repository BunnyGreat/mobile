import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FilterType } from "../features/status/types/status.types";

export type MainTabParamList = {
  Home: undefined;
  Notifications: undefined;
  DigitalID: undefined;
  Status: { filter?: FilterType } | undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  VerifyOtp: undefined;
  ResetPassword: undefined;
  Register: undefined;
  RegisterOtp: undefined;
  PersonalInformation: undefined;
  ResidenceInformation: undefined;
  UploadIdentification: undefined;
  RegistrationSuccess: undefined;
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePasswordScreen: undefined;
  RequestCertificateScreen: undefined;
  BarangayClearance: undefined;
  BarangayCertification: undefined;
  CertificateOfIndigency: { mode?: "self" | "relative" } | undefined;
  AnnouncementScreen: undefined;
  FeedbackScreen: undefined;
  AppointmentScreen: undefined;
  MainTabs:
    | {
        screen: keyof MainTabParamList;
        params?: object;
      }
    | undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
