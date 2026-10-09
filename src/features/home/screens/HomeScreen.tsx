import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";
import { COLORS, SPACING } from "../../../theme";
import HeroHeader from "../components/HeroHeader";
import HeroCarousel from "../components/HeroCarousel";
import QuickActionsGrid from "../components/QuickActionsGrid";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useDashboard } from "../hooks/useDashboard";

const HomeScreen: React.FC = () => {
  const { loading } = useDashboard();

  if (loading) {
    return <DashboardSkeleton visible={loading} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View
        pointerEvents="none"
        style={styles.dotPattern}
        accessible={false}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: 0.1 + (index % 5) * 0.025 },
            ]}
          />
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader />
        <HeroCarousel />
        <QuickActionsGrid />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    paddingBottom: SPACING.lg,
  },
  dotPattern: {
    position: "absolute",
    right: SPACING.sm,
    bottom: SPACING.xl,
    width: 64,
    height: 48,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignContent: "flex-start",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    margin: 4,
    backgroundColor: COLORS.primary,
  },
});

export default HomeScreen;
