import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

export const AnnouncementEmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../../../assets/images/empty-state-announcement.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>No Announcements Yet</Text>

      <Text style={styles.description}>
        There are no announcements available right now. Check back later for
        important community updates and public notices.
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
    paddingVertical: SPACING.huge,
  },
  illustrationContainer: {
    marginBottom: SPACING.xl,
  },
  illustration: {
    width: 200,
    height: 160,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: 0.2,
  },
  description: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default AnnouncementEmptyState;
