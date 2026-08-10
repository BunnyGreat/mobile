import React from "react";
import { View, StyleSheet } from "react-native";
import { AppButton } from "../../../components/ui/AppButton";
import { SPACING } from "../../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../../theme";

interface DigitalIDFlipButtonProps {
  isFlipped: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const DigitalIDFlipButton: React.FC<DigitalIDFlipButtonProps> = ({
  isFlipped,
  onPress,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <AppButton
        label={isFlipped ? "Flip to Front" : "Flip to Back"}
        onPress={onPress}
        variant="secondary"
        size="md"
        disabled={disabled}
        rightIcon={
          <MaterialCommunityIcons
            name="flip-horizontal"
            size={18}
            color={disabled ? COLORS.placeholder : COLORS.white}
          />
        }
        accessibilityLabel={isFlipped ? "Show front of ID" : "Show back of ID"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
});
