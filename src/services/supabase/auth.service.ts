import { supabase } from "./supabase";

interface SupabaseAuthResult<T = unknown> {
  data?: T;
  error?: unknown;
}

const hasAuthSession = (data: any): boolean => !!data?.session;

export const supabaseSignUp = async (email: string, password: string): Promise<SupabaseAuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error, data };
    }
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const supabaseSignIn = async (email: string, password: string): Promise<SupabaseAuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error, data };
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const supabaseSignInWithGoogleIdToken = async (
  token: string,
  nonce?: string,
): Promise<SupabaseAuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token,
      ...(nonce ? { nonce } : {}),
    });
    if (error) return { error, data };
    if (!data.session) {
      return {
        error: new Error("Supabase did not establish a Google session."),
        data,
      };
    }
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const supabaseSignOut = async (): Promise<SupabaseAuthResult<{ success: true }>> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error };
    return { data: { success: true } };
  } catch (err) {
    return { error: err };
  }
};

export const supabaseUpdatePassword = async (newPassword: string): Promise<SupabaseAuthResult> => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error, data };
    return { data };
  } catch (err) {
    return { error: err };
  }
};

export const supabaseCreateOrSignIn = async (
  email: string,
  password: string,
): Promise<SupabaseAuthResult> => {
  const signUpResult = await supabaseSignUp(email, password);
  if (signUpResult.error) return signUpResult;
  if (!hasAuthSession(signUpResult.data)) {
    return {
      error: new Error(
        "Supabase did not create a new registration session. Please try again.",
      ),
      data: signUpResult.data,
    };
  }
  return signUpResult;
};
