import { auth } from "../../../../../services/firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export const sendPasswordResetLink = async (
  email: string,
  actionCodeSettings?: { url: string; handleCodeInApp: boolean },
): Promise<void> => {
  if (!email) throw new Error("Invalid email");
  try {
    if (actionCodeSettings) {
      await sendPasswordResetEmail(auth, email, actionCodeSettings as any);
    } else {
      await sendPasswordResetEmail(auth, email);
    }
  } catch (error: unknown) {
    throw error instanceof Error ? error : new Error("Password reset failed");
  }
};
