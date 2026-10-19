import { auth, db } from "../../../../../services/firebase/firebase";
import { supabase } from "../../../../../services/supabase/supabase";
import { uploadFileToSupabase } from "../../../../../services/supabase/storageUpload.service";
import {
  createUserWithEmailAndPassword,
  deleteUser,
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
  RegistrationAuthMethod,
} from "../types/register.types";
import {
  createRegistrationOtpRequestBody,
  createRegistrationOtpVerificationBody,
  getDuplicateFirebaseEmailMessage,
  getOtpFunctionErrorDiagnostics,
  getOtpFunctionErrorMessage,
  isDuplicateFirebaseEmailError,
  parseRegistrationOtpChallenge,
  parseRegistrationOtpVerification,
} from "./registrationOtp.helpers";

type RegistrationOtpChallenge = {
  challengeId: string;
  createdAt: number;
  expiresAt: number;
};

type RegistrationOtpAuthMethod = "password" | "google";

const getOtpFunctionError = async (
  error: unknown,
  action: "send" | "verify",
): Promise<Error> => {
  const diagnostics = await getOtpFunctionErrorDiagnostics(error, action);
  if (__DEV__) {
    console.warn(
      "[Registration OTP] Verification service request failed.",
      diagnostics,
    );
  }
  return new Error(getOtpFunctionErrorMessage(diagnostics, action));
};

export const createRegistrationOtp = async (
  email: string,
  authMethod: RegistrationOtpAuthMethod = "password",
): Promise<RegistrationOtpChallenge> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Enter a valid email address.");

  const createdAt = Date.now();
  const { data, error } = await supabase.functions.invoke<unknown>("send-otp", {
    body: createRegistrationOtpRequestBody(normalizedEmail, authMethod),
  });
  if (error) {
    throw await getOtpFunctionError(error, "send");
  }
  return parseRegistrationOtpChallenge(data, createdAt);
};

export const verifyRegistrationOtp = async (
  email: string,
  challengeId: string,
  code: string,
  authMethod: RegistrationOtpAuthMethod,
): Promise<
  | { valid: true; emailAvailable: boolean }
  | { valid: false; reason: "invalid-code" }
> => {
  const { data, error } = await supabase.functions.invoke<unknown>("send-otp", {
    body: createRegistrationOtpVerificationBody(
      email.trim().toLowerCase(),
      challengeId,
      code,
      authMethod,
    ),
  });
  if (error) {
    throw await getOtpFunctionError(error, "verify");
  }
  return parseRegistrationOtpVerification(data, authMethod);
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
    compressImage: false,
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
    const details =
      typeof error === "object" && error !== null
        ? (error as {
            name?: unknown;
            code?: unknown;
            status?: unknown;
          })
        : {};
    const code =
      typeof details.code === "string" &&
      /^[A-Za-z0-9_./-]{1,80}$/.test(details.code)
        ? details.code
        : undefined;
    const status =
      typeof details.status === "number" &&
      Number.isInteger(details.status)
        ? details.status
        : undefined;
    console.error(`[REGISTER] ${context}`, {
      file,
      function: fn,
      errorType:
        typeof details.name === "string" ? details.name : "UnknownError",
      ...(code ? { code } : {}),
      ...(status !== undefined ? { status } : {}),
    });
  }
};

export const registerUser = async (
  formData: RegistrationFormData,
  email: string,
  password: string | null,
  authMethod: RegistrationAuthMethod = "password",
  expectedFirebaseUid: string | null = null,
  emailOtpVerified = false,
): Promise<
  | { success: true; uid: string; referenceId: string }
  | { success: false; error: string }
> => {
  let credential: UserCredential | null = null;

  try {
    if (!emailOtpVerified) {
      throw new Error("Please verify your email before completing registration.");
    }

    if (!formData.documents?.frontIdUri || !formData.documents?.backIdUri) {
      throw new Error("Identification documents are required.");
    }

    if (!formData.personalInformation.profilePhotoUri) {
      throw new Error("Profile photo is required.");
    }

    let uid: string;
    if (authMethod === "password") {
      if (!password) {
        throw new Error("A password is required for Email/Password registration.");
      }

      credential = await createUserWithEmailAndPassword(auth, email, password);
      if (!credential.user?.uid) {
        throw new Error("Firebase Auth did not return a user ID.");
      }
      uid = credential.user.uid;

      const { supabaseCreateOrSignIn } = await import(
        "../../../../../services/supabase/auth.service"
      );

      const supabaseAuthResult = await supabaseCreateOrSignIn(email, password);
      if (supabaseAuthResult?.error) {
        throw supabaseAuthResult.error instanceof Error
          ? supabaseAuthResult.error
          : new Error(String(supabaseAuthResult.error));
      }
    } else {
      const googleUser = auth.currentUser;
      if (
        !googleUser ||
        !expectedFirebaseUid ||
        googleUser.uid !== expectedFirebaseUid ||
        googleUser.email?.toLowerCase() !== email.toLowerCase() ||
        !googleUser.emailVerified ||
        !googleUser.providerData.some(
          (provider) => provider.providerId === "google.com",
        )
      ) {
        throw new Error(
          "The verified Google account is no longer available. Please restart Google registration.",
        );
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(
          "The Google storage session expired. Please restart Google registration.",
        );
      }
      uid = googleUser.uid;
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
      isDuplicateFirebaseEmailError(error)
    ) {
      return {
        success: false,
        error: getDuplicateFirebaseEmailMessage(),
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
      error instanceof FirebaseError &&
      error.code === "auth/network-request-failed"
        ? "A network problem prevented registration. Check your connection and try again."
        : "Unable to complete registration. Please try again later.";
    return { success: false, error: message };
  }
};
