import AsyncStorage from "@react-native-async-storage/async-storage";

const APPOINTMENT_CACHE_KEY = "@barangay/appointment/draft";

export interface AppointmentDraft {
  purpose: string;
  concern: string;
  appointmentDate: string;
  appointmentTime: string;
}

export const saveAppointmentDraft = async (draft: AppointmentDraft): Promise<void> => {
  try {
    await AsyncStorage.setItem(APPOINTMENT_CACHE_KEY, JSON.stringify(draft));
  } catch (error: unknown) {
    console.error("[APPOINTMENT CACHE] Failed to save draft", error);
  }
};

export const loadAppointmentDraft = async (): Promise<AppointmentDraft | null> => {
  try {
    const rawValue = await AsyncStorage.getItem(APPOINTMENT_CACHE_KEY);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as AppointmentDraft;
  } catch (error: unknown) {
    console.error("[APPOINTMENT CACHE] Failed to load draft", error);
    return null;
  }
};

export const clearAppointmentDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(APPOINTMENT_CACHE_KEY);
  } catch (error: unknown) {
    console.error("[APPOINTMENT CACHE] Failed to clear draft", error);
  }
};
