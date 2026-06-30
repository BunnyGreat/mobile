import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import {
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SHADOWS,
  SPACING,
} from "../../../theme";

export interface DashboardSkeletonProps {
  visible?: boolean;
}

interface SkeletonBlockProps {
  style?: object;
  width?: string | number;
  height?: number;
  radius?: number;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  style,
  width = "100%",
  height = 16,
  radius = 16,
}) => {
  return (
    <View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    />
  );
};

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  visible = true,
}) => {
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: pulse }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <SkeletonBlock width={48} height={48} radius={12} />
          <View style={styles.headerTextGroup}>
            <SkeletonBlock height={18} width={140} style={styles.headerText} />
            <SkeletonBlock
              height={14}
              width={110}
              style={styles.headerSubText}
            />
          </View>
        </View>
        <SkeletonBlock width={36} height={36} radius={18} />
      </View>

      <SkeletonBlock
        height={140}
        width="100%"
        radius={20}
        style={styles.carouselBlock}
      />

      <View style={styles.weatherCard}>
        <SkeletonBlock height={24} width={140} />
        <View style={styles.weatherRow}>
          <SkeletonBlock width={80} height={80} radius={40} />
          <View style={styles.weatherDetails}>
            <SkeletonBlock height={18} width={120} />
            <SkeletonBlock height={14} width={90} style={styles.weatherLine} />
            <SkeletonBlock height={14} width={110} style={styles.weatherLine} />
          </View>
        </View>
      </View>

      <View style={styles.quickActionsSection}>
        <SkeletonBlock height={20} width={120} />
        <View style={styles.quickActionsGrid}>
          {[0, 1, 2, 3].map((item) => (
            <SkeletonBlock
              key={item}
              height={132}
              width="48%"
              radius={18}
              style={styles.quickActionCard}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTextGroup: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerText: {
    marginBottom: SPACING.xs,
  },
  headerSubText: {
    marginTop: SPACING.xs,
  },
  carouselBlock: {
    marginBottom: SPACING.lg,
  },
  weatherCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  weatherDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  weatherLine: {
    marginTop: SPACING.sm,
  },
  quickActionsSection: {
    marginTop: SPACING.sm,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  quickActionCard: {
    marginBottom: SPACING.md,
  },
  skeletonBase: {
    backgroundColor: "#E5E7EB",
  },
});

export default DashboardSkeleton;
