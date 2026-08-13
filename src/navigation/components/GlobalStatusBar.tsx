import React from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const GlobalStatusBar: React.FC = () => {
  // Use Expo's StatusBar for cross-platform handling and fall back to RN StatusBar for Android props
  return (
    <>
      <ExpoStatusBar
        style="dark"
        backgroundColor="transparent"
        translucent={true}
      />
      {Platform.OS === "android" && (
        <RNStatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
      )}
    </>
  );
};

export default GlobalStatusBar;
