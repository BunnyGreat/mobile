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
  <View style={{ marginBottom: SPACING.md }}>
    <Text
      style={{
        fontSize: FONT_SIZE.body13,
        fontFamily: FONT_FAMILY.medium,
        color: COLORS.heading,
        marginBottom: SPACING.xs,
        letterSpacing: -0.1,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: multiline ? "flex-start" : "center",
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        minHeight: multiline ? 80 : 48,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          backgroundColor: `${COLORS.placeholder}15`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: SPACING.sm + 2,
          marginTop: multiline ? 2 : 0,
        }}
      >
        <Feather name="lock" size={10} color={COLORS.placeholder} />
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: FONT_SIZE.body14,
          fontFamily: FONT_FAMILY.regular,
          color: COLORS.paragraph,
          lineHeight: multiline ? 20 : 20,
        }}
      >
        {value || "—"}
      </Text>
    </View>
  </View>
);

export default ReadOnlyField;
