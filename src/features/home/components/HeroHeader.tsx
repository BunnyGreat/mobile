import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLoginStore } from "../../auth/screens/login/store/login.store";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

const logo = require("../../../../assets/images/logo.png");
const profilePlaceholder = require("../../../../assets/icons/no-photo.png");
const verifiedIcon = require("../../../../assets/icons/fiesta-check.png");

const HeroHeader: React.FC = () => {
  const user = useLoginStore((s) => s.user);

  const firstName = user?.personalInformation?.firstName ?? "";
  const middleName = user?.personalInformation?.middleName ?? "";
  const lastName = user?.personalInformation?.lastName ?? "";
  const profilePhotoUrl = user?.profilePhotoUrl;

  const fullName = [
    firstName,
    middleName ? `${middleName.charAt(0)}.` : null,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const statusText = user?.status === "approved" ? "VERIFIED RESIDENT" : "";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{fullName || "Resident"}</Text>
          {statusText ? (
            <View style={styles.statusContainer}>
              <Image
                source={verifiedIcon}
                style={styles.verifiedIcon}
                resizeMode="contain"
              />
              <Text style={styles.verified}>{statusText}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.avatarWrapper}>
        <Image
          source={
            profilePhotoUrl ? { uri: profilePhotoUrl } : profilePlaceholder
          }
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  left: { flexDirection: "row", alignItems: "center" },
  logo: { width: 48, height: 48, borderRadius: 8, marginRight: SPACING.md },
  titleWrap: { flexDirection: "column" },
  name: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.h18,
    color: COLORS.heading,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  verifiedIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  verified: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body12,
    color: COLORS.darkSuccess,
  },
  avatarWrapper: {
    width: 35,
    height: 35,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.border,
  },
  avatar: { width: "100%", height: "100%" },
});

export default HeroHeader;
