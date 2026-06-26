export const hasUppercase = (value: string) => /[A-Z]/.test(value);
export const hasLowercase = (value: string) => /[a-z]/.test(value);
export const hasNumber = (value: string) => /[0-9]/.test(value);
export const hasSpecialCharacter = (value: string) => /[^a-zA-Z0-9]/.test(value);
export const hasMinimumLength = (value: string) => value.length >= 8;

export const calculatePasswordStrength = (value: string) => {
  let score = 0;
  if (hasMinimumLength(value)) score++;
  if (hasLowercase(value)) score++;
  if (hasUppercase(value)) score++;
  if (hasNumber(value)) score++;
  if (hasSpecialCharacter(value)) score++;

  if (score <= 2) {
    return { level: 1, label: "Weak", color: "#D92D20" };
  }

  if (score === 3) {
    return { level: 2, label: "Medium", color: "#F59E0B" };
  }

  return { level: 3, label: "Strong", color: "#047857" };
};
