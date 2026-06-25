import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const LogoutButton: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={styles.label}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.danger || "#D9534F",
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.white || "#fff",
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
  },
});

export default LogoutButton;
