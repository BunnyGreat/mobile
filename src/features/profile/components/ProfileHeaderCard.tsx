import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import type { RootStackNavigationProp } from "../../../navigation/types";

const placeholderImage = require("../../../../assets/icons/no-photo.png");
const verifiedIcon = require("../../../../assets/icons/fiesta-check.png");

interface Props {
  fullName: string;
  email: string;
  residentStatus: string;
  profilePhotoUrl?: string | null;
}

const ProfileHeaderCard: React.FC<Props> = ({
  fullName,
  email,
  residentStatus,
  profilePhotoUrl,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.primary, "#0D47A1", "#1565C0"] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* Ambient Circles */}
        <View style={styles.ambientCircle1} />
        <View style={styles.ambientCircle2} />
        <View style={styles.ambientCircle3} />
      </LinearGradient>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.7}
        >
          <Feather name="edit-3" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Profile Hero Section */}
      <View style={styles.heroSection}>
        {/* Avatar Container */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Image
                source={
                  profilePhotoUrl ? { uri: profilePhotoUrl } : placeholderImage
                }
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          </View>
          {/* Online Indicator */}
          <View style={styles.onlineIndicator}>
            <Feather name="check" size={10} color={COLORS.white} />
          </View>
        </View>

        {/* Name */}
        <Text style={styles.profileName} numberOfLines={1}>
          {fullName}
        </Text>

        {/* Email */}
        <Text style={styles.profileEmail} numberOfLines={1}>
          {email}
        </Text>

        {/* Status Badge - Visible with solid color */}
        <View style={styles.statusBadge}>
          <Image source={verifiedIcon} style={styles.statusIcon} />
          <Text style={styles.statusText}>{residentStatus}</Text>
        </View>
      </View>

      {/* Bottom Curve */}
      <View style={styles.bottomCurve}>
        <View style={styles.curveWhite} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 390,
    position: "relative",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 390,
  },
  // Ambient decorative circles
  ambientCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ambientCircle2: {
    position: "absolute",
    bottom: 40,
    left: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  ambientCircle3: {
    position: "absolute",
    top: 100,
    left: "60%",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  // Header bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  // Hero section
  heroSection: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.xs,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileEmail: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: SPACING.sm,
    opacity: 0.85,
  },
  // Status Badge - Solid green background for visibility
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.success,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: SPACING.sm,
    tintColor: COLORS.white,
  },
  statusText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.white,
  },
  // Bottom curve
  bottomCurve: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 10,
  },
  curveWhite: {
    width: "100%",
    height: 20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default ProfileHeaderCard;
