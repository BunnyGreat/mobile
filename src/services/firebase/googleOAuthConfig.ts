import { GoogleAuthenticationError } from "./googleAuthenticationError";
import Constants from "expo-constants";

export const getGoogleWebClientId = (): string => {
  const webClientId: unknown =
    Constants.expoConfig?.extra?.googleWebClientId;

  if (typeof webClientId !== "string" || !webClientId) {
    throw new GoogleAuthenticationError(
      "google_not_configured",
      "Google Sign-In is not configured for this app.",
    );
  }

  return webClientId;
};
