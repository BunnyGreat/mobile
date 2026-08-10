import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { useNotificationListener } from "./src/features/notification/hooks/useNotificationListener";

export default function App() {
  useNotificationListener();

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
