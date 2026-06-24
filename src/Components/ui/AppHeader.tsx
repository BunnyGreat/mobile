import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from "../../theme";

interface AppHeaderProps {
  /** Title text or node to display in the center */
  title?: string | ReactNode;
  /** Subtitle or node below title */
  subtitle?: string | ReactNode;
  /** Left icon or button component */
  leftAction?: ReactNode;
  /** Callback for left action button */
  onLeftActionPress?: (event: GestureResponderEvent) => void;
  /** Right icon or button component */
  rightAction?: ReactNode;
  /** Callback for right action button */
  onRightActionPress?: (event: GestureResponderEvent) => void;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** If true, shows a divider/border at the bottom */
  showDivider?: boolean;
  /** Background color of the header */
  backgroundColor?: string;
  /** If true, uses centered layout (useful for onboarding/splash screens) */
  centered?: boolean;
}

/**
 * Reusable header component for screens and modals.
 * Supports left/right actions, title, and subtitle.
 *
 * @example
 * ```tsx
 * <AppHeader
 *   title="Profile"
 *   leftAction={<BackIcon />}
 *   onLeftActionPress={() => navigation.goBack()}
 *   rightAction={<EditIcon />}
 *   onRightActionPress={() => setEditMode(true)}
 * />
 * ```
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  onLeftActionPress,
  rightAction,
  onRightActionPress,
  containerStyle,
  showDivider = true,
  backgroundColor = COLORS.white,
  centered = false,
}) => {
  const containerViewStyle: ViewStyle = {
    backgroundColor,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: showDivider ? 1 : 0,
    borderBottomColor: COLORS.border,
    ...containerStyle,
  };

  const headerContentStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: centered ? "center" : "space-between",
  };

  const titleContainerStyle: ViewStyle = {
    flex: 1,
    alignItems: centered ? "center" : "flex-start",
    justifyContent: "center",
  };

  const titleStyle: TextStyle = {
    fontSize: FONT_SIZE.h20,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
    fontWeight: "600",
  };

  const subtitleStyle: TextStyle = {
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
    marginTop: SPACING.xs,
  };

  const actionButtonStyle: ViewStyle = {
    padding: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <View style={containerViewStyle}>
      <View style={headerContentStyle}>
        {leftAction && (
          <TouchableOpacity
            style={actionButtonStyle}
            onPress={onLeftActionPress}
            disabled={!onLeftActionPress}
            activeOpacity={0.7}
          >
            {leftAction}
          </TouchableOpacity>
        )}

        <View style={titleContainerStyle}>
          {title &&
            (typeof title === "string" ? (
              <Text style={titleStyle}>{title}</Text>
            ) : (
              title
            ))}

          {subtitle &&
            (typeof subtitle === "string" ? (
              <Text style={subtitleStyle}>{subtitle}</Text>
            ) : (
              subtitle
            ))}
        </View>

        {rightAction && (
          <TouchableOpacity
            style={actionButtonStyle}
            onPress={onRightActionPress}
            disabled={!onRightActionPress}
            activeOpacity={0.7}
          >
            {rightAction}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AppHeader;
