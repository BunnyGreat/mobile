import React from "react";
import { Text, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

export const EmptyRequirements: React.FC = () => (
  <View
    style={{
      paddingVertical: SPACING.lg + 4,
      paddingHorizontal: SPACING.lg,
      backgroundColor: COLORS.inputBackground,
      borderRadius: 10,
      alignItems: "center",
    }}
  >
    <Text
      style={{
        fontFamily: FONT_FAMILY.regular,
        fontSize: FONT_SIZE.body13,
        color: COLORS.placeholder,
        textAlign: "center",
        lineHeight: 19,
      }}
    >
      No additional requirements needed for this certificate.
    </Text>
  </View>
);

export default EmptyRequirements;
