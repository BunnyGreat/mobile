import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase/firebase";
import {
  GoogleAuthenticationError,
  signInWithGoogleFirebase,
} from "../../../services/firebase/auth";
import { supabaseSignInWithGoogleIdToken } from "../../../services/supabase/auth.service";
import { resolveProfilePhotoUrl } from "../../profile/services/profilePhoto.service";
import type { LoginUser } from "../screens/login/types/login.types";

export type GoogleAuthenticationOutcome =
  | { type: "new-registration"; email: string; firebaseUid: string }
  | { type: "resident"; user: LoginUser };

class GoogleStorageAuthenticationError extends Error {}

const getSafeSupabaseErrorDetails = (error: unknown) => {
  const details =
    typeof error === "object" && error !== null
      ? error as { code?: unknown; status?: unknown; message?: unknown }
      : {};
  const code =
    typeof details.code === "string" &&
    /^[A-Za-z0-9_.-]{1,80}$/.test(details.code)
      ? details.code
      : null;
  const status =
    typeof details.status === "number" &&
    Number.isInteger(details.status)
      ? details.status
      : null;
  const message =
    typeof details.message === "string"
      ? details.message
          .replace(/\bBearer\s+\S+/gi, "Bearer [REDACTED]")
          .replace(
            /\b(access[_ -]?token|refresh[_ -]?token|id[_ -]?token|token|authorization|password|client[_ -]?secret|api[_ -]?key|verifier|ticket)\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
            "$1=[REDACTED]",
          )
          .replace(
            /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
            "[REDACTED_TOKEN]",
          )
          .slice(0, 240)
      : "Unknown Supabase authentication error";

  return { code, status, message };
};

const signInToSupabase = async (
  googleIdToken: string,
  supabaseNonce?: string,
): Promise<void> => {
  console.info(
    "[GOOGLE AUTH]",
    JSON.stringify({
      stage: "supabase_nonce_handoff",
      noncePresent: Boolean(supabaseNonce),
      nonceLength: supabaseNonce?.length ?? 0,
    }),
  );
  const result = await supabaseSignInWithGoogleIdToken(
    googleIdToken,
    supabaseNonce,
  );
  if (result.error) {
    console.error(
      "[GOOGLE AUTH] Supabase sign-in failed.",
      JSON.stringify({
        stage: "supabase_google_id_token",
        ...getSafeSupabaseErrorDetails(result.error),
      }),
    );
    throw new GoogleStorageAuthenticationError(
      "Unable to sign into the storage service with Google. Please try again.",
    );
  }
};

export const authenticateGoogleResident =
  async (): Promise<GoogleAuthenticationOutcome> => {
    try {
      const {
        user: firebaseUser,
        googleIdToken,
        supabaseNonce,
      } = await signInWithGoogleFirebase();
      const userDocument = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDocument.exists()) {
        await signInToSupabase(googleIdToken, supabaseNonce);
        const email = firebaseUser.email;
        if (!email) {
          throw new GoogleAuthenticationError(
            "google_email_unverified",
            "Your Google account must have a verified email address to continue.",
          );
        }
        return {
          type: "new-registration",
          email,
          firebaseUid: firebaseUser.uid,
        };
      }

      const data = userDocument.data() as Record<string, any>;
      const status = data.status ?? "pending";
      const email = firebaseUser.email;
      if (!email) {
        throw new GoogleAuthenticationError(
          "google_email_unverified",
          "Your Google account must have a verified email address to continue.",
        );
      }
      const loginUser: LoginUser = {
        uid: firebaseUser.uid,
        email,
        role: data.role ?? "resident",
        status,
        referenceId: data.referenceId ?? undefined,
        personalInformation: {
          firstName: data.personalInformation?.firstName ?? "",
          middleName: data.personalInformation?.middleName ?? "",
          lastName: data.personalInformation?.lastName ?? "",
          profilePhotoPath:
            data.personalInformation?.profilePhotoPath ??
            data.profilePhotoPath ??
            undefined,
          profilePhotoUrl:
            data.personalInformation?.profilePhotoUrl ??
            data.profilePhotoUrl ??
            undefined,
        },
      };

      if (status === "pending" || status === "rejected") {
        return { type: "resident", user: loginUser };
      }

      await signInToSupabase(googleIdToken, supabaseNonce);

      try {
        loginUser.profilePhotoUrl =
          (await resolveProfilePhotoUrl(
            firebaseUser.uid,
            data,
            firebaseUser.photoURL,
          )) ?? undefined;
        loginUser.personalInformation.profilePhotoUrl =
          loginUser.profilePhotoUrl;
      } catch {
        console.warn("[GOOGLE AUTH] Failed to resolve profile photo.");
      }

      return { type: "resident", user: loginUser };
    } catch (error: unknown) {
      if (error instanceof GoogleAuthenticationError) throw error;
      if (error instanceof GoogleStorageAuthenticationError) throw error;
      console.error("[GOOGLE AUTH] Resident authentication failed.");
      throw new Error(
        "Unable to complete Google sign-in. Please try again.",
      );
    }
  };

export const isGoogleSignInCancelled = (error: unknown): boolean =>
  error instanceof GoogleAuthenticationError &&
  error.code === "google_sign_in_cancelled";

export const getGoogleAuthenticationErrorMessage = (
  error: unknown,
): string => {
  if (error instanceof GoogleAuthenticationError) return error.message;
  if (error instanceof GoogleStorageAuthenticationError) return error.message;
  return "Unable to sign in with Google. Please try again.";
};
