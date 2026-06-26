import { useCallback, useEffect, useState } from "react";
import { compressPhoto, pickImage } from "../services/profilePhoto.service";

export const useProfilePhoto = (initialPhotoUrl?: string | null) => {
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUrl ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhotoUri(initialPhotoUrl ?? null);
  }, [initialPhotoUrl]);

  const pickPhoto = useCallback(async () => {
    setLoading(true);
    try {
      const selectedUri = await pickImage();
      if (!selectedUri) {
        return null;
      }

      const compressedUri = await compressPhoto(selectedUri);
      setPhotoUri(compressedUri);
      return compressedUri;
    } catch (error: unknown) {
      console.warn("[PROFILE PHOTO] Could not pick photo", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    photoUri,
    loading,
    pickImage: pickPhoto,
  };
};
