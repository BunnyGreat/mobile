import { useMemo } from "react";
import {
  calculatePasswordStrength,
  hasLowercase,
  hasNumber,
  hasSpecialCharacter,
  hasUppercase,
  hasMinimumLength,
} from "../utils/passwordStrength";
import { PasswordRequirement, PasswordStrength } from "../types/changePassword.types";

export const usePasswordValidation = (
  password: string,
  confirmPassword: string,
) => {
  const requirements: PasswordRequirement[] = useMemo(
    () => [
      {
        id: "length",
        label: "At least 8 characters",
        valid: hasMinimumLength(password),
      },
      {
        id: "uppercase",
        label: "One uppercase letter",
        valid: hasUppercase(password),
      },
      {
        id: "lowercase",
        label: "One lowercase letter",
        valid: hasLowercase(password),
      },
      {
        id: "number",
        label: "One number",
        valid: hasNumber(password),
      },
      {
        id: "special",
        label: "One special character",
        valid: hasSpecialCharacter(password),
      },
    ],
    [password],
  );

  const passwordStrength: PasswordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password],
  );

  const passwordMatch = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [confirmPassword, password],
  );

  return {
    requirements,
    passwordStrength,
    passwordMatch,
  };
};
