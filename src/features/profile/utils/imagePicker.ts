import * as ImagePicker from "expo-image-picker";

export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.status === "granted";
};

export const pickImageFromLibrary = async (): Promise<string | null> => {
  const permissionGranted = await requestPhotoLibraryPermission();
  if (!permissionGranted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
};
