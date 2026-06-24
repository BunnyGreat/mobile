import React from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export type StatusType =
  | "pending"
  | "under_review"
  | "approved"
  | "completed"
  | "rejected";

const statusStyles: Record<
  StatusType,
  { backgroundColor: string; textColor: string }
> = {
  pending: { backgroundColor: COLORS.warning, textColor: COLORS.heading },
  under_review: { backgroundColor: COLORS.primary, textColor: COLORS.white },
  approved: { backgroundColor: COLORS.success, textColor: COLORS.white },
  completed: { backgroundColor: COLORS.primary, textColor: COLORS.white },
  rejected: { backgroundColor: COLORS.danger, textColor: COLORS.white },
};

export interface StatusBadgeProps {
  status: StatusType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const currentStyle = statusStyles[status];

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? `Status ${status}`}
      style={[
        {
          backgroundColor: currentStyle.backgroundColor,
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
          borderRadius: SPACING.sm,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: currentStyle.textColor,
            fontSize: FONT_SIZE.body12,
            fontFamily: FONT_FAMILY.semibold,
          },
          textStyle,
        ]}
      >
        {status.replace(/_/g, " ")}
      </Text>
    </View>
  );
};

export default StatusBadge;
