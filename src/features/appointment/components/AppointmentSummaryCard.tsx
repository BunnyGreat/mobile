import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING, SHADOWS } from "../../../theme";
import { SectionCard } from "../../../components/ui";
import { formatAppointmentDate } from "../utils/formatAppointment";

interface AppointmentSummaryCardProps {
  fullName: string;
  purpose: string;
  appointmentDate: string;
  appointmentTime: string;
  concern: string;
  supportingDocumentName: string | null;
}

interface SummaryRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isCompleted?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  icon,
  label,
  value,
  isCompleted = true,
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconContainer, !isCompleted && styles.iconContainerPending]}>
        <Feather
          name={icon}
          size={16}
          color={isCompleted ? COLORS.primary : COLORS.placeholder}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, !isCompleted && styles.valuePending]} numberOfLines={2}>
      {value || "Not set"}
    </Text>
  </View>
);

const AppointmentSummaryCard: React.FC<AppointmentSummaryCardProps> = ({
  fullName,
  purpose,
  appointmentDate,
  appointmentTime,
  concern,
  supportingDocumentName,
}) => {
  const hasAllDetails = purpose && appointmentDate && appointmentTime && supportingDocumentName;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="clipboard" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Appointment Summary</Text>
          <Text style={styles.subtitle}>
            {hasAllDetails
              ? "Review your booking details"
              : "Complete all steps to see summary"}
          </Text>
        </View>
        {hasAllDetails && (
          <View style={styles.checkBadge}>
            <Feather name="check" size={14} color={COLORS.white} />
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Summary Rows */}
      <View style={styles.content}>
        <SummaryRow
          icon="user"
          label="Resident"
          value={fullName}
          isCompleted={Boolean(fullName)}
        />
        <SummaryRow
          icon="tag"
          label="Purpose"
          value={purpose}
          isCompleted={Boolean(purpose)}
        />
        <SummaryRow
          icon="calendar"
          label="Date"
          value={formatAppointmentDate(appointmentDate)}
          isCompleted={Boolean(appointmentDate)}
        />
        <SummaryRow
          icon="clock"
          label="Time"
          value={appointmentTime}
          isCompleted={Boolean(appointmentTime)}
        />
        <SummaryRow
          icon="file-text"
          label="Document"
          value={supportingDocumentName || "None"}
          isCompleted={Boolean(supportingDocumentName)}
        />
        {concern ? (
          <View style={styles.concernRow}>
            <View style={styles.concernContainer}>
              <Feather name="message-square" size={16} color={COLORS.paragraph} />
              <Text style={styles.concernLabel}>Concern:</Text>
            </View>
            <Text style={styles.concernValue} numberOfLines={3}>
              {concern}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Status Badge */}
      {!hasAllDetails && (
        <View style={styles.incompleteBadge}>
          <Feather name="alert-circle" size={14} color={COLORS.warning} />
          <Text style={styles.incompleteText}>
            Please complete all required fields
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h16,
    color: COLORS.heading,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  content: {
    gap: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  iconContainerPending: {
    backgroundColor: COLORS.inputBackground,
  },
  label: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
  value: {
    flex: 1,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    textAlign: "right",
    marginLeft: SPACING.sm,
  },
  valuePending: {
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.regular,
  },
  concernRow: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
  },
  concernContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  concernLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    marginLeft: SPACING.xs,
  },
  concernValue: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.heading,
    lineHeight: 18,
  },
  incompleteBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 10,
  },
  incompleteText: {
    marginLeft: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.warning,
  },
});

export default AppointmentSummaryCard;
