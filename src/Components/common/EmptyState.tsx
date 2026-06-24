import React from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}) => {
  return (
    <View style={[{ alignItems: "center", padding: SPACING.xl }, style]}>
      {icon ? <View style={{ marginBottom: SPACING.lg }}>{icon}</View> : null}
      <Text
        style={{
          fontSize: FONT_SIZE.h20,
          fontFamily: FONT_FAMILY.semibold,
          color: COLORS.heading,
          marginBottom: SPACING.sm,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: FONT_SIZE.body14,
          fontFamily: FONT_FAMILY.regular,
          color: COLORS.paragraph,
          textAlign: "center",
          marginBottom: SPACING.lg,
        }}
      >
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          style={{
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.lg,
            borderRadius: SPACING.sm,
            backgroundColor: COLORS.primary,
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontFamily: FONT_FAMILY.semibold,
              fontSize: FONT_SIZE.body14,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default EmptyState;
