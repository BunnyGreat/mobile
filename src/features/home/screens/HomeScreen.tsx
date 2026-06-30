import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../theme";
import HeroHeader from "../components/HeroHeader";
import HeroCarousel from "../components/HeroCarousel";
import WeatherCard from "../components/WeatherCard";
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader />
        <HeroCarousel />
        <QuickActionsGrid />
        <WeatherCard />
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
});

export default HomeScreen;
