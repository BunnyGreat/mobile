import React from "react";
import { StyleSheet, View, Text } from "react-native";
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
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {items.map((action) => (
          <QuickActionCard key={action.id} item={action} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
});

export default QuickActionsGrid;
