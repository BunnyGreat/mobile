export interface FeedbackFormValues {
  rating: number;
  message: string;
}

export interface FeedbackRecord {
  feedbackId: string;
  uid: string;
  fullName: string;
  profilePhotoUrl: string | null;
  rating: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStore {
  loading: boolean;
  error: string | null;
  success: boolean;
  submitFeedback: (values: FeedbackFormValues) => Promise<void>;
  clearState: () => void;
}
