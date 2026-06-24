import React from "react";
import { View, ViewStyle } from "react-native";
import { COLORS, SPACING } from "../../theme";

interface DividerProps {
  /** Color of the divider line */
  color?: string;
  /** Height of the divider line */
  height?: number;
  /** Margin above the divider */
  marginTop?: number;
  /** Margin below the divider */
  marginBottom?: number;
  /** Horizontal margin (left and right) */
  marginHorizontal?: number;
  /** Whether the divider is vertical */
  vertical?: boolean;
  /** Width for vertical divider */
  width?: number;
  /** Custom style for the divider */
  style?: ViewStyle;
}

/**
 * Reusable divider component for separating content.
 * Can be horizontal or vertical.
 *
 * @example
 * ```tsx
 * <View>
 *   <Text>Section 1</Text>
 *   <Divider marginVertical={SPACING.md} />
 *   <Text>Section 2</Text>
 * </View>
 * ```
 */
export const Divider: React.FC<DividerProps> = ({
  color = COLORS.border,
  height = 1,
  marginTop = 0,
  marginBottom = 0,
  marginHorizontal = 0,
  vertical = false,
  width = 1,
  style,
}) => {
  const dividerStyle: ViewStyle = vertical
    ? {
        width: width || 1,
        backgroundColor: color,
        marginLeft: marginTop,
        marginRight: marginBottom,
        ...style,
      }
    : {
        height: height || 1,
        backgroundColor: color,
        marginTop,
        marginBottom,
        marginHorizontal,
        ...style,
      };

  return <View style={dividerStyle} />;
};

export default Divider;
