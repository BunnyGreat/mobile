import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

export const NotificationEmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../../../assets/images/empty-state-notification.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>You're All Caught Up</Text>

      <Text style={styles.description}>
        You don't have any notifications right now. New updates and important
        alerts will appear here when they're available.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.giant,
  },
  illustrationContainer: {
    width: 180,
    height: 180,
    marginBottom: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  description: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default NotificationEmptyState;
