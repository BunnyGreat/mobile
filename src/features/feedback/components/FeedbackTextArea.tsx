import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface FeedbackTextAreaProps {
  value: string;
  onChangeText: (value: string) => void;
  maxLength?: number;
}

const FeedbackTextArea: React.FC<FeedbackTextAreaProps> = ({
  value,
  onChangeText,
  maxLength = 500,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >
        <Feather
          name="edit-3"
          size={18}
          color={isFocused ? COLORS.primary : COLORS.placeholder}
          style={styles.inputIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Write your feedback here..."
          placeholderTextColor={COLORS.placeholder}
          multiline
          maxLength={maxLength}
          style={styles.input}
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: 180,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginTop: SPACING.md,
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    minHeight: 160,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    lineHeight: 24,
  },
});

export default FeedbackTextArea;
