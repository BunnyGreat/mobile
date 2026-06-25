import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ProfileResidenceInformation } from "../types/profile.types";
import ProfileSection from "./ProfileSection";
import ResidenceInfoItem from "./ResidenceInfoItem";
import { COLORS, SPACING } from "../../../theme";

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
        <ResidenceInfoItem
          icon={<Feather name="map-pin" size={20} color={COLORS.primary} />}
          label="Home Address"
          value={addressValue || "Not Available"}
        />
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
});

export default ResidenceInformationCard;
