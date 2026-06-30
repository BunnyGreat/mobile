import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
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

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.content}>
            <Text style={styles.title}>{request.title}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(request.status)}
                </Text>
              </View>
              <Text style={styles.date}>
                {formatDateShort(request.createdAt)}
              </Text>
            </View>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.primary}
          />
        </View>
      </TouchableOpacity>

      {expanded && <StatusTimeline request={request} />}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
  },
  date: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
});

export default RequestStatusCard;
