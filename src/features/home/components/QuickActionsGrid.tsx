import React from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import QuickActionCard from "./QuickActionCard";
import useQuickActions from "../hooks/useQuickActions";
import type { QuickAction } from "../types/home.types";

interface QuickActionsGridProps {
  actions?: QuickAction[];
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  const { quickActions } = useQuickActions();
  const items = actions ?? quickActions;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingAccent} />
        <View>
          <Text style={styles.title}>Services at your fingertips</Text>
          <Text style={styles.subtitle}>
            Common barangay services, all in one place
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {items.map((action) => (
          <QuickActionCard key={action.id} item={action} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  headingAccent: {
    width: 4,
    height: 34,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
});

export default QuickActionsGrid;
