import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../features/splash/SplashScreen";
import OnboardingScreen from "../features/onboarding/screens/OnboardingScreen";
import LoginScreen from "../features/auth/screens/login/LoginScreen";
import ForgotPasswordScreen from "../features/auth/screens/login/ForgotPasswordScreen";
import VerifyOtpScreen from "../features/auth/screens/login/VerifyOtpScreen";
import ResetPasswordScreen from "../features/auth/screens/login/ResetPasswordScreen";
import RegisterScreen from "../features/auth/screens/register/RegisterScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
