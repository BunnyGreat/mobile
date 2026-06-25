import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const LogoutButton: React.FC<{
  onPress?: () => void;
  disabled?: boolean;
}> = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabledButton]}
    >
      <Text style={styles.label}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.danger || "#D9534F",
    width: "100%",
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  disabledButton: {
    opacity: 0.65,
  },
  label: {
    color: COLORS.white || "#fff",
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
  },
});

export default LogoutButton;
