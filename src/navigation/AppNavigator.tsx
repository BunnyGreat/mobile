import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RootNavigator from "./RootNavigator";
import GlobalStatusBar from "./components/GlobalStatusBar";

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <GlobalStatusBar />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <RootNavigator />
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;
