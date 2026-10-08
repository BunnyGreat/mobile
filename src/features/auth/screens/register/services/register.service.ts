import { auth, db } from "../../../../../services/firebase/firebase";
import { supabase } from "../../../../../services/supabase/supabase";
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

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Supabase URL not configured.");
  }

  try {
    // Call Supabase Edge Function to send OTP via Resend
    // The Edge Function handles the Resend API key securely on the server
    const response = await supabase.functions.invoke("send-otp", {
      body: {
        email,
        otpCode,
        type: "registration",
      },
    });

    // Handle response errors
    if (response.error) {
      const errorMessage = response.error instanceof Error 
        ? response.error.message 
        : typeof response.error === "string"
        ? response.error
        : "Failed to send verification email";
      throw new Error(errorMessage);
    }

    // Check response data for success
    if (response.data?.success === false) {
      throw new Error(
        response.data.error || "Failed to send verification email"
      );
    }

    // Verify response indicates success
    if (!response.data?.success) {
      throw new Error("Failed to send verification email. Please try again.");
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send verification email. Please try again.";
    throw new Error(message);
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
