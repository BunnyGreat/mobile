import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { getStatusIcon } from "../utils/statusIcon";
import { getStatusLabel } from "../utils/statusLabel";
import { getStatusColor } from "../utils/statusColor";
import type { RequestStatus } from "../types/status.types";

interface StatusStepProps {
  status: RequestStatus;
  stepStatus: "completed" | "current" | "future";
  isLast?: boolean;
}

export const StatusStep: React.FC<StatusStepProps> = ({
  status,
  stepStatus,
  isLast,
}) => {
  let circleColor: string = COLORS.placeholder;
  let textColor: string = COLORS.placeholder;

  if (stepStatus === "completed") {
    circleColor = COLORS.success;
    textColor = COLORS.heading;
  } else if (stepStatus === "current") {
    circleColor = getStatusColor(status);
    textColor = COLORS.heading;
  } else {
    circleColor = "#E2E8F0";
    textColor = COLORS.placeholder;
  }

  const iconName = getStatusIcon(status) as any;

  return (
    <View style={styles.container}>
      <View style={[styles.circleContainer, { backgroundColor: circleColor }]}>
        <Feather name={iconName} size={20} color={COLORS.white} />
      </View>

      <Text style={[styles.label, { color: textColor }]}>
        {getStatusLabel(status)}
      </Text>

      {!isLast && (
        <View
          style={[
            styles.connector,
            {
              backgroundColor:
                stepStatus === "completed" ? COLORS.success : "#E2E8F0",
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  circleContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    textAlign: "center",
    marginBottom: SPACING.md,
    maxWidth: 60,
  },
  connector: {
    width: 2,
    height: 40,
    marginBottom: SPACING.sm,
  },
});

export default StatusStep;
