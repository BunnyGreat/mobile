import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
}

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  multiline = false,
}) => (
  <View style={{ marginBottom: SPACING.lg }}>
    <Text
      style={{
        fontSize: FONT_SIZE.body14,
        fontFamily: FONT_FAMILY.medium,
        color: COLORS.heading,
        marginBottom: SPACING.xs,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: multiline ? "flex-start" : "center",
        backgroundColor: COLORS.inputBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        paddingVertical: multiline ? SPACING.md + 2 : SPACING.md + 2,
        minHeight: multiline ? 84 : 50,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          backgroundColor: COLORS.border,
          justifyContent: "center",
          alignItems: "center",
          marginRight: SPACING.md,
          marginTop: multiline ? 2 : 0,
        }}
      >
        <Feather name="lock" size={11} color={COLORS.placeholder} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: FONT_SIZE.body14,
          fontFamily: FONT_FAMILY.regular,
          color: COLORS.paragraph,
          lineHeight: multiline ? 22 : 21,
        }}
      >
        {value || "—"}
      </Text>
    </View>
  </View>
);

export default ReadOnlyField;
