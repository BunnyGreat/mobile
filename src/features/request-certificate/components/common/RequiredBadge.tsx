import React from "react";
import { Text, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

export const RequiredBadge: React.FC = () => (
  <View
    style={{
      backgroundColor: `${COLORS.primary}10`,
      paddingHorizontal: SPACING.sm + 2,
      paddingVertical: SPACING.xs - 1,
      borderRadius: 5,
      alignSelf: "flex-start",
    }}
  >
    <Text
      style={{
        color: COLORS.primary,
        fontFamily: FONT_FAMILY.semibold,
        fontSize: FONT_SIZE.body11,
        letterSpacing: 0.3,
      }}
    >
      REQUIRED
    </Text>
  </View>
);

export default RequiredBadge;
