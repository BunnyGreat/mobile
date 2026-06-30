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
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.typeIconContainer}>
            <Feather
              name={request.type === "certificate" ? "file-text" : "calendar"}
              size={18}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.requestType}>
              {request.type === "certificate" ? "Certificate Request" : "Appointment Request"}
            </Text>
            <Text style={styles.referenceNumber}>#{referenceNumber}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor + "15" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(request.status)}
          </Text>
        </View>
      </View>

      {/* Card Body */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.cardBody}
      >
        <Text style={styles.title} numberOfLines={2}>
          {request.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={14} color={COLORS.placeholder} />
            <Text style={styles.metaText}>
              {formatDateShort(request.createdAt)}
            </Text>
          </View>
          <View style={styles.expandIndicator}>
            <Text style={styles.expandText}>
              {expanded ? "Hide" : "Details"}
            </Text>
            <Feather
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={COLORS.primary}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Timeline Section */}
      {expanded && (
        <View style={styles.timelineSection}>
          <View style={styles.timelineDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>TRACKING PROGRESS</Text>
            <View style={styles.dividerLine} />
          </View>
          <StatusTimeline request={request} />
        </View>
      )}
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "12",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    gap: 2,
  },
  requestType: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  referenceNumber: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  statusPill: {
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
  cardBody: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  metaText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
  },
  expandIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  expandText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
  },
  timelineSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timelineDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    letterSpacing: 0.5,
  },
});

export default RequestStatusCard;
