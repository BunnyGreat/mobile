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
      android_ripple={{ color: COLORS.border, borderless: false }}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={`Opens ${item.title}`}
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
    width: 88,
    minHeight: 102,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
    ...SHADOWS.soft,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.heading,
    textAlign: "center",
    lineHeight: 16,
    minHeight: 32,
  },
});

export default QuickActionCard;
