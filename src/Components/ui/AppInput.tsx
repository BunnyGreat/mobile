import React, { useState } from "react";
import {
  StyleProp,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

interface AppInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  placeholder?: string;
  error?: string;
  isPassword?: boolean;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  passwordToggleIcons?: {
    visible: React.ReactNode;
    hidden: React.ReactNode;
  };
  errorColor?: string;
  size?: "sm" | "md" | "lg";
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  placeholder,
  error,
  isPassword = false,
  required = false,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  errorColor = COLORS.danger,
  size = "md",
  value,
  onChangeText,
  secureTextEntry,
  passwordToggleIcons,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const getInputHeight = () => {
    switch (size) {
      case "sm":
        return 40;
      case "lg":
        return 56;
      default:
        return 48;
    }
  };

  const inputHeight = getInputHeight();

  const borderColor = error
    ? errorColor
    : isFocused
      ? COLORS.primary
      : COLORS.border;

  const containerViewStyle: StyleProp<ViewStyle> = [
    { marginBottom: SPACING.md },
    containerStyle,
  ];

  const inputContainerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.inputBackground,
    height: inputHeight,
  };

  const textInputStyle: StyleProp<TextStyle> = [
    {
      flex: 1,
      fontSize: FONT_SIZE.body14,
      fontFamily: FONT_FAMILY.regular,
      color: COLORS.paragraph,
      paddingVertical: 0,
    },
    inputStyle,
  ];

  const labelStyle: TextStyle = {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.heading,
    marginBottom: SPACING.xs,
    fontWeight: "500",
  };

  const errorStyle: TextStyle = {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: errorColor,
    marginTop: SPACING.xs,
  };

  return (
    <View style={containerViewStyle}>
      {label && (
        <Text style={labelStyle}>
          {label}
          {required && <Text style={{ color: errorColor }}>*</Text>}
        </Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={{ marginRight: SPACING.sm }}>{leftIcon}</View>
        )}

        <TextInput
          {...textInputProps}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={textInputStyle}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: SPACING.xs }}
          >
            {showPassword
              ? (passwordToggleIcons?.hidden ?? (
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: FONT_SIZE.body12,
                    }}
                  >
                    Hide
                  </Text>
                ))
              : (passwordToggleIcons?.visible ?? (
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: FONT_SIZE.body12,
                    }}
                  >
                    Show
                  </Text>
                ))}
          </TouchableOpacity>
        ) : (
          rightIcon && (
            <View style={{ marginLeft: SPACING.sm }}>{rightIcon}</View>
          )
        )}
      </View>

      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

export default AppInput;
