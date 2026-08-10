import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  StyleSheet,
  useWindowDimensions,
  Easing,
} from "react-native";
import { SPACING } from "../../../theme";
import { DigitalIDFront } from "./DigitalIDFront";
import { DigitalIDBack } from "./DigitalIDBack";
import type { DigitalIDDisplayData } from "../types/digitalID.types";

interface DigitalIDCardProps {
  data: DigitalIDDisplayData;
  isFlipped: boolean;
  onFlip?: () => void;
}

export const DigitalIDCard: React.FC<DigitalIDCardProps> = ({
  data,
  isFlipped,
}) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - SPACING.lg * 2, 350);
  const cardHeight = cardWidth * 0.65;

  // Animate the flip
  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isFlipped ? 1 : 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isFlipped, animationValue]);

  // Interpolate rotation
  const rotateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  // Front and back visibility with rotation
  const frontOpacity = animationValue.interpolate({
    inputRange: [0, 0.4, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 0.6, 1],
    outputRange: [0, 0, 1, 1],
  });

  const cardScale = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.97, 1],
  });

  return (
    <View
      style={[styles.container, { width: cardWidth, height: cardHeight }]}
      accessible={false}
      accessibilityLabel="Digital ID Card Flipper"
    >
      {/* Front Side */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: frontOpacity,
            transform: [
              { perspective: 1200 },
              { rotateY },
              { scale: cardScale },
            ],
            zIndex: isFlipped ? 0 : 1,
          },
        ]}
        pointerEvents={isFlipped ? "none" : "auto"}
      >
        <DigitalIDFront data={data} />
      </Animated.View>

      {/* Back Side */}
      <Animated.View
        style={[
          styles.cardWrapper,
          styles.backWrapper,
          {
            opacity: backOpacity,
            transform: [
              { perspective: 1200 },
              { rotateY: backRotateY },
              { scale: cardScale },
            ],
            zIndex: isFlipped ? 1 : 0,
          },
        ]}
        pointerEvents={isFlipped ? "auto" : "none"}
      >
        <DigitalIDBack data={data} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SPACING.lg,
  },
  cardWrapper: {
    ...StyleSheet.absoluteFillObject,
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  backWrapper: {
    // Ensure back is positioned same as front
  },
});
