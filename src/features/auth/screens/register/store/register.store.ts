import { create } from "zustand";
import { registerUser } from "../services/register.service";
import type {
  RegistrationPersonalInformation,
  RegistrationResidenceInformation,
  RegistrationDocuments,
  RegistrationFormData,
  RegistrationAuthMethod,
} from "../types/register.types";

export interface RegistrationStore {
  email: string;
  password: string;
  firebaseUid: string | null;
  authMethod: RegistrationAuthMethod;
  emailVerified: boolean;
  otpChallengeId: string | null;
  otpCreatedAt: number | null;
  otpExpiresAt: number | null;
  personalInformation: RegistrationPersonalInformation | null;
  residenceInformation: RegistrationResidenceInformation | null;
  documents: RegistrationDocuments | null;
  isLoading: boolean;
  referenceId: string | null;
  saveAccountCredentials: (email: string, password: string) => void;
  saveEmailForVerification: (email: string) => void;
  markEmailVerified: () => void;
  clearEmailVerification: () => void;
  saveGoogleAccount: (email: string, firebaseUid: string) => void;
  savePersonalInformation: (data: RegistrationPersonalInformation) => void;
  saveResidenceInformation: (data: RegistrationResidenceInformation) => void;
  saveDocuments: (data: RegistrationDocuments) => void;
  setLoading: (value: boolean) => void;
  setReferenceId: (id: string) => void;
  setOtp: (challengeId: string, createdAt: number, expiresAt: number) => void;
  isOtpExpired: () => boolean;
  getRegistrationData: () => {
    email: string;
    password: string;
    firebaseUid: string | null;
    authMethod: RegistrationAuthMethod;
    personalInformation: RegistrationPersonalInformation | null;
    residenceInformation: RegistrationResidenceInformation | null;
    documents: RegistrationDocuments | null;
  };
  submitRegistration: (documents: RegistrationDocuments) => Promise<{ success: boolean; error?: string }>;
  clearRegistration: () => void;
}

export const useRegisterStore = create<RegistrationStore>((set, get) => ({
  email: "",
  password: "",
  firebaseUid: null,
  authMethod: "password",
  emailVerified: false,
  otpChallengeId: null,
  otpCreatedAt: null,
  otpExpiresAt: null,
  personalInformation: null,
  residenceInformation: null,
  documents: null,
  isLoading: false,
  referenceId: null,

  saveAccountCredentials: (email, password) =>
    set(() => ({
      email,
      password,
      firebaseUid: null,
      authMethod: "password",
      otpChallengeId: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
      personalInformation: null,
      residenceInformation: null,
      documents: null,
      referenceId: null,
    })),

  saveEmailForVerification: (email) =>
    set(() => ({
      email,
      password: "",
      firebaseUid: null,
      authMethod: "password",
      emailVerified: false,
      otpChallengeId: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
      personalInformation: null,
      residenceInformation: null,
      documents: null,
      referenceId: null,
    })),

  markEmailVerified: () =>
    set(() => ({
      emailVerified: true,
      otpChallengeId: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
    })),

  clearEmailVerification: () =>
    set(() => ({
      emailVerified: false,
      password: "",
      otpChallengeId: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
    })),

  saveGoogleAccount: (email, firebaseUid) =>
    set(() => ({
      email,
      password: "",
      firebaseUid,
      authMethod: "google",
      emailVerified: false,
      otpChallengeId: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
      personalInformation: null,
      residenceInformation: null,
      documents: null,
      referenceId: null,
    })),

  savePersonalInformation: (data) =>
    set(() => ({ personalInformation: data })),

  saveResidenceInformation: (data) =>
    set(() => ({ residenceInformation: data })),

  saveDocuments: (data) =>
    set(() => ({ documents: data })),

  setLoading: (value) => set(() => ({ isLoading: value })),

  setReferenceId: (id) => set(() => ({ referenceId: id })),

  setOtp: (challengeId, createdAt, expiresAt) =>
    set(() => ({
      otpChallengeId: challengeId,
      otpCreatedAt: createdAt,
      otpExpiresAt: expiresAt,
    })),

  isOtpExpired: () => {
    const { otpExpiresAt } = get();
    if (!otpExpiresAt) return true;

    const expired = Date.now() >= otpExpiresAt;
    if (expired) {
      set({ otpChallengeId: null, otpCreatedAt: null, otpExpiresAt: null });
    }
    return expired;
  },

  getRegistrationData: () => {
    const {
      email,
      password,
      firebaseUid,
      authMethod,
      personalInformation,
      residenceInformation,
      documents,
    } = get();
    return {
      email,
      password,
      firebaseUid,
      authMethod,
      personalInformation,
      residenceInformation,
      documents,
    };
  },

  submitRegistration: async (documents) => {
    if (get().isLoading) {
      return { success: false, error: "Registration already in progress." };
    }

    try {
      set({ isLoading: true });

      const {
        email,
        password,
        firebaseUid,
        authMethod,
        emailVerified,
        personalInformation,
        residenceInformation,
      } = get();

      if (!emailVerified) {
        throw new Error("Please verify your email before completing registration.");
      }

      if (
        !email ||
        (authMethod === "password" && !password) ||
        (authMethod === "google" && !firebaseUid) ||
        !personalInformation ||
        !residenceInformation
      ) {
        throw new Error("Incomplete registration data");
      }

      const formData: RegistrationFormData = {
        personalInformation,
        residenceInformation,
        documents,
      };

      const result = await registerUser(
        formData,
        email,
        password || null,
        authMethod,
        firebaseUid,
        emailVerified,
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      set({ referenceId: result.referenceId });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown registration error",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  clearRegistration: () =>
    set(() => ({
      email: "",
      password: "",
      firebaseUid: null,
      authMethod: "password",
      emailVerified: false,
      otpChallengeId: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
      personalInformation: null,
      residenceInformation: null,
      documents: null,
      isLoading: false,
      referenceId: null,
    })),
}));
