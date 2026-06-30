import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS, SPACING, SHADOWS } from "../../../theme";

const SkeletonBlock: React.FC<{ style?: object }> = ({ style }) => (
  <View style={[styles.skeleton, style]}>
    <View style={styles.shimmer} />
  </View>
);

export const StatusSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.content}>
      {/* Type Badge */}
      <View style={styles.typeRow}>
        <SkeletonBlock style={styles.typeBadge} />
        <SkeletonBlock style={styles.reference} />
      </View>

      {/* Title */}
      <SkeletonBlock style={styles.title} />
      <SkeletonBlock style={styles.titleShort} />

      {/* Meta Row */}
      <View style={styles.metaRow}>
        <SkeletonBlock style={styles.statusBadge} />
        <SkeletonBlock style={styles.date} />
      </View>

      {/* Expand Row */}
      <View style={styles.expandRow}>
        <SkeletonBlock style={styles.expandText} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
    overflow: "hidden",
  },
  content: {
    padding: SPACING.lg,
  },
  skeleton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    overflow: "hidden",
  },
  shimmer: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    opacity: 0.5,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  reference: {
    width: 70,
    height: 14,
    borderRadius: 4,
  },
  title: {
    width: "100%",
    height: 20,
    marginBottom: SPACING.xs,
  },
  titleShort: {
    width: "60%",
    height: 20,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  statusBadge: {
    width: 100,
    height: 28,
    borderRadius: 14,
  },
  date: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  expandRow: {
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandText: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
});

export default StatusSkeleton;
