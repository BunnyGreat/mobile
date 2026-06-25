import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { ProfileCardProps } from "../types/settings.types";
import { SPACING, FONT_FAMILY, FONT_SIZE, COLORS } from "../../../theme";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  profilePhotoUrl,
  fullName,
  referenceId,
  status,
  onPress,
}) => {
  const displayName = fullName?.trim() || "Resident";
  const initials = getInitials(displayName) || "RD";

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
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{displayName}</Text>
          {referenceId ? <Text style={styles.ref}>{referenceId}</Text> : null}
          {status ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: SPACING.lg,
    borderRadius: 16,
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
