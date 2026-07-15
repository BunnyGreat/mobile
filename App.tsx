import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { useNotificationListener } from "./src/features/notification/hooks/useNotificationListener";

export default function App() {
  useNotificationListener();

  return <AppNavigator />;
}
