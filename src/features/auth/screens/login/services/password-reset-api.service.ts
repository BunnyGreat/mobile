import { supabase } from "../../../../../services/supabase/supabase";

type FunctionErrorResponse = {
  error?: string;
  code?: string;
};

export class PasswordResetFunctionError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "PasswordResetFunctionError";
  }
}

const readFunctionError = async (
  error: unknown,
  fallback: string,
): Promise<PasswordResetFunctionError> => {
  if (
    typeof error === "object" &&
    error !== null &&
    "context" in error &&
    error.context instanceof Response
  ) {
    try {
      const response = (await error.context.clone().json()) as
        | FunctionErrorResponse
        | null;
      if (response?.error) {
        return new PasswordResetFunctionError(response.error, response.code);
      }
    } catch {
      return new PasswordResetFunctionError(fallback);
    }
  }

  return new PasswordResetFunctionError(fallback);
};

export const invokePasswordResetFunction = async <T>(
  body: Record<string, string>,
): Promise<T> => {
  const { data, error } = await supabase.functions.invoke<T>("password-reset", {
    body,
  });

  if (error) {
    throw await readFunctionError(error, "Unable to complete password reset.");
  }
  if (!data) throw new Error("Password reset service returned no response.");

  return data;
};
