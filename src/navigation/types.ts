import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type MainTabParamList = {
  Home: undefined;
  Notifications: undefined;
  DigitalID: undefined;
  Status: undefined;
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
  MainTabs: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
