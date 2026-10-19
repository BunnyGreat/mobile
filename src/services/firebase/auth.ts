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

const getSafeGoogleAuthErrorCode = (error: unknown): string | null => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : null;
  if (
    typeof code === "string" &&
    /^[A-Za-z0-9_./-]{1,80}$/.test(code)
  ) {
    return code;
  }
  return typeof code === "number" && Number.isInteger(code)
    ? String(code)
    : null;
};

const logGoogleAuthDiagnostic = (
  stage: string,
  category: string,
  fieldsPresent: Record<string, boolean>,
  errorCode?: string | null,
): void => {
  console.info(
    "[GOOGLE OAUTH]",
    JSON.stringify({
      stage,
      status: null,
      category,
      fieldsPresent,
      ...(errorCode ? { errorCode } : {}),
    }),
  );
};

const signInToFirebaseWithGoogleIdToken = async (
  googleIdToken: string,
  supabaseNonce?: string,
): Promise<GoogleFirebaseSignInResult> => {
  logGoogleAuthDiagnostic("firebase_credential_exchange", "started", {
    idToken: Boolean(googleIdToken),
  });
  const credential = GoogleAuthProvider.credential(googleIdToken);
  let result: Awaited<ReturnType<typeof signInWithCredential>>;
  try {
    result = await signInWithCredential(auth, credential);
  } catch (error: unknown) {
    const code = getSafeGoogleAuthErrorCode(error) ?? "";
    if (
      code === "auth/invalid-credential" ||
      code === "auth/invalid-idp-response"
    ) {
      logGoogleAuthDiagnostic("firebase_auth", "token_rejected", {
        idToken: Boolean(googleIdToken),
      }, code);
      throw new GoogleAuthenticationError(
        "google_firebase_token_rejected",
        "Firebase rejected the Google sign-in token. Please try again.",
      );
    }
    if (code === "auth/network-request-failed") {
      logGoogleAuthDiagnostic("firebase_auth", "network_error", {
        idToken: Boolean(googleIdToken),
      }, code);
      throw new GoogleAuthenticationError(
        "google_firebase_network_failed",
        "Unable to reach Firebase. Check your connection and try again.",
      );
    }
    logGoogleAuthDiagnostic("firebase_auth", "authentication_failed", {
      idToken: Boolean(googleIdToken),
    }, code);
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

    let stage = "google_client_configuration";
    try {
      GoogleSignin.configure({ webClientId: getGoogleWebClientId() });
      stage = "native_play_services";
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
        stage = "browser_oauth_fallback";
        const { idToken, nonce } = await signInWithGoogleBrowserFallback();
        stage = "firebase_credential_exchange";
        return await signInToFirebaseWithGoogleIdToken(idToken, nonce);
      }
      stage = "native_sign_out";
      await GoogleSignin.signOut();

      let response: Awaited<ReturnType<typeof GoogleSignin.signIn>>;
      stage = "native_sign_in";
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
        stage = "browser_oauth_fallback";
        const { idToken, nonce } = await signInWithGoogleBrowserFallback();
        stage = "firebase_credential_exchange";
        return await signInToFirebaseWithGoogleIdToken(idToken, nonce);
      }

      if (response.type === "cancelled") {
        throw new GoogleAuthenticationError(
          "google_sign_in_cancelled",
          "Google Sign-In was cancelled.",
        );
      }

      stage = "google_id_token";
      const googleIdToken = response.data.idToken;
      logGoogleAuthDiagnostic("native_sign_in", "account_selected", {
        account: Boolean(response.data.user?.id),
        email: Boolean(response.data.user?.email),
        idToken: Boolean(googleIdToken),
        serverAuthCode: Boolean(response.data.serverAuthCode),
      });
      if (!googleIdToken) {
        throw new GoogleAuthenticationError(
          "google_token_missing",
          "Google Sign-In did not return a valid account token. Please try again.",
        );
      }

      stage = "firebase_credential_exchange";
      return await signInToFirebaseWithGoogleIdToken(googleIdToken);
    } catch (error: unknown) {
      const code =
        error instanceof GoogleAuthenticationError
          ? error.code
          : getSafeGoogleAuthErrorCode(error) ?? "";
      if (
        !(error instanceof GoogleAuthenticationError) ||
        error.code !== "google_sign_in_cancelled"
      ) {
        console.error(
          "[GOOGLE AUTH] Sign-In failed.",
          JSON.stringify({
            stage,
            ...(code ? { errorCode: code } : {}),
          }),
        );
      }
      if (error instanceof GoogleAuthenticationError) throw error;

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

      throw new GoogleAuthenticationError(
        "google_sign_in_failed",
        "Unable to sign in with Google. Please try again.",
      );
    }
  };