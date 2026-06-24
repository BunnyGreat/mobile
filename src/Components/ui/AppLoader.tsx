import React from "react";
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";
import { COLORS, SHADOWS, SPACING } from "../../theme";

export interface AppLoaderProps {
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
  overlay?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  size = "large",
  color = COLORS.primary,
  style,
  overlay = true,
}) => {
  return (
    <View
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          padding: SPACING.xl,
          backgroundColor: overlay ? "rgba(0,0,0,0.08)" : "transparent",
          borderRadius: overlay ? SPACING.sm : 0,
          ...(!overlay ? {} : SHADOWS.small),
        },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default AppLoader;
