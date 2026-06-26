import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ProfilePersonalInformation } from "../types/profile.types";
import ProfileSection from "./ProfileSection";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface PersonalInformationCardProps {
  personalInformation: ProfilePersonalInformation;
  referenceId?: string;
}

interface InfoTileProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

const InfoTile: React.FC<InfoTileProps> = ({
  icon,
  label,
  value,
  iconColor = COLORS.primary,
}) => (
  <View style={styles.tile}>
    <View style={styles.tileIconContainer}>
      <Feather name={icon as any} size={22} color={iconColor} />
    </View>
    <View style={styles.tileContent}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

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

  const middleInitial = middleName
    ? `${middleName.trim().charAt(0).toUpperCase()}.`
    : null;
  const fullName = [firstName, middleInitial, lastName, suffix]
    .filter(Boolean)
    .join(" ");

  const formatLabel = (value: string | undefined): string => {
    if (!value) {
      return "Not Available";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const infoItems = [
    {
      icon: "user",
      label: "Full Name",
      value: fullName || "Not Available",
      color: "#4F46E5",
    },
    {
      icon: "hash",
      label: "Reference ID",
      value: referenceId || "",
      color: "#7C3AED",
    },
    {
      icon: "calendar",
      label: "Date of Birth",
      value: dateOfBirth || "Not Available",
      color: "#DC2626",
    },
    {
      icon: "heart",
      label: "Gender",
      value: formatLabel(gender),
      color: "#DB2777",
    },
    {
      icon: "bookmark",
      label: "Civil Status",
      value: formatLabel(civilStatus),
      color: "#059669",
    },
    {
      icon: "phone",
      label: "Contact",
      value: contactNumber || "Not Available",
      color: "#0891B2",
    },
  ].filter((item) => item.value !== "");

  // Split into two columns for grid layout
  const leftColumn = infoItems.filter((_, i) => i % 2 === 0);
  const rightColumn = infoItems.filter((_, i) => i % 2 === 1);

  return (
    <ProfileSection
      title="Personal Information"
      subtitle="Your registered details"
    >
      <View style={styles.container}>
        {/* Grid Layout */}
        <View style={styles.gridContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumn.map((item) => (
              <View key={item.label} style={styles.gridItem}>
                <View
                  style={[
                    styles.tileIconContainer,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.tileValue} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumn.map((item) => (
              <View key={item.label} style={styles.gridItem}>
                <View
                  style={[
                    styles.tileIconContainer,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.tileValue} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  gridContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  column: {
    flex: 1,
    gap: SPACING.md,
  },
  gridItem: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    padding: SPACING.md,
    minHeight: 100,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  tileContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  tileLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tileValue: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    lineHeight: 20,
  },
});

export default PersonalInformationCard;
