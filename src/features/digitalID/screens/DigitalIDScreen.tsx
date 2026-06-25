import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../../components/common/ScreenContainer";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const DigitalIDScreen: React.FC = () => (
  <ScreenContainer style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>Digital ID Screen</Text>
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  title: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h24,
  },
});

export default DigitalIDScreen;
