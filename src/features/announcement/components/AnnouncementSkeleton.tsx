import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../theme";

const SkeletonBlock: React.FC<{ style?: object }> = ({ style }) => (
  <View style={[styles.skeleton, style]} />
);

export const AnnouncementSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <SkeletonBlock style={styles.image} />
      <View style={styles.content}>
        <SkeletonBlock style={styles.badge} />
        <SkeletonBlock style={styles.title} />
        <SkeletonBlock style={styles.description} />
        <SkeletonBlock style={styles.date} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
  },
  skeleton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 12,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  badge: {
    width: 60,
    height: 18,
    marginBottom: SPACING.sm,
  },
  title: {
    width: "90%",
    height: 18,
    marginBottom: 6,
  },
  description: {
    width: "100%",
    height: 14,
    marginBottom: 4,
  },
  date: {
    width: 80,
    height: 12,
    marginTop: SPACING.xs,
  },
});

export default AnnouncementSkeleton;
