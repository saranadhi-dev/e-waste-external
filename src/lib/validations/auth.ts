export interface AuthValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateRegistration(data: {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): AuthValidationResult {
  const errors: Record<string, string> = {};

  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  const emailErr = validateEmail(data.email || "");
  if (emailErr) errors.email = emailErr;

  const pwdErr = validatePassword(data.password || "");
  if (pwdErr) errors.password = pwdErr;

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLogin(data: {
  email?: string;
  password?: string;
}): AuthValidationResult {
  const errors: Record<string, string> = {};

  const emailErr = validateEmail(data.email || "");
  if (emailErr) errors.email = emailErr;

  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
