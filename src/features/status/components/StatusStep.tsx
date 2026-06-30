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
  let circleColor: string;
  let textColor: string;
  let bgColor: string;

  if (stepStatus === "completed") {
    circleColor = COLORS.success;
    textColor = COLORS.heading;
    bgColor = COLORS.success + "10";
  } else if (stepStatus === "current") {
    // Current step: rejected shows as red, others show as green
    circleColor = status === "rejected" ? COLORS.danger : COLORS.success;
    textColor = COLORS.heading;
    bgColor = circleColor + "10";
  } else {
    circleColor = COLORS.border;
    textColor = COLORS.placeholder;
    bgColor = COLORS.border;
  }

  const iconName = getStatusIcon(status) as any;

  return (
    <View style={styles.container}>
      {/* Timeline Line - Top */}
      {!isLast && (
        <View style={styles.lineTopContainer}>
          <View
            style={[
              styles.lineTop,
              {
                backgroundColor:
                  stepStatus === "completed"
                    ? COLORS.success
                    : stepStatus === "current" && status === "rejected"
                      ? COLORS.danger
                      : COLORS.border,
              },
            ]}
          />
        </View>
      )}

      {/* Indicator Dot and Line */}
      <View style={styles.indicatorContainer}>
        <View style={[styles.indicatorDot, { backgroundColor: bgColor }]}>
          <View
            style={[
              styles.circle,
              {
                backgroundColor: circleColor,
                borderColor:
                  stepStatus === "future" ? COLORS.border : circleColor,
              },
            ]}
          >
            {stepStatus === "completed" ? (
              <Feather name="check" size={12} color={COLORS.white} />
            ) : (
              <Feather name={iconName} size={12} color={COLORS.white} />
            )}
          </View>
        </View>

        {/* Timeline Line - Bottom (only if not last) */}
        {!isLast && (
          <View style={styles.lineBottomContainer}>
            <View
              style={[
                styles.lineBottom,
                {
                  backgroundColor:
                    stepStatus === "completed"
                      ? COLORS.success
                      : stepStatus === "current" && status === "rejected"
                        ? COLORS.danger
                        : COLORS.border,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Step Content */}
      <View style={styles.contentContainer}>
        <Text style={[styles.label, { color: textColor }]}>
          {getStatusLabel(status)}
        </Text>
        {stepStatus === "current" && (
          <Text style={styles.currentBadge}>In Progress</Text>
        )}
        {stepStatus === "completed" && (
          <View style={styles.completedCheck}>
            <Feather name="check-circle" size={12} color={COLORS.success} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  lineTopContainer: {
    position: "absolute",
    top: -SPACING.lg,
    left: 21,
    width: 2,
    height: SPACING.lg,
  },
  lineTop: {
    width: 2,
    height: "100%",
  },
  indicatorContainer: {
    alignItems: "center",
  },
  indicatorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  lineBottomContainer: {
    width: 2,
    height: SPACING.lg,
    marginTop: SPACING.xs,
  },
  lineBottom: {
    width: 2,
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
  },
  currentBadge: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  completedCheck: {
    marginLeft: SPACING.sm,
  },
});

export default StatusStep;
