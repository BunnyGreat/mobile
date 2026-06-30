import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../theme";

const SkeletonBlock: React.FC<{ style?: object }> = ({ style }) => (
  <View style={[styles.skeleton, style]} />
);

export const StatusSkeleton: React.FC = () => (
  <View style={styles.container}>
    <SkeletonBlock style={styles.title} />
    <SkeletonBlock style={styles.status} />
    <SkeletonBlock style={styles.date} />
    <SkeletonBlock style={styles.button} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeleton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },
  title: {
    width: "70%",
    height: 18,
    marginBottom: SPACING.md,
  },
  status: {
    width: "50%",
    height: 16,
    marginBottom: SPACING.sm,
  },
  date: {
    width: "40%",
    height: 14,
    marginBottom: SPACING.md,
  },
  button: {
    width: "100%",
    height: 40,
    borderRadius: 8,
  },
});

export default StatusSkeleton;
