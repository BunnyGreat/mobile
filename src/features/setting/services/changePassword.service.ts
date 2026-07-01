import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../../../services/firebase/firebase";
import { supabaseUpdatePassword } from "../../../services/supabase/auth.service";

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

  // Update Supabase password for the current Supabase session
  const supabaseResult = await supabaseUpdatePassword(trimmedNewPassword);
  if (supabaseResult?.error) {
    const e = supabaseResult.error as Error;
    throw new Error(`Failed to update Supabase password: ${e.message || String(e)}`);
  }
};
