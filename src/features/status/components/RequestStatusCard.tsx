import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING, SHADOWS } from "../../../theme";
import StatusTimeline from "./StatusTimeline";
import { getStatusLabel } from "../utils/statusLabel";
import { getStatusColor } from "../utils/statusColor";
import { formatDateShort } from "../../../utils/dateFormatter";
import type { UnifiedRequest } from "../types/status.types";

interface RequestStatusCardProps {
  request: UnifiedRequest;
}

export const RequestStatusCard: React.FC<RequestStatusCardProps> = ({
  request,
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getStatusColor(request.status);

  // Generate a short reference number from the ID
  const referenceNumber = request.id.slice(-8).toUpperCase();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
        style={styles.touchable}
      >
        {/* Request Type Badge */}
        <View style={styles.typeRow}>
          <View style={styles.typeBadge}>
            <Feather
              name={request.type === "certificate" ? "file-text" : "calendar"}
              size={12}
              color={COLORS.primary}
            />
            <Text style={styles.typeText}>
              {request.type === "certificate" ? "Certificate" : "Appointment"}
            </Text>
          </View>
          <Text style={styles.referenceLabel}>
            Ref: {referenceNumber}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {request.title}
        </Text>

        {/* Status and Date Row */}
        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(request.status)}
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <Feather name="clock" size={12} color={COLORS.placeholder} />
            <Text style={styles.dateText}>
              {formatDateShort(request.createdAt)}
            </Text>
          </View>
        </View>

        {/* Expand Indicator */}
        <View style={styles.expandRow}>
          <Text style={styles.expandText}>
            {expanded ? "Hide Details" : "View Details"}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={COLORS.primary}
          />
        </View>
      </TouchableOpacity>

      {/* Timeline (always rendered but visibility controlled) */}
      <View style={[styles.timelineContainer, !expanded && styles.timelineHidden]}>
        <View style={styles.timelineDivider} />
        <StatusTimeline request={request} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
    overflow: "hidden",
  },
  touchable: {
    padding: SPACING.lg,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  typeText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  referenceLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  dateText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  expandText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  timelineContainer: {
    overflow: "hidden",
  },
  timelineHidden: {
    display: "none",
  },
  timelineDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
});

export default RequestStatusCard;
