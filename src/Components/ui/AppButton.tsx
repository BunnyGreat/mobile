import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SHADOWS, SPACING } from "../../theme";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) return COLORS.border;

    switch (variant) {
      case "secondary":
        return COLORS.heading;
      case "outline":
        return "transparent";
      case "danger":
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return COLORS.paragraph;

    switch (variant) {
      case "outline":
        return COLORS.primary;
      case "danger":
        return COLORS.white;
      default:
        return COLORS.white;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          minHeight: 40,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          fontSize: FONT_SIZE.body12,
        };
      case "lg":
        return {
          minHeight: 56,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.xl,
          fontSize: FONT_SIZE.body16,
        };
      default:
        return {
          minHeight: 48,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.lg,
          fontSize: FONT_SIZE.body14,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const buttonStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: getBackgroundColor(),
      borderRadius: SPACING.sm,
      minHeight: sizeStyles.minHeight,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: fullWidth ? "100%" : undefined,
      opacity: isDisabled ? 0.65 : 1,
      ...(variant === "outline" && {
        borderWidth: 1,
        borderColor: COLORS.primary,
      }),
      ...(!isDisabled && variant === "primary" ? SHADOWS.medium : {}),
    },
    style,
  ];

  const labelStyle: StyleProp<TextStyle> = [
    {
      color: getTextColor(),
      fontFamily: FONT_FAMILY.semibold,
      fontSize: sizeStyles.fontSize,
      textAlign: "center",
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && (
            <View style={{ marginRight: SPACING.sm }}>{leftIcon}</View>
          )}
          <Text style={labelStyle}>{label}</Text>
          {rightIcon && (
            <View style={{ marginLeft: SPACING.sm }}>{rightIcon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
