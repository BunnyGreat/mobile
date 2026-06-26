import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../../../services/firebase/firebase";

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    const error = new Error("No authenticated user.");
    (error as any).code = "auth/no-current-user";
    throw error;
  }

  const trimmedCurrentPassword = currentPassword.trim();
  const trimmedNewPassword = newPassword.trim();

  const credential = EmailAuthProvider.credential(
    user.email,
    trimmedCurrentPassword,
  );

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, trimmedNewPassword);
};
