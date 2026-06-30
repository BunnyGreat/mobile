import React, { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  style?: ViewStyle;
  showStep?: boolean;
  step?: number;
  totalSteps?: number;
  completed?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  children,
  style,
  showStep = false,
  step = 1,
  totalSteps = 5,
  completed = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {showStep && (
          <View style={[styles.stepBadge, completed && styles.stepBadgeCompleted]}>
            <Text style={[styles.stepNumber, completed && styles.stepNumberCompleted]}>
              {completed ? "✓" : step}
            </Text>
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  stepBadgeCompleted: {
    backgroundColor: COLORS.success,
  },
  stepNumber: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.white,
  },
  stepNumberCompleted: {
    color: COLORS.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginTop: 2,
  },
});

export default FormSection;
