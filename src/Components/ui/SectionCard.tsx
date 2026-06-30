import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { COLORS, SHADOWS, SPACING } from "../../theme";

interface SectionCardProps {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  style,
  contentStyle,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  content: {
    flex: 1,
  },
});

export default SectionCard;
