export const validateFeedback = (message: string, rating: number): string | null => {
  const trimmedMessage = message.trim();

  if (rating < 1 || rating > 5) {
    return "Please select a rating.";
  }

  if (!trimmedMessage) {
    return "Please enter your feedback.";
  }

  if (trimmedMessage.length > 500) {
    return "Feedback must be 500 characters or less.";
  }

  return null;
};

export default validateFeedback;
