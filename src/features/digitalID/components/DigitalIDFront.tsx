import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import type { DigitalIDDisplayData } from "../types/digitalID.types";

const LOGO = require("../../../../assets/images/logo.png");

interface DigitalIDFrontProps {
  data: DigitalIDDisplayData;
  showPlaceholder?: boolean;
}

export const DigitalIDFront: React.FC<DigitalIDFrontProps> = ({
  data,
  showPlaceholder = false,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - SPACING.lg * 2, 350);
  const cardHeight = cardWidth * 0.65;
  const photoSize = cardHeight * 0.4;
  const referenceBoxWidth = Math.min(photoSize * 1, 120);

  const [imageError, setImageError] = React.useState(false);

  const handleImageError = (
    error: NativeSyntheticEvent<ImageErrorEventData>,
  ) => {
    console.warn(
      "[DigitalIDFront] Failed to load profile photo",
      error.nativeEvent,
    );
    setImageError(true);
  };

  if (showPlaceholder) {
    return (
      <View
        style={[styles.container, { width: cardWidth, height: cardHeight }]}
      >
        <View style={styles.skeletonContent} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight,
          borderColor: COLORS.primary,
        },
      ]}
      accessible
      accessibilityLabel="Digital ID Front"
      accessibilityRole="image"
    >
      {/* Compact Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTopText}>REPUBLIC OF THE PHILIPPINES</Text>
        <Text style={styles.headerSubText}>PROVINCE OF RIZAL</Text>
        <Text style={styles.headerSubText}>
          MUNICIPALITY OF {data.municipality.toUpperCase()}
        </Text>
        <Text style={styles.headerSubText}>
          BARANGAY {data.barangay.toUpperCase()}
        </Text>
        <Text style={styles.headerBottomText}>IDENTIFICATION CARD</Text>
      </View>

      {/* Main Content Section */}
      <View style={styles.contentSection}>
        {/* Left side - Photo */}
        <View style={styles.leftSection}>
          {data.profilePhotoUrl && !imageError ? (
            <Image
              source={{ uri: data.profilePhotoUrl }}
              style={[
                styles.profilePhoto,
                { width: photoSize, height: photoSize },
              ]}
              onError={handleImageError}
            />
          ) : (
            <View
              style={[
                styles.profilePlaceholder,
                { width: photoSize, height: photoSize },
              ]}
            >
              <Text style={styles.placeholderText}>Photo</Text>
            </View>
          )}

          {/* ID Reference Number - positioned below photo */}
          <Text
            style={[styles.referenceNumber, { width: referenceBoxWidth }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            ellipsizeMode="tail"
          >
            {data.referenceId}
          </Text>
        </View>

        {/* Right side - Info Boxes with Logo Background */}
        <View style={styles.rightSectionContainer}>
          {/* Logo Background */}
          <View style={styles.logoBackground}>
            <Image source={LOGO} style={styles.logoBackgroundImage} />
          </View>

          {/* Name Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText} numberOfLines={2}>
              {data.fullName}
            </Text>
          </View>

          {/* Residency Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxLabel}>RESIDENCY</Text>
          </View>
        </View>
      </View>

      {/* Yellow Banner */}
      <View style={styles.yellowBanner}>
        <Text style={[styles.bannerText, styles.bannerTextOutline]}>
          ALAGANG KUYA TOM
        </Text>
        <Text style={styles.bannerText}>ALAGANG KUYA TOM</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.md,
    borderWidth: 3,
    padding: SPACING.md,
    justifyContent: "space-between",
    aspectRatio: 85 / 55,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  skeletonContent: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: SPACING.sm,
  },
  headerSection: {
    alignItems: "center",
    paddingBottom: SPACING.sm,
  },
  headerTopText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h10,
    letterSpacing: 1,
    textAlign: "center",
  },
  headerSubText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.h10,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerBottomText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h10,
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 2,
  },
  contentSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    gap: SPACING.md,
  },
  leftSection: {
    alignItems: "center",
    gap: SPACING.xs,
    flex: 0.35,
    justifyContent: "flex-start",
    paddingTop: 0,
  },
  profilePhoto: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  profilePlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.h10,
  },
  referenceNumber: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    lineHeight: FONT_SIZE.body12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
    textAlign: "center",
    marginTop: SPACING.xs,
    alignSelf: "center",
  },
  rightSectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    gap: SPACING.xs,
    position: "relative",
  },
  logoBackground: {
    position: "absolute",
    top: "42%",
    left: "52%",
    transform: [{ translateX: -60 }, { translateY: -75 }],
    zIndex: 0,
    opacity: 100,
  },
  logoBackgroundImage: {
    width: 96,
    height: 96,
    resizeMode: "contain",
  },
  infoBox: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    maxHeight: 110,
  },
  infoBoxLabel: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h14,
    letterSpacing: 0.9,
  },
  infoBoxText: {
    color: COLORS.heading,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h14,
    lineHeight: FONT_SIZE.h14,
  },
  yellowBanner: {
    backgroundColor: "#FFD700",
    paddingVertical: SPACING.sm,
    borderRadius: 4,
    alignItems: "center",
    marginTop: SPACING.sm,
    justifyContent: "center",
  },
  bannerText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h14,
    letterSpacing: 2,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2.5, height: 0 },
    textShadowRadius: 1,
  },
  bannerTextOutline: {
    position: "absolute",
    left: 0,
    right: 0,
    color: COLORS.white,
    textAlign: "center",
    textShadowColor: COLORS.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
});
