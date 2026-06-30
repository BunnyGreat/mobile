import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../services/firebase/firebase";
import { getProfile } from "../../profile/services/profile.service";
import type { FeedbackFormValues, FeedbackRecord } from "../types/feedback.types";
import { validateFeedback } from "../utils/validateFeedback";

export const submitFeedback = async (
  values: FeedbackFormValues,
): Promise<FeedbackRecord> => {
  const validationError = validateFeedback(values.message, values.rating);
  if (validationError) {
    throw new Error(validationError);
  }

  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error("Authentication required.");
  }

  const profile = await getProfile();

  const feedbackPayload: Omit<FeedbackRecord, "feedbackId"> = {
    uid: currentUser.uid,
    fullName: profile.fullName,
    profilePhotoUrl: profile.profilePhotoUrl ?? null,
    rating: values.rating,
    message: values.message.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, "feedback"), {
    ...feedbackPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    feedbackId: docRef.id,
    ...feedbackPayload,
  };
};
