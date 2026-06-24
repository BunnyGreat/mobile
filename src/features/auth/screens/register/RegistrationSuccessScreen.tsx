import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenContainer from "../../../../components/common/ScreenContainer";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../../theme";

const RegistrationSuccessScreen: React.FC = () => {
  return (
    <ScreenContainer
      scrollable
      padding="lg"
      style={{ backgroundColor: COLORS.white }}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.centered}>
        <Text style={styles.title}>Registration Success</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZE.h24,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.heading,
  },
});

export default RegistrationSuccessScreen;
