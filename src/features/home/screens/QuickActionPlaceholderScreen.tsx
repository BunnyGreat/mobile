import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const QuickActionPlaceholderScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Quick Action</Text>
        <Text style={styles.subtitle}>
          This screen is intentionally left as a placeholder for the UI-only
          quick action flow.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: SPACING.xxl,
    alignItems: "center",
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    textAlign: "center",
  },
});

export default QuickActionPlaceholderScreen;
