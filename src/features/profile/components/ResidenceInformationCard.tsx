import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ProfileResidenceInformation } from "../types/profile.types";
import ProfileSection from "./ProfileSection";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface ResidenceInformationCardProps {
  residenceInformation: ProfileResidenceInformation;
}

const ResidenceInformationCard: React.FC<ResidenceInformationCardProps> = ({
  residenceInformation,
}) => {
  const { houseNumber, street, purok, barangay, municipality, province } =
    residenceInformation;

  const addressValue = [
    houseNumber,
    street,
    purok,
    barangay,
    municipality,
    province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ProfileSection
      title="Residence Information"
      subtitle="Your registered home address"
    >
      <View style={styles.container}>
        {/* Icon and Label Header */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Feather name="map-pin" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.labelBadge}>
            <Text style={styles.labelText}>Home Address</Text>
          </View>
        </View>

        {/* Address Value */}
        <View style={styles.addressCard}>
          <Text style={styles.addressText}>
            {addressValue || "Not Available"}
          </Text>
        </View>
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "12",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  labelBadge: {
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  labelText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressCard: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginLeft: SPACING.xxl + SPACING.md,
  },
  addressText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
    lineHeight: 24,
  },
});

export default ResidenceInformationCard;
