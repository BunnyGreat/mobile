import React from "react";
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

interface SectionHeaderProps {
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
}) => (
  <View
    style={[
      {
        marginBottom: SPACING.xl,
      },
      containerStyle,
    ]}
  >
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: FONT_SIZE.h24,
            fontFamily: FONT_FAMILY.bold,
            color: COLORS.heading,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: FONT_SIZE.body14,
              fontFamily: FONT_FAMILY.regular,
              color: COLORS.paragraph,
              marginTop: SPACING.xs,
              lineHeight: 20,
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
  </View>
);

export default SectionHeader;
