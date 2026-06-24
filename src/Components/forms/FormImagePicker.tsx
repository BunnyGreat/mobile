import React, { useEffect, useState } from "react";
import {
  Image,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme";

export interface FormImagePickerProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const FormImagePicker: React.FC<FormImagePickerProps> = ({
  imageUri,
  onImageSelected,
  containerStyle,
  accessibilityLabel,
}) => {
  const [localUri, setLocalUri] = useState(imageUri);

  useEffect(() => {
    setLocalUri(imageUri);
  }, [imageUri]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setLocalUri(selectedUri);
      onImageSelected(selectedUri);
    }
  };

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? "Image picker"}
      style={containerStyle}
    >
      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.7}
        style={{
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: SPACING.sm,
          padding: SPACING.md,
          backgroundColor: COLORS.white,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {localUri ? (
          <Image
            source={{ uri: localUri }}
            style={{ width: 120, height: 120, borderRadius: SPACING.sm }}
          />
        ) : (
          <Text
            style={{
              color: COLORS.paragraph,
              fontFamily: FONT_FAMILY.regular,
              fontSize: FONT_SIZE.body14,
            }}
          >
            Select Image
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FormImagePicker;
