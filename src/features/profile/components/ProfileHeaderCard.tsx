import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const placeholderImage = require("../../../../assets/icons/no-photo.png");
const verifiedIcon = require("../../../../assets/icons/fiesta-check.png");

interface Props {
  fullName: string;
  residentStatus: string;
  profilePhotoUrl?: string | null;
}

const ProfileHeaderCard: React.FC<Props> = ({
  fullName,
  residentStatus,
  profilePhotoUrl,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color={COLORS.heading} />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            /* TODO: open settings */
          }}
          activeOpacity={0.7}
        >
          <Feather name="settings" size={18} color={COLORS.heading} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <Image
            source={
              profilePhotoUrl ? { uri: profilePhotoUrl } : placeholderImage
            }
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        <Text numberOfLines={1} style={styles.name}>
          {fullName}
        </Text>

        <View style={styles.statusBadge}>
          <Image source={verifiedIcon} style={styles.statusIcon} />
          <Text style={styles.statusText}>{residentStatus}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: COLORS.background || COLORS.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    // target compact height; content will fit within 220-280
    minHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
  },
  content: {
    alignItems: "center",
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    borderWidth: 2,
    borderColor: COLORS.background || "#fff",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  name: {
    marginTop: 8,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h20,
    color: COLORS.heading,
    textAlign: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.success,
  },
  statusIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  statusText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12 || 12,
    color: COLORS.white,
  },
});

export default ProfileHeaderCard;
