import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ProfileDocuments } from "../types/profile.types";
import ProfileSection from "./ProfileSection";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";


interface IdentificationInformationCardProps {
  documents: ProfileDocuments;
  selfieUrl?: string | null;
}

interface ImageItemProps {
  label: string;
  icon: string;
  iconColor: string;
  uri: string | null;
}

const ImageItem: React.FC<ImageItemProps> = ({ label, icon, iconColor, uri }) => (
  <View style={styles.imageItem}>
    <View style={styles.imageHeader}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.imageLabel}>{label}</Text>
    </View>
    <View style={styles.imageFrame}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholderContainer}>
          <Feather name="image" size={32} color={COLORS.placeholder} />
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
    </View>
  </View>
);

const IdentificationInformationCard: React.FC<IdentificationInformationCardProps> = ({
  documents,
  selfieUrl,
}) => {
  const frontIdUri = documents.frontIdUrl;
  const backIdUri = documents.backIdUrl;
  const hasImages = frontIdUri || backIdUri || selfieUrl;

  return (
    <ProfileSection
      title="Identification"
      subtitle="Verified documents"
    >
      <View style={styles.container}>
        {/* ID Cards Side by Side */}
        <View style={styles.idRow}>
          <ImageItem
            label="Front ID"
            icon="credit-card"
            iconColor="#4F46E5"
            uri={frontIdUri ?? null}
          />
          <ImageItem
            label="Back ID"
            icon="credit-card"
            iconColor="#7C3AED"
            uri={backIdUri ?? null}
          />
        </View>

        {/* Selfie Verification */}
        <View style={styles.selfieContainer}>
          <ImageItem
            label="Selfie Verification"
            icon="camera"
            iconColor="#059669"
            uri={selfieUrl ?? null}
          />
        </View>

        {!hasImages && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="file" size={32} color={COLORS.placeholder} />
            </View>
            <Text style={styles.emptyText}>
              No identification documents have been uploaded yet.
            </Text>
          </View>
        )}
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  idRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  selfieContainer: {
    marginTop: 0,
  },
  imageItem: {
    flex: 1,
  },
  imageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  imageLabel: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
  },
  imageFrame: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.inputBackground,
    aspectRatio: 1.5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
  },
  placeholderText: {
    marginTop: SPACING.sm,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.paragraph,
    textAlign: "center",
    paddingHorizontal: SPACING.lg,
  },
});

export default IdentificationInformationCard;
