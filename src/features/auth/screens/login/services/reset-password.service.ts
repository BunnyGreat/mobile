import { invokePasswordResetFunction } from "./password-reset-api.service";

type ResetPasswordResponse = {
  success: boolean;
};

export const resetPasswordWithAuthorization = async (
  resetAuthorization: string,
  password: string,
): Promise<void> => {
  if (!resetAuthorization || !password) {
    throw new Error("Invalid password reset request.");
  }

  const response =
    await invokePasswordResetFunction<ResetPasswordResponse>({
      action: "reset",
      resetAuthorization,
      password,
    });

  if (!response.success) throw new Error("Password could not be updated.");
};
