import React, { ReactNode } from "react";
import { Dimensions, StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconName?: keyof typeof Feather.glyphMap;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconName = "calendar",
  backgroundColor = COLORS.primary,
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Decorative Background Elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      <View style={styles.decorCircle4} />

      {/* Hero Content */}
      <View style={styles.content}>
        {icon ? (
          <View style={styles.iconContainer}>{icon}</View>
        ) : (
          <View style={styles.iconContainer}>
            <Feather name={iconName} size={36} color={COLORS.white} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingBottom: 48,
    position: "relative",
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  decorCircle3: {
    position: "absolute",
    top: 100,
    left: SCREEN_WIDTH * 0.5,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  decorCircle4: {
    position: "absolute",
    top: 30,
    left: SCREEN_WIDTH * 0.2,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
});

export default HeroHeader;
