import React from "react";
import {
  FieldValues,
  Path,
  UseControllerProps,
  Controller,
} from "react-hook-form";
import { AppInput } from "../ui/AppInput";
import { View, Text, StyleProp, TextStyle, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface FormPasswordInputProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  label?: string;
  placeholder?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const FormPasswordInput = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  label,
  placeholder,
  required = false,
  containerStyle,
  inputStyle,
}: FormPasswordInputProps<T>) => {
  return (
    <Controller
      name={name as Path<T>}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <View style={containerStyle}>
          <AppInput
            label={label}
            placeholder={placeholder}
            value={value as string}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            required={required}
            isPassword
            inputStyle={inputStyle}
          />
          {fieldState.error?.message ? (
            <Text
              style={{
                color: COLORS.danger,
                marginTop: SPACING.xs,
                fontFamily: FONT_FAMILY.regular,
                fontSize: FONT_SIZE.body12,
              }}
            >
              {fieldState.error.message}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
};

export default FormPasswordInput;
