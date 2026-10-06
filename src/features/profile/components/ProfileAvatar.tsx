import React, { useEffect, useState } from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE } from "../../../theme";

const placeholderImage = require("../../../../assets/icons/no-photo.png");

interface ProfileAvatarProps {
  uri?: string | null;
  imageStyle: StyleProp<ImageStyle>;
  showFailureMessage?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  uri,
  imageStyle,
  showFailureMessage = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = uri?.trim();

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  if (!imageUri) {
    return (
      <Image
        source={placeholderImage}
        style={imageStyle}
        resizeMode="cover"
        accessibilityLabel="No profile photo"
      />
    );
  }

  if (imageFailed) {
    return (
      <View style={[imageStyle, styles.failedContainer]}>
        <Feather name="image" size={24} color={COLORS.placeholder} />
        {showFailureMessage && (
          <Text style={styles.failedText}>Photo unavailable</Text>
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={imageStyle}
      resizeMode="cover"
      onError={() => {
        console.warn("[PROFILE PHOTO] Image failed to load.");
        setImageFailed(true);
      }}
      accessibilityLabel="Profile photo"
    />
  );
};

const styles = StyleSheet.create({
  failedContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    padding: 4,
  },
  failedText: {
    marginTop: 4,
    color: COLORS.paragraph,
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body12,
    textAlign: "center",
  },
});

export default ProfileAvatar;
