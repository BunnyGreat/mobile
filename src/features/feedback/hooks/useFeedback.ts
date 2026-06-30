import { useEffect, useMemo } from "react";
import { useFeedbackStore } from "../store/feedback.store";

export const useFeedback = () => {
  const loading = useFeedbackStore((state) => state.loading);
  const error = useFeedbackStore((state) => state.error);
  const success = useFeedbackStore((state) => state.success);
  const submitFeedback = useFeedbackStore((state) => state.submitFeedback);
  const clearState = useFeedbackStore((state) => state.clearState);

  useEffect(() => {
    return () => clearState();
  }, [clearState]);

  return useMemo(
    () => ({
      loading,
      error,
      success,
      submitFeedback,
      clearState,
    }),
    [loading, error, success, submitFeedback, clearState],
  );
};

export default useFeedback;
