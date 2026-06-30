import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../theme";

const SkeletonBlock: React.FC<{ style?: object }> = ({ style }) => (
  <View style={[styles.skeleton, style]} />
);

export const NotificationSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.iconContainer}>
      <SkeletonBlock style={styles.icon} />
    </View>
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <SkeletonBlock style={styles.title} />
        <SkeletonBlock style={styles.time} />
      </View>
      <SkeletonBlock style={styles.message} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  skeleton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    width: "60%",
    height: 14,
  },
  message: {
    width: "100%",
    height: 14,
    marginBottom: SPACING.xs,
  },
  time: {
    width: "20%",
    height: 12,
  },
});

export default NotificationSkeleton;
