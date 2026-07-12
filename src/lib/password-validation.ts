export type PasswordRequirement = {
  id: string;
  label: string;
  met: boolean;
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: "length",
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "One uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "One lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "One number",
      met: /\d/.test(password),
    },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRequirements(password).every((req) => req.met);
}

export function getPasswordStrength(password: string): {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
} {
  const requirements = getPasswordRequirements(password);
  const metCount = requirements.filter((req) => req.met).length;

  if (!password) {
    return { score: 0, label: "Weak" };
  }

  if (metCount <= 1) return { score: 25, label: "Weak" };
  if (metCount === 2) return { score: 50, label: "Fair" };
  if (metCount === 3) return { score: 75, label: "Good" };
  return { score: 100, label: "Strong" };
}
