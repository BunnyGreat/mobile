import { auth, db } from "../../../../../services/firebase/firebase";
import { uploadFileToSupabase } from "../../../../../services/supabase/storageUpload.service";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  UserCredential,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type {
  RegistrationFormData,
  RegistrationPersonalInformation,
  RegistrationResidenceInformation,
  RegistrationDocuments,
} from "../types/register.types";

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    const existsInAuth = methods.length > 0;
    return existsInAuth;
  } catch (error: unknown) {
    throw error;
  }
};

export const checkEmailAvailability = async (
  email: string,
): Promise<boolean> => {
  const exists = await checkEmailExists(email);
  return exists;
};

export const sendRegistrationOtpEmail = async (
  email: string,
  otpCode: string,
): Promise<void> => {
  if (!email || !otpCode) {
    throw new Error("Invalid OTP email payload.");
  }

  const apiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
  // Security: Resend API key must not be bundled in production mobile apps.
  // If present in the runtime bundle this is a security risk. Warn in dev and fail safely.
  if (!apiKey) {
    throw new Error("Resend API key is not configured.");
  }

  if (!__DEV__) {
    // In production builds the client should not call Resend directly.
    // Log a visible warning and throw so registration flow falls back to server-side flow.
    // This prevents embedding secret API keys in the mobile bundle.
    // Maintain existing behavior in development for debugging.
    // eslint-disable-next-line no-console
    console.warn("[SECURITY] Resend API key detected in client build — remove from mobile bundle and call email send from a backend.");
    throw new Error("Email delivery is disabled in this build for security reasons.");
  }

  const resendSender = "Barangay San Isidro <noreply@barangay-san-isidro.help>"; // TODO: Replace with noreply@barangaysanisidro.ph in production

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: resendSender,
      to: [email],
      subject: "Barangay San Isidro Verification Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otpCode}</h1>
        <p>This code expires in 5 minutes.</p>
      `,
    }),
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(`OTP email send failed: ${response.status} ${data}`);
  }
};

export const generateReferenceId = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
  return `REG-${year}-${randomSuffix}`;
};

const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match ? match[1] : "jpg";
};

const getContentType = (extension: string): string => {
  const normalized = extension.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "image/jpeg";
  if (normalized === "png") return "image/png";
  if (normalized === "gif") return "image/gif";
  return `image/${normalized}`;
};

export const uploadImage = async (
  uri: string,
  uid: string,
  bucketName: string,
  fileName: string,
): Promise<{ path: string }> => {
  // Use centralized upload utility — deterministic path: {uid}/{fileName}
  return uploadFileToSupabase({
    uid,
    bucketName,
    fileName,
    uri,
    contentType: getContentType(getFileExtension(uri)),
    compressImage: true,
    maxFileSizeBytes: 5 * 1024 * 1024,
    upsert: true,
  });
};

export const uploadIdentificationImage = async (
  uri: string,
  uid: string,
  bucketName: string,
  fileName: string,
): Promise<{ path: string }> => uploadImage(uri, uid, bucketName, fileName);

export const createUserDocument = async (
  uid: string,
  email: string,
  personalInformation: RegistrationPersonalInformation,
  residenceInformation: RegistrationResidenceInformation,
  profilePhotoPath: string,
  frontIdPath: string,
  backIdPath: string,
  referenceId: string,
): Promise<void> => {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    email,
    role: "resident",
    status: "pending",
    referenceId,
    personalInformation: {
      ...personalInformation,
      profilePhotoPath,
    },
    residenceInformation,
    documents: {
      frontIdPath,
      backIdPath,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

const logRegistrationFailure = (
  context: string,
  error: unknown,
  file: string,
  fn: string,
) => {
  if (__DEV__) {
    console.error(`[REGISTER] ${context}`, {
      file,
      function: fn,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      raw: error,
    });
  }
};

export const registerUser = async (
  formData: RegistrationFormData,
  email: string,
  password: string,
): Promise<
  | { success: true; uid: string; referenceId: string }
  | { success: false; error: string }
> => {
  let credential: UserCredential | null = null;

  try {
    if (!formData.documents?.frontIdUri || !formData.documents?.backIdUri) {
      throw new Error("Identification documents are required.");
    }

    if (!formData.personalInformation.profilePhotoUri) {
      throw new Error("Profile photo is required.");
    }

    credential = await createUserWithEmailAndPassword(auth, email, password);

    if (!credential.user?.uid) {
      throw new Error("Firebase Auth did not return a user ID.");
    }

    const uid = credential.user.uid;

    const { supabaseCreateOrSignIn } = await import(
      "../../../../../services/supabase/auth.service"
    );

    const supabaseAuthResult = await supabaseCreateOrSignIn(email, password);
    if (supabaseAuthResult?.error) {
      throw supabaseAuthResult.error instanceof Error
        ? supabaseAuthResult.error
        : new Error(String(supabaseAuthResult.error));
    }

    const profilePhotoUpload = await uploadImage(
      formData.personalInformation.profilePhotoUri,
      uid,
      "profile_photo",
      "profile.jpg",
    );

    const frontIdUpload = await uploadIdentificationImage(
      formData.documents.frontIdUri,
      uid,
      "identification",
      "front_id.jpg",
    );

    const backIdUpload = await uploadIdentificationImage(
      formData.documents.backIdUri,
      uid,
      "identification",
      "back_id.jpg",
    );

    const referenceId = generateReferenceId();
    await createUserDocument(
      uid,
      email,
      formData.personalInformation,
      formData.residenceInformation,
      profilePhotoUpload.path,
      frontIdUpload.path,
      backIdUpload.path,
      referenceId,
    );

    return { success: true, uid, referenceId };
  } catch (error: unknown) {
    if (
      error instanceof FirebaseError &&
      error.code === "auth/email-already-in-use"
    ) {
      return {
        success: false,
        error:
          "This email is already registered. Please use another email address or log in instead.",
      };
    }

    logRegistrationFailure(
      "Registration flow failed",
      error,
      "src/features/auth/screens/register/services/register.service.ts",
      "registerUser",
    );

    if (credential?.user) {
      try {
        await deleteUser(credential.user);
      } catch (rollbackError) {
        logRegistrationFailure(
          "Rollback failed while deleting Firebase user",
          rollbackError,
          "src/features/auth/screens/register/services/register.service.ts",
          "registerUser",
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "Unknown registration error";
    return { success: false, error: message };
  }
};
