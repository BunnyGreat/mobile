export type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type PasswordRequirement = {
  id: string;
  label: string;
  valid: boolean;
};

export type PasswordStrength = {
  level: number;
  label: string;
  color: string;
};
