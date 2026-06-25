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
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.placeholder,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body16,
    color: COLORS.heading,
  },
  ref: {
    color: "rgba(0,0,0,0.6)",
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(22,163,74,0.08)",
    alignSelf: "flex-start",
  },
  statusText: {
    color: COLORS.success || "#0B8043",
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
  },
});

export default ProfileCard;
