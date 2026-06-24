import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
