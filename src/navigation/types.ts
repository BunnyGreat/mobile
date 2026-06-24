import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
