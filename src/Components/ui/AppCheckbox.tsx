import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface AppCheckboxProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const AppCheckbox: React.FC<AppCheckboxProps> = ({
  checked,
  label,
  disabled = false,
  onChange,
  style,
  labelStyle,
  accessibilityLabel,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: checked ? COLORS.primary : COLORS.border,
          backgroundColor: checked ? COLORS.primary : COLORS.white,
          justifyContent: "center",
          alignItems: "center",
          marginRight: SPACING.sm,
        }}
      >
        {checked && (
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: COLORS.white,
              borderRadius: 2,
            }}
          />
        )}
      </View>
      <Text
        style={[
          {
            fontFamily: FONT_FAMILY.regular,
            fontSize: FONT_SIZE.body14,
            color: COLORS.heading,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default AppCheckbox;
