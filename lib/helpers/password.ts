export const DEFAULT_MIN_PASSWORD_LENGTH = 8;

export type PasswordValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export function validatePassword(
  password: string,
  minimumPasswordLength: number = DEFAULT_MIN_PASSWORD_LENGTH
): PasswordValidationResult {
  if (password == null || password.trim().length === 0) {
    return { isValid: false, errorMessage: 'Password is required.' };
  }

  if (password.length < minimumPasswordLength) {
    return {
      isValid: false,
      errorMessage: `Password must be at least ${minimumPasswordLength} characters long.`
    };
  }

  if (password.includes(' ')) {
    return { isValid: false, errorMessage: 'Password must not contain spaces.' };
  }

  let hasUpper = false;
  let hasLower = false;
  let hasDigit = false;
  let hasSpecial = false;

  for (const c of password) {
    if (c >= 'A' && c <= 'Z') hasUpper = true;
    else if (c >= 'a' && c <= 'z') hasLower = true;
    else if (c >= '0' && c <= '9') hasDigit = true;
    else hasSpecial = true;
  }

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return {
      isValid: false,
      errorMessage:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    };
  }

  return { isValid: true };
}
