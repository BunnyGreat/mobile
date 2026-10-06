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
      <Text style={styles.title}>Quick Actions</Text>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: SPACING.sm,
  },
});

export default QuickActionsGrid;
