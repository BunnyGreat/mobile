import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { SPACING } from "../../theme";

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: keyof typeof SPACING;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  padding = "lg",
  style,
  contentContainerStyle,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    {
      flex: 1,
      backgroundColor: "transparent",
    },
    style,
  ];

  const scrollContentStyle: StyleProp<ViewStyle> = {
    paddingHorizontal: SPACING[padding],
    paddingTop: SPACING[padding],
    paddingBottom: SPACING[padding],
  };

  return (
    <SafeAreaView style={containerStyle}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[scrollContentStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            {
              paddingHorizontal: SPACING[padding],
              paddingTop: SPACING[padding],
              paddingBottom: SPACING[padding],
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ScreenContainer;
