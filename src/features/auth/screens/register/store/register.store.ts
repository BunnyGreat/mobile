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
  otpCode: string | null;
  otpCreatedAt: number | null;
  otpExpiresAt: number | null;
  personalInformation: RegistrationPersonalInformation | null;
  residenceInformation: RegistrationResidenceInformation | null;
  documents: RegistrationDocuments | null;
  isLoading: boolean;
  referenceId: string | null;
  saveAccountCredentials: (email: string, password: string) => void;
  saveGoogleAccount: (email: string, firebaseUid: string) => void;
  savePersonalInformation: (data: RegistrationPersonalInformation) => void;
  saveResidenceInformation: (data: RegistrationResidenceInformation) => void;
  saveDocuments: (data: RegistrationDocuments) => void;
  setLoading: (value: boolean) => void;
  setReferenceId: (id: string) => void;
  setOtpCode: (code: string | null) => void;
  setOtpExpiration: (timestamp: number | null) => void;
  setOtp: (code: string, createdAt: number, expiresAt: number) => void;
  verifyOtp: (code: string) => boolean;
  clearOtp: () => void;
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
  otpCode: null,
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
      otpCode: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
      personalInformation: null,
      residenceInformation: null,
      documents: null,
      referenceId: null,
    })),

  saveGoogleAccount: (email, firebaseUid) =>
    set(() => ({
      email,
      password: "",
      firebaseUid,
      authMethod: "google",
      otpCode: null,
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

  setOtpCode: (code) => set(() => ({ otpCode: code })),

  setOtpExpiration: (timestamp) =>
    set(() => ({ otpExpiresAt: timestamp })),

  setOtp: (code, createdAt, expiresAt) =>
    set(() => ({
      otpCode: code,
      otpCreatedAt: createdAt,
      otpExpiresAt: expiresAt,
    })),

  verifyOtp: (code) => {
    const { otpCode, otpExpiresAt } = get();
    if (!otpCode || !otpExpiresAt) {
      set({ otpCode: null, otpCreatedAt: null, otpExpiresAt: null });
      return false;
    }

    if (Date.now() >= otpExpiresAt) {
      set({ otpCode: null, otpCreatedAt: null, otpExpiresAt: null });
      return false;
    }

    return otpCode === code;
  },

  clearOtp: () =>
    set(() => ({ otpCode: null, otpCreatedAt: null, otpExpiresAt: null })),

  isOtpExpired: () => {
    const { otpExpiresAt } = get();
    if (!otpExpiresAt) return true;

    const expired = Date.now() >= otpExpiresAt;
    if (expired) {
      set({ otpCode: null, otpCreatedAt: null, otpExpiresAt: null });
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
        personalInformation,
        residenceInformation,
      } = get();

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
      otpCode: null,
      otpCreatedAt: null,
      otpExpiresAt: null,
      personalInformation: null,
      residenceInformation: null,
      documents: null,
      isLoading: false,
      referenceId: null,
    })),
}));
