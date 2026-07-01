import React from "react";
import { Text, TextInput, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

interface DynamicFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  disabled?: boolean;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  disabled = false,
}) => (
  <View style={{ marginBottom: SPACING.xl }}>
    <Text
      style={{
        fontSize: FONT_SIZE.body14,
        fontFamily: FONT_FAMILY.medium,
        color: COLORS.heading,
        marginBottom: SPACING.sm,
      }}
    >
      {label}
    </Text>
    <TextInput
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      editable={!disabled}
      placeholderTextColor={COLORS.placeholder}
      style={{
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        fontSize: FONT_SIZE.body16,
        fontFamily: FONT_FAMILY.regular,
        color: COLORS.heading,
        backgroundColor: disabled ? COLORS.inputBackground : COLORS.white,
        minHeight: 48,
      }}
    />
  </View>
);

export default DynamicField;
