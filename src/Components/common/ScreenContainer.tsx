import React, { ReactNode } from "react";
import { ScrollView, View, ViewStyle, ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../theme";

interface ScreenContainerProps extends Omit<ScrollViewProps, "children"> {
  children: ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  padding?: number | keyof typeof SPACING;
  containerStyle?: ViewStyle;
  flex?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  backgroundColor = COLORS.background,
  padding = "lg",
  containerStyle,
  flex = true,
  ...scrollViewProps
}) => {
  const contentStyle: ViewStyle = {
    flex: flex ? 1 : undefined,
    backgroundColor,
    padding: typeof padding === "string" ? SPACING[padding] : padding,
    ...containerStyle,
  };

  const content = <View style={contentStyle}>{children}</View>;

  return (
    <SafeAreaView
      style={{
        flex: flex ? 1 : undefined,
        backgroundColor,
      }}
    >
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

export default ScreenContainer;
