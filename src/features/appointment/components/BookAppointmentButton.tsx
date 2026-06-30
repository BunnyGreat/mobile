import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING, SHADOWS } from "../../../theme";

interface BookAppointmentButtonProps {
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const BookAppointmentButton: React.FC<BookAppointmentButtonProps> = ({
  loading,
  disabled = false,
  onPress,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.white} size="small" />
          <Text style={styles.loadingText}>Booking...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="calendar" size={22} color={COLORS.white} />
          </View>
          <Text style={styles.label}>Book Appointment</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    backgroundColor: COLORS.placeholder,
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  label: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.white,
  },
});

export default BookAppointmentButton;
