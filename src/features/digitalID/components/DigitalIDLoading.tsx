import React from "react";
import { View, StyleSheet, useWindowDimensions, Animated } from "react-native";
import { COLORS, SPACING } from "../../../theme";

export const DigitalIDLoading: React.FC = () => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - SPACING.lg * 2, 350);
  const cardHeight = cardWidth * 0.65;

  // Create a shimmer animation
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight,
        },
      ]}
      accessible
      accessibilityLabel="Loading Digital ID"
      accessibilityRole="progressbar"
    >
      <Animated.View style={[styles.skeletonContent, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginVertical: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  skeletonContent: {
    flex: 1,
    alignSelf: "stretch",
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
});
