import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const LogoutButton: React.FC<{
  onPress?: () => void;
  disabled?: boolean;
}> = ({ onPress, disabled = false }) => {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={styles.button}
      >
        {disabled ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : (
          <>
            <View style={styles.iconWrapper}>
              <Feather name="log-out" size={18} color={COLORS.danger} />
            </View>
            <Text style={styles.label}>Logout</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.copyright}>
        © 2026 Barangay San Isidro, Rodriguez, Rizal
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${COLORS.danger}40`,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.danger}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  label: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.danger,
  },
  copyright: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    textAlign: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});

export default LogoutButton;
