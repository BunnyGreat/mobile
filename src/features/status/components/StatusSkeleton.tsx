import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, SHADOWS } from "../../../theme";

const SkeletonBlock: React.FC<{ style?: object }> = ({ style }) => (
  <View style={[styles.skeleton, style]}>
    <View style={styles.shimmer} />
  </View>
);

export const StatusSkeleton: React.FC = () => (
  <View style={styles.card}>
    {/* Card Header */}
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <SkeletonBlock style={styles.iconContainer} />
        <View style={styles.headerInfo}>
          <SkeletonBlock style={styles.requestType} />
          <SkeletonBlock style={styles.reference} />
        </View>
      </View>
      <SkeletonBlock style={styles.statusPill} />
    </View>

    {/* Card Body */}
    <View style={styles.body}>
      <SkeletonBlock style={styles.title} />
      <SkeletonBlock style={styles.titleShort} />

      <View style={styles.metaRow}>
        <SkeletonBlock style={styles.dateBadge} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  headerInfo: {
    gap: 4,
  },
  requestType: {
    width: 120,
    height: 14,
    borderRadius: 4,
  },
  reference: {
    width: 60,
    height: 12,
    borderRadius: 4,
  },
  statusPill: {
    width: 90,
    height: 28,
    borderRadius: 14,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    width: "100%",
    height: 20,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  titleShort: {
    width: "70%",
    height: 20,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBadge: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  expandText: {
    width: 60,
    height: 16,
    borderRadius: 4,
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
});

export default StatusSkeleton;
