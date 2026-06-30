import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "../../../navigation/types";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SHADOWS,
  SPACING,
} from "../../../theme";
import type { QuickAction } from "../types/home.types";
import type { ComponentProps } from "react";

interface QuickActionCardProps {
  item: QuickAction;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ item }) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate(item.route)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      android_ripple={{ color: COLORS.border }}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={item.icon as ComponentProps<typeof Ionicons>["name"]}
          size={24}
          color={COLORS.primary}
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    minHeight: 132,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F7FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default QuickActionCard;
