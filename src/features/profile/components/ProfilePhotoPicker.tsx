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
      <View style={styles.photoFrame}>
        <Image
          source={photoUrl ? { uri: photoUrl } : placeholderImage}
          style={styles.photo}
          resizeMode="cover"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onPickPhoto}
        activeOpacity={0.75}
      >
        <Feather name="camera" size={18} color={COLORS.white} />
        <Text style={styles.buttonText}>Change Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  photoFrame: {
    width: 110,
    height: 110,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  buttonText: {
    marginLeft: SPACING.sm,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.white,
  },
});

export default ProfilePhotoPicker;
