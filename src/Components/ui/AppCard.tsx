import React from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SHADOWS, SPACING } from "../../theme";

export interface AppCardProps {
  children: React.ReactNode;
  padding?: keyof typeof SPACING;
  shadow?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  padding = "lg",
  shadow = true,
  style,
  contentStyle,
  accessibilityLabel,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: COLORS.white,
      borderRadius: SPACING.sm,
      padding: SPACING[padding],
      ...(shadow ? SHADOWS.medium : {}),
    },
    style,
  ];

  return (
    <View accessibilityLabel={accessibilityLabel} style={containerStyle}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

export default AppCard;
