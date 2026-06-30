import React, { useState } from "react";
import { Pressable, StyleSheet, View, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../../theme";

interface RatingStarsProps {
  rating: number;
  onChange: (value: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, onChange }) => {
  const [scales, setScales] = useState<{ [key: number]: Animated.Value }>({
    1: new Animated.Value(1),
    2: new Animated.Value(1),
    3: new Animated.Value(1),
    4: new Animated.Value(1),
    5: new Animated.Value(1),
  });

  const animateStar = (value: number) => {
    Animated.sequence([
      Animated.timing(scales[value], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scales[value], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (value: number) => {
    animateStar(value);
    onChange(value);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;
        return (
          <Pressable
            key={value}
            onPress={() => handlePress(value)}
            style={({ pressed }) => [
              styles.starButton,
              pressed && styles.starButtonPressed,
            ]}
            hitSlop={12}
          >
            <Animated.View
              style={[
                styles.starWrapper,
                { transform: [{ scale: scales[value] }] },
              ]}
            >
              <Feather
                name={filled ? "star" : "star"}
                size={38}
                color={filled ? COLORS.warning : COLORS.border}
                style={filled ? styles.filledStar : styles.emptyStar}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
  },
  starButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  starButtonPressed: {
    opacity: 0.8,
  },
  starWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  filledStar: {
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyStar: {
    opacity: 0.5,
  },
});

export default RatingStars;
