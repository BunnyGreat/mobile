import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "onboarding_completed";

export const OnboardingStorage = {
  /**
   * Get onboarding completion status
   */
  async getCompleted(): Promise<boolean> {
    try {
      const result = await AsyncStorage.getItem(ONBOARDING_KEY);
      return result === "true";
    } catch (error) {
      console.error("Error reading onboarding status:", error);
      return false;
    }
  },

  /**
   * Set onboarding as completed
   */
  async setCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  },

  /**
   * Clear onboarding status (for testing/reset)
   */
  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error("Error clearing onboarding status:", error);
    }
  },
};
