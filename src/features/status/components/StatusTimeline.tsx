import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../theme";
import StatusStep from "./StatusStep";
import { getTimelineForRequest, getStepStatus } from "../utils/statusTimeline";
import type { UnifiedRequest, RequestStatus } from "../types/status.types";

interface StatusTimelineProps {
  request: UnifiedRequest;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ request }) => {
  const timeline = getTimelineForRequest(request.type, request.status);

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        {timeline.map((step, index) => {
          const stepStatus = getStepStatus(step, request.status, timeline);
          const isLast = index === timeline.length - 1;

          return (
            <View key={step} style={styles.stepContainer}>
              <StatusStep
                status={step as RequestStatus}
                stepStatus={stepStatus}
                isLast={isLast}
              />
            </View>
          );
        })}
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
    minHeight: 56,
  },
});

export default StatusTimeline;
