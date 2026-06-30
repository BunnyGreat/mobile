import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { getStatusIcon } from "../utils/statusIcon";
import type { RequestStatus } from "../types/status.types";

interface StatusStepProps {
  status: RequestStatus;
  title: string;
  description: string;
  stepStatus: "completed" | "current" | "future";
  isLast?: boolean;
  stepNumber?: number;
}

export const StatusStep: React.FC<StatusStepProps> = ({
  status,
  title,
  description,
  stepStatus,
  isLast,
  stepNumber = 1,
}) => {
  let indicatorColor: string;
  let textColor: string;
  let descriptionColor: string;
  let lineColor: string;
  let bgColor: string;
  let showPulse: boolean = false;

  if (stepStatus === "completed") {
    indicatorColor = COLORS.success;
    textColor = COLORS.heading;
    descriptionColor = COLORS.paragraph;
    lineColor = COLORS.success;
    bgColor = COLORS.success + "10";
  } else if (stepStatus === "current") {
    indicatorColor = status === "rejected" ? COLORS.danger : COLORS.success;
    textColor = COLORS.heading;
    descriptionColor = COLORS.paragraph;
    lineColor = COLORS.border;
    bgColor = indicatorColor + "10";
    showPulse = true;
  } else {
    indicatorColor = COLORS.border;
    textColor = COLORS.placeholder;
    descriptionColor = COLORS.placeholder;
    lineColor = COLORS.border;
    bgColor = COLORS.border;
  }

  const iconName = getStatusIcon(status) as any;

  return (
    <View style={styles.container}>
      {/* Timeline Line - Top */}
      {!isLast && (
        <View style={styles.lineTopContainer}>
          <View style={[styles.lineTop, { backgroundColor: lineColor }]} />
        </View>
      )}

      {/* Indicator Column */}
      <View style={styles.indicatorColumn}>
        {/* Outer ring for current step */}
        {showPulse && (
          <View
            style={[styles.pulseRing, { borderColor: indicatorColor + "30" }]}
          />
        )}

        {/* Main indicator */}
        <View style={[styles.indicatorDot, { backgroundColor: bgColor }]}>
          <View
            style={[
              styles.circle,
              {
                backgroundColor: indicatorColor,
                borderColor:
                  stepStatus === "future" ? COLORS.border : indicatorColor,
              },
            ]}
          >
            {stepStatus === "completed" ? (
              <Feather
                name="check"
                size={14}
                color={COLORS.white}
                weight="bold"
              />
            ) : (
              <Feather name={iconName} size={14} color={COLORS.white} />
            )}
          </View>
        </View>

        {/* Timeline Line - Bottom */}
        {!isLast && (
          <View style={styles.lineBottomContainer}>
            <View style={[styles.lineBottom, { backgroundColor: lineColor }]} />
          </View>
        )}
      </View>

      {/* Content Column */}
      <View style={styles.contentColumn}>
        <View style={styles.contentHeader}>
          <Text style={[styles.stepTitle, { color: textColor }]}>{title}</Text>
          {stepStatus === "current" && (
            <View
              style={[
                styles.currentBadge,
                { backgroundColor: indicatorColor + "15" },
              ]}
            >
              <Text
                style={[styles.currentBadgeText, { color: indicatorColor }]}
              >
                Current
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: descriptionColor }]}>
          {" "}
          {description}
        </Text>
        {stepStatus === "completed" && (
          <View style={styles.completedInfo}>
            <Feather name="check-circle" size={12} color={COLORS.success} />
            <Text style={styles.completedText}>Completed</Text>
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
    width: "100%",
  },
  lineTopContainer: {
    position: "absolute",
    top: -SPACING.lg,
    left: 19,
    width: 2,
    height: SPACING.lg,
    zIndex: 1,
  },
  lineTop: {
    width: 2,
    height: "100%",
  },
  indicatorColumn: {
    alignItems: "center",
    zIndex: 2,
  },
  pulseRing: {
    position: "absolute",
    top: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  indicatorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
  contentColumn: {
    flex: 1,
    flexGrow: 1,
    minWidth: 0,
    alignSelf: "stretch",
    marginLeft: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  stepTitle: {
    flexShrink: 1,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    marginRight: SPACING.sm,
    maxWidth: "100%",
  },
  currentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    flexShrink: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    lineHeight: 18,
    marginTop: SPACING.xs,
    minHeight: 40,
  },
  completedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  completedText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.success,
  },
});

export default StatusStep;
