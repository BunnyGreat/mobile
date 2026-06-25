import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ProfilePersonalInformation } from "../types/profile.types";
import ProfileSection from "./ProfileSection";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface PersonalInformationCardProps {
  personalInformation: ProfilePersonalInformation;
  referenceId?: string;
}

const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  personalInformation,
  referenceId,
}) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    dateOfBirth,
    gender,
    civilStatus,
    contactNumber,
  } = personalInformation;

  const fullName = [firstName, middleName, lastName, suffix]
    .filter(Boolean)
    .join(" ");

  const formatLabel = (value: string | undefined): string => {
    if (!value) {
      return "Not Available";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const rows = [
    { label: "Full Name", value: fullName || "Not Available" },
    { label: "Date of Birth", value: dateOfBirth || "Not Available" },
    { label: "Gender", value: formatLabel(gender) },
    { label: "Civil Status", value: formatLabel(civilStatus) },
    { label: "Contact Number", value: contactNumber || "Not Available" },
  ];

  if (referenceId) {
    rows.splice(1, 0, { label: "Reference ID", value: referenceId });
  }

  return (
    <ProfileSection
      title="Personal Information"
      subtitle="All personal details provided during registration"
    >
      <View style={styles.rowGroup}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  rowGroup: {
    gap: SPACING.md,
  },
  row: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  value: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
  },
});

export default PersonalInformationCard;
