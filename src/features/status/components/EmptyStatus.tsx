import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

export const EmptyStatus: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../../../assets/images/empty-state-status.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>No Requests Yet</Text>

      <Text style={styles.description}>
        You haven't submitted any service requests yet. Once you create a request, you can track its progress here in real time.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.giant,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    marginBottom: SPACING.xl,
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

export default EmptyStatus;
