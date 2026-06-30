import AsyncStorage from "@react-native-async-storage/async-storage";

const FEEDBACK_CACHE_KEY = "@barangay/feedback/draft";

export const saveFeedbackDraft = async (message: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(FEEDBACK_CACHE_KEY, message);
  } catch (error: unknown) {
    console.error("[FEEDBACK CACHE] Failed to save draft", error);
  }
};

export const loadFeedbackDraft = async (): Promise<string> => {
  try {
    const rawValue = await AsyncStorage.getItem(FEEDBACK_CACHE_KEY);
    return rawValue ?? "";
  } catch (error: unknown) {
    console.error("[FEEDBACK CACHE] Failed to load draft", error);
    return "";
  }
};

export const clearFeedbackDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FEEDBACK_CACHE_KEY);
  } catch (error: unknown) {
    console.error("[FEEDBACK CACHE] Failed to clear draft", error);
  }
};
