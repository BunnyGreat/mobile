import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const placeholderImage = require("../../../../assets/icons/no-photo.png");
const verifiedIcon = require("../../../../assets/icons/fiesta-check.png");

interface ProfileCardProps {
  fullName: string;
  residentStatus: string;
  profilePhotoUrl?: string | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  fullName,
  residentStatus,
  profilePhotoUrl,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.heroContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Feather name="chevron-left" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            // placeholder for future profile settings
          }}
          activeOpacity={0.75}
        >
          <Feather name="settings" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileBody}>
        <View style={styles.avatarBorder}>
          <Image
            source={
              profilePhotoUrl ? { uri: profilePhotoUrl } : placeholderImage
            }
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.statusBadge}>
          <Image source={verifiedIcon} style={styles.statusIcon} />
          <Text style={styles.statusText}>{residentStatus}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: "100%",
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.white,
  },
  profileBody: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  avatarBorder: {
    width: 148,
    height: 148,
    borderRadius: 96,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  name: {
    marginTop: SPACING.sm,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h24,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 32,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    backgroundColor: COLORS.success,
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.white,
  },
});

export default ProfileCard;
