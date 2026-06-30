import { create } from "zustand";
import { submitFeedback as submitFeedbackService } from "../services/feedback.service";
import type { FeedbackFormValues, FeedbackStore } from "../types/feedback.types";

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  loading: false,
  error: null,
  success: false,

  submitFeedback: async (values: FeedbackFormValues) => {
    set({ loading: true, error: null, success: false });

    try {
      await submitFeedbackService(values);
      set({ loading: false, success: true, error: null });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to submit feedback.";
      set({ loading: false, success: false, error: message });
    }
  },

  clearState: () => set({ loading: false, error: null, success: false }),
}));
