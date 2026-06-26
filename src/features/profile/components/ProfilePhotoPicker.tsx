import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";

interface ProfilePhotoPickerProps {
  photoUrl?: string | null;
  onPickPhoto: () => void;
}

const placeholderImage = require("../../../../assets/icons/no-photo.png");

const ProfilePhotoPicker: React.FC<ProfilePhotoPickerProps> = ({
  photoUrl,
  onPickPhoto,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={onPickPhoto}
        activeOpacity={0.85}
      >
        <View style={styles.avatarRing}>
          <Image
            source={photoUrl ? { uri: photoUrl } : placeholderImage}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        {/* Camera Button Overlay */}
        <View style={styles.cameraButton}>
          <Feather name="camera" size={16} color={COLORS.white} />
        </View>
      </TouchableOpacity>

      {/* Hint Text */}
      <Text style={styles.hint}>Tap to change photo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  avatarWrapper: {
    position: "relative",
    alignItems: "center",
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.inputBackground,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  hint: {
    marginTop: SPACING.md,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body14,
    color: COLORS.white,
  },
});

export default ProfilePhotoPicker;
