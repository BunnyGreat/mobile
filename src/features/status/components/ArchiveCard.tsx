import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import type { UnifiedRequest } from "../types/status.types";

interface ArchiveCardProps {
  request: UnifiedRequest;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({ request }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{request.title}</Text>
      <Text style={styles.meta}>
        {request.type === "appointment" ? "Appointment" : "Certificate"} •{" "}
        {request.status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  title: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  meta: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginTop: 2,
  },
});

export default ArchiveCard;
