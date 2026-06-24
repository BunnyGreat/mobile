import React, { useEffect, useRef, useState } from "react";
import { StyleProp, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface FormOtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const FormOtpInput: React.FC<FormOtpInputProps> = ({
  length = 4,
  value = "",
  onChange,
  autoFocus = false,
  containerStyle,
  inputStyle,
  accessibilityLabel,
}) => {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, index) => value[index] ?? ""),
  );
  const refs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    setDigits(Array.from({ length }, (_, index) => value[index] ?? ""));
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    const newDigits = [...digits];
    const nextValue = text.slice(-1);
    newDigits[index] = nextValue;
    setDigits(newDigits);
    onChange?.(newDigits.join(""));

    if (nextValue && refs.current[index + 1]) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    { nativeEvent }: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (
      nativeEvent.key === "Backspace" &&
      !digits[index] &&
      refs.current[index - 1]
    ) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? "OTP input"}
      style={[
        { flexDirection: "row", justifyContent: "space-between" },
        containerStyle,
      ]}
    >
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={digits[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            {
              width: 48,
              height: 56,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: SPACING.sm,
              textAlign: "center",
              fontSize: FONT_SIZE.h20,
              fontFamily: FONT_FAMILY.semibold,
              color: COLORS.heading,
            },
            inputStyle,
          ]}
          accessibilityLabel={`${accessibilityLabel ?? "OTP"} digit ${index + 1}`}
        />
      ))}
    </View>
  );
};

export default FormOtpInput;
