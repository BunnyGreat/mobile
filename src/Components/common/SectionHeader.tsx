import React from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  containerStyle,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: SPACING.md,
        },
        containerStyle,
      ]}
    >
      <View>
        <Text
          style={{
            fontSize: FONT_SIZE.h18,
            fontFamily: FONT_FAMILY.semibold,
            color: COLORS.heading,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: FONT_SIZE.body12,
              fontFamily: FONT_FAMILY.regular,
              color: COLORS.paragraph,
              marginTop: SPACING.xs,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionText && onActionPress ? (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text
            style={{
              color: COLORS.primary,
              fontFamily: FONT_FAMILY.semibold,
              fontSize: FONT_SIZE.body14,
            }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SectionHeader;
