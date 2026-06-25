import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { ProfileCardProps } from "../types/settings.types";
import { SPACING, FONT_FAMILY, FONT_SIZE, COLORS } from "../../../theme";

const ProfileCard: React.FC<ProfileCardProps> = ({
  profilePhotoUrl,
  fullName = "Juan Dela Cruz",
  referenceId = "REF-2026-00001",
  status = "Verified Resident",
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.row}>
        {profilePhotoUrl ? (
          <Image source={{ uri: profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>JD</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.ref}>{referenceId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.placeholder,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.placeholder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
  info: {
    marginLeft: SPACING.md,
  },
  name: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
  },
  ref: {
    color: COLORS.placeholder,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(22,163,74,0.12)",
    alignSelf: "flex-start",
  },
  statusText: {
    color: COLORS.success || "#0B8043",
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
  },
});

export default ProfileCard;
