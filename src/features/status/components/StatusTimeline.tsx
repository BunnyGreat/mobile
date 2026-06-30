import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../theme";
import StatusStep from "./StatusStep";
import { getTimelineForRequest, getStepStatus } from "../utils/statusTimeline";
import type {
  UnifiedRequest,
  RequestStatus,
  StatusTimelineItem,
} from "../types/status.types";

interface StatusTimelineProps {
  request: UnifiedRequest;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ request }) => {
  const timeline = getTimelineForRequest(request.type, request.status);
  const currentStepIndex = timeline.findIndex(
    (step) => getStepStatus(step, request.status, timeline) === "current",
  );

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        {timeline.map((step: StatusTimelineItem, index) => {
          const stepStatus = getStepStatus(step, request.status, timeline);
          const isLast = index === timeline.length - 1;
          const stepNumber = index + 1;

          return (
            <View key={`${step.status}-${index}`} style={styles.stepContainer}>
              <StatusStep
                status={step.status}
                title={step.title}
                description={step.description}
                stepStatus={stepStatus}
                isLast={isLast}
                stepNumber={stepNumber}
              />
            </View>
          );
        })}
      </View>

      {/* Progress Summary */}
      <View style={styles.progressSummary}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    ((currentStepIndex + 1) / timeline.length) * 100,
                  ),
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStepIndex >= 0 ? currentStepIndex + 1 : 0} of{" "}
          {timeline.length} steps completed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  timeline: {
    flexDirection: "column",
  },
  stepContainer: {
    flexDirection: "row",
    minHeight: 60,
    flex: 1,
    alignItems: "flex-start",
  },
  progressSummary: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: "PlusJakartaSansRegular",
    fontSize: 12,
    color: COLORS.placeholder,
    textAlign: "center",
  },
});

export default StatusTimeline;
