import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
