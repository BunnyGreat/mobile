import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import {
  COLORS,
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

      <View style={styles.quickActionsSection}>
        <SkeletonBlock height={20} width={120} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsGrid}
        >
          {[0, 1, 2, 3].map((item) => (
            <View key={item} style={styles.quickActionCard}>
              <SkeletonBlock width={56} height={56} radius={28} />
              <SkeletonBlock
                height={12}
                width={64}
                radius={6}
                style={styles.quickActionLabel}
              />
            </View>
          ))}
        </ScrollView>
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
  quickActionsSection: {
    marginTop: SPACING.sm,
  },
  quickActionsGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickActionCard: {
    width: 72,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  quickActionLabel: {
    marginTop: SPACING.xs,
  },
  skeletonBase: {
    backgroundColor: "#E5E7EB",
  },
});

export default DashboardSkeleton;
