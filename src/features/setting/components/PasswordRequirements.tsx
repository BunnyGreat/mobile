import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  PasswordRequirement,
  PasswordStrength,
} from "../types/changePassword.types";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface PasswordRequirementsProps {
  requirements: PasswordRequirement[];
  strength: PasswordStrength;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  requirements,
  strength,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Password Strength</Text>
        <Text style={[styles.status, { color: strength.color }]}>
          {strength.label}
        </Text>
      </View>

      <View style={styles.bars}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            style={[
              styles.bar,
              level <= strength.level
                ? { backgroundColor: strength.color }
                : {},
              level === 3 && styles.barLast,
            ]}
          />
        ))}
      </View>

      <View style={styles.requirementsList}>
        {requirements.map((requirement) => (
          <View key={requirement.id} style={styles.requirementRow}>
            <View
              style={[
                styles.indicator,
                requirement.valid && styles.indicatorActive,
              ]}
            >
              {requirement.valid ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.requirementText,
                requirement.valid && styles.requirementTextActive,
              ]}
            >
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
  status: {
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.semibold,
  },
  bars: {
    flexDirection: "row",
    width: "100%",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  bar: {
    flex: 1,
    backgroundColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  barLast: {
    marginRight: 0,
  },
  requirementsList: {
    marginTop: SPACING.sm,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  indicatorActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: FONT_SIZE.body12,
    fontFamily: FONT_FAMILY.semibold,
  },
  requirementText: {
    flex: 1,
    fontSize: FONT_SIZE.body14,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.paragraph,
  },
  requirementTextActive: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
  },
});

export default PasswordRequirements;
