import { auth, db } from "../../../../../services/firebase/firebase";
import { uploadFileToSupabaseStorage } from "../../../../../services/supabase/storageUpload.service";
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
  if (!apiKey) {
    throw new Error("Resend API key is not configured.");
  }

  const resendSender = "Barangay San Isidro <onboarding@resend.dev>"; // TODO: Replace with noreply@barangaysanisidro.ph in production

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
  bucketName: string,
): Promise<{ url: string; path: string }> => {
  const extension = getFileExtension(uri);
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const contentType = getContentType(extension);

  return uploadFileToSupabaseStorage({
    uri,
    bucketName,
    filePath,
    contentType,
    compressImage: true,
    maxFileSizeBytes: 5 * 1024 * 1024,
  });
};

export const uploadIdentificationImage = async (
  uri: string,
  bucketName: string,
): Promise<{ url: string; path: string }> => uploadImage(uri, bucketName);

export const createUserDocument = async (
  uid: string,
  email: string,
  personalInformation: RegistrationPersonalInformation,
  residenceInformation: RegistrationResidenceInformation,
  profilePhotoUrl: string,
  frontIdUrl: string,
  backIdUrl: string,
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
      profilePhotoUrl,
    },
    residenceInformation,
    documents: {
      frontIdUrl,
      backIdUrl,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const registerUser = async (
  formData: RegistrationFormData,
  email: string,
  password: string,
): Promise<
  | { success: true; uid: string; referenceId: string }
  | { success: false; error: string }
> => {
  try {
    const credential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (!credential.user?.uid) {
      throw new Error("Firebase Auth did not return a user ID.");
    }

    const uid = credential.user.uid;

    if (!formData.documents?.frontIdUri || !formData.documents?.backIdUri) {
      throw new Error("Identification documents are required.");
    }

    if (!formData.personalInformation.profilePhotoUri) {
      throw new Error("Profile photo is required.");
    }

    try {
      const profilePhotoUpload = await uploadImage(
        formData.personalInformation.profilePhotoUri,
        "profile_photo",
      );

      const frontIdUpload = await uploadIdentificationImage(
        formData.documents.frontIdUri,
        "identification",
      );
      const backIdUpload = await uploadIdentificationImage(
        formData.documents.backIdUri,
        "identification",
      );

      const referenceId = generateReferenceId();
      await createUserDocument(
        uid,
        email,
        formData.personalInformation,
        formData.residenceInformation,
        profilePhotoUpload.url,
        frontIdUpload.url,
        backIdUpload.url,
        referenceId,
      );

      return { success: true, uid, referenceId };
    } catch (registrationError: unknown) {
      if (credential.user) {
        try {
          await deleteUser(credential.user);
        } catch (rollbackError: unknown) {
          // rollback failed
        }
      }
      throw registrationError;
    }
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
    const message =
      error instanceof Error ? error.message : "Unknown registration error";
    return { success: false, error: message };
  }
};
