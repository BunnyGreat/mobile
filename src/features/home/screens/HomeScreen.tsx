import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import HeroHeader from "../components/HeroHeader";
import HeroCarousel from "../components/HeroCarousel";
import WeatherCard from "../components/WeatherCard";

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader />
        <HeroCarousel />
        <WeatherCard />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { paddingBottom: SPACING.lg },
});

export default HomeScreen;
