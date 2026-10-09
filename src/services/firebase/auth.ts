import { GoogleAuthProvider, signInWithCredential, type User } from "firebase/auth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { auth } from "./firebase";

declare const require: (path: string) => unknown;

type GoogleServicesConfig = {
  client?: Array<{
    oauth_client?: Array<{
      client_id?: string;
      client_type?: number;
    }>;
  }>;
};

export class GoogleAuthenticationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export type GoogleFirebaseSignInResult = {
  user: User;
  googleIdToken: string;
};

const getGoogleWebClientId = (): string => {
  const config = require("../../../google-services.json") as GoogleServicesConfig;
  const webClientId = config.client
    ?.flatMap((client) => client.oauth_client ?? [])
    .find((client) => client.client_type === 3)?.client_id;

  if (!webClientId) {
    throw new GoogleAuthenticationError(
      "google_not_configured",
      "Google Sign-In is not configured for this app.",
    );
  }

  return webClientId;
};

export const signInWithGoogleFirebase =
  async (): Promise<GoogleFirebaseSignInResult> => {
    if (Platform.OS !== "android" && Platform.OS !== "ios") {
      throw new GoogleAuthenticationError(
        "google_unsupported_platform",
        "Google Sign-In is only available in the mobile app.",
      );
    }

    try {
      GoogleSignin.configure({ webClientId: getGoogleWebClientId() });
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signOut();

      const response = await GoogleSignin.signIn();
      if (response.type === "cancelled") {
        throw new GoogleAuthenticationError(
          "google_sign_in_cancelled",
          "Google Sign-In was cancelled.",
        );
      }

      const googleIdToken = response.data.idToken;
      if (!googleIdToken) {
        throw new GoogleAuthenticationError(
          "google_token_missing",
          "Google Sign-In did not return a valid account token. Please try again.",
        );
      }

      const credential = GoogleAuthProvider.credential(googleIdToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      if (
        !user.providerData.some((provider) => provider.providerId === "google.com")
      ) {
        throw new GoogleAuthenticationError(
          "google_provider_missing",
          "This Firebase account is not linked to Google.",
        );
      }
      if (!user.email || !user.emailVerified) {
        throw new GoogleAuthenticationError(
          "google_email_unverified",
          "Your Google account must have a verified email address to continue.",
        );
      }

      return { user, googleIdToken };
    } catch (error: unknown) {
      if (error instanceof GoogleAuthenticationError) throw error;

      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";

      if (code === statusCodes.SIGN_IN_CANCELLED) {
        throw new GoogleAuthenticationError(
          "google_sign_in_cancelled",
          "Google Sign-In was cancelled.",
        );
      }
      if (
        code === "auth/account-exists-with-different-credential" ||
        code === "auth/credential-already-in-use" ||
        code === "auth/email-already-in-use"
      ) {
        throw new GoogleAuthenticationError(
          "google_provider_collision",
          "This email already uses Email/Password sign-in. Continue with Email/Password instead.",
        );
      }

      console.error("[GOOGLE AUTH] Sign-In failed:", error);
      throw new GoogleAuthenticationError(
        "google_sign_in_failed",
        "Unable to sign in with Google. Please try again.",
      );
    }
  };