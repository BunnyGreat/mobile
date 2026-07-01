import React from "react";
import { Text, View } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

export const RequiredBadge: React.FC = () => (
  <View
    style={{
      backgroundColor: `${COLORS.primary}0D`,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 6,
      alignSelf: "flex-start",
    }}
  >
    <Text
      style={{
        color: COLORS.primary,
        fontFamily: FONT_FAMILY.semibold,
        fontSize: FONT_SIZE.body12,
      }}
    >
      Required
    </Text>
  </View>
);

export default RequiredBadge;
