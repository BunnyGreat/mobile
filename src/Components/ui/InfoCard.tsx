import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

interface InfoCardProps {
  message: string;
  type?: "info" | "warning" | "success" | "error";
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

const getTypeStyles = (type: InfoCardProps["type"]) => {
  switch (type) {
    case "warning":
      return {
        backgroundColor: "#FEF3C7",
        iconColor: "#F59E0B",
        textColor: "#92400E",
      };
    case "success":
      return {
        backgroundColor: "#D1FAE5",
        iconColor: "#10B981",
        textColor: "#065F46",
      };
    case "error":
      return {
        backgroundColor: "#FEE2E2",
        iconColor: "#EF4444",
        textColor: "#991B1B",
      };
    default:
      return {
        backgroundColor: "#E0F2FE",
        iconColor: "#0EA5E9",
        textColor: "#0369A1",
      };
  }
};

export const InfoCard: React.FC<InfoCardProps> = ({
  message,
  type = "info",
  icon = "info",
  style,
}) => {
  const typeStyles = getTypeStyles(type);

  return (
    <View style={[styles.container, { backgroundColor: typeStyles.backgroundColor }, style]}>
      <Feather name={icon} size={18} color={typeStyles.iconColor} style={styles.icon} />
      <Text style={[styles.message, { color: typeStyles.textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    lineHeight: 20,
  },
});

export default InfoCard;
