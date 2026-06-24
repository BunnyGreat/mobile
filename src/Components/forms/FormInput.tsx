import React from "react";
import {
  Controller,
  FieldValues,
  Path,
  UseControllerProps,
} from "react-hook-form";
import { View, Text, StyleProp, TextStyle, ViewStyle } from "react-native";
import { AppInput } from "../ui/AppInput";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface FormInputProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
}

export const FormInput = <T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  label,
  placeholder,
  required = false,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
}: FormInputProps<T>) => {
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
            inputStyle={inputStyle}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            secureTextEntry={secureTextEntry}
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

export default FormInput;
