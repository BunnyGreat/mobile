import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { ProfileDocuments } from "../types/profile.types";
import ProfileSection from "./ProfileSection";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const placeholderImage = require("../../../../assets/icons/no-photo.png");

interface IdentificationInformationCardProps {
  documents: ProfileDocuments;
  selfieUrl?: string | null;
}

const IdentificationInformationCard: React.FC<
  IdentificationInformationCardProps
> = ({ documents, selfieUrl }) => {
  const frontIdUri = documents.frontIdUrl;
  const backIdUri = documents.backIdUrl;

  return (
    <ProfileSection
      title="Identification Information"
      subtitle="Uploaded ID and verification images"
    >
      <View style={styles.imageRow}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Front ID</Text>
          <Image
            source={frontIdUri ? { uri: frontIdUri } : placeholderImage}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Back ID</Text>
          <Image
            source={backIdUri ? { uri: backIdUri } : placeholderImage}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
      <View style={styles.imageRow}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageLabel}>Selfie Verification</Text>
          <Image
            source={selfieUrl ? { uri: selfieUrl } : placeholderImage}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
      {!frontIdUri && !backIdUri && !selfieUrl ? (
        <Text style={styles.emptyText}>
          Identification images are not available for this profile.
        </Text>
      ) : null}
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  imageContainer: {
    flex: 1,
  },
  imageLabel: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
    marginBottom: SPACING.xs,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.border,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
  },
});

export default IdentificationInformationCard;
