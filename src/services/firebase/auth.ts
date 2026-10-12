import { GoogleAuthProvider, signInWithCredential, type User } from "firebase/auth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { auth } from "./firebase";
import { GoogleAuthenticationError } from "./googleAuthenticationError";
import { getGoogleWebClientId } from "./googleOAuthConfig";
import { signInWithGoogleBrowserFallback } from "./googleOAuthFallback";
import { isGooglePlayServicesUnavailableError } from "./googlePlayServicesError";

export { GoogleAuthenticationError } from "./googleAuthenticationError";

export type GoogleFirebaseSignInResult = {
  user: User;
  googleIdToken: string;
  supabaseNonce?: string;
};

const logGoogleAuthDiagnostic = (
  stage: string,
  category: string,
  fieldsPresent: Record<string, boolean>,
): void => {
  console.info(
    "[GOOGLE OAUTH]",
    JSON.stringify({ stage, status: null, category, fieldsPresent }),
  );
};

const signInToFirebaseWithGoogleIdToken = async (
  googleIdToken: string,
  supabaseNonce?: string,
): Promise<GoogleFirebaseSignInResult> => {
  const credential = GoogleAuthProvider.credential(googleIdToken);
  let result: Awaited<ReturnType<typeof signInWithCredential>>;
  try {
    result = await signInWithCredential(auth, credential);
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";
    if (
      code === "auth/invalid-credential" ||
      code === "auth/invalid-idp-response"
    ) {
      logGoogleAuthDiagnostic("firebase_auth", "token_rejected", {
        idToken: Boolean(googleIdToken),
      });
      throw new GoogleAuthenticationError(
        "google_firebase_token_rejected",
        "Firebase rejected the Google sign-in token. Please try again.",
      );
    }
    if (code === "auth/network-request-failed") {
      logGoogleAuthDiagnostic("firebase_auth", "network_error", {
        idToken: Boolean(googleIdToken),
      });
      throw new GoogleAuthenticationError(
        "google_firebase_network_failed",
        "Unable to reach Firebase. Check your connection and try again.",
      );
    }
    logGoogleAuthDiagnostic("firebase_auth", "authentication_failed", {
      idToken: Boolean(googleIdToken),
    });
    throw error;
  }
  const user = result.user;
  logGoogleAuthDiagnostic("firebase_auth", "success", {
    idToken: Boolean(googleIdToken),
    user: Boolean(user.uid),
  });

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

  return { user, googleIdToken, supabaseNonce };
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
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: false,
        });
      } catch (error: unknown) {
        if (
          Platform.OS !== "android" ||
          !isGooglePlayServicesUnavailableError(
            error,
            statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
          )
        ) {
          throw error;
        }
        logGoogleAuthDiagnostic("native_play_services", "unavailable", {
          browserFallbackAvailable: true,
        });
        const { idToken, nonce } = await signInWithGoogleBrowserFallback();
        return await signInToFirebaseWithGoogleIdToken(idToken, nonce);
      }
      await GoogleSignin.signOut();

      let response: Awaited<ReturnType<typeof GoogleSignin.signIn>>;
      try {
        response = await GoogleSignin.signIn();
      } catch (error: unknown) {
        if (
          Platform.OS !== "android" ||
          !isGooglePlayServicesUnavailableError(
            error,
            statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
          )
        ) {
          throw error;
        }
        logGoogleAuthDiagnostic("native_play_services", "unavailable", {
          browserFallbackAvailable: true,
        });
        const { idToken, nonce } = await signInWithGoogleBrowserFallback();
        return await signInToFirebaseWithGoogleIdToken(idToken, nonce);
      }

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

      return await signInToFirebaseWithGoogleIdToken(googleIdToken);
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

      console.error("[GOOGLE AUTH] Sign-In failed.");
      throw new GoogleAuthenticationError(
        "google_sign_in_failed",
        "Unable to sign in with Google. Please try again.",
      );
    }
  };