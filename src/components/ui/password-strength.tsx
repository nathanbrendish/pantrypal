"use client";

import { Check, X } from "lucide-react";
import {
  getPasswordRequirements,
  getPasswordStrength,
} from "@/lib/password-validation";
import { cn } from "@/lib/cn";

type PasswordStrengthProps = {
  password: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              strength.score <= 25 && "bg-red-500",
              strength.score === 50 && "bg-amber-500",
              strength.score === 75 && "bg-blue-500",
              strength.score === 100 && "bg-emerald-500"
            )}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted">
          {strength.label}
        </span>
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={cn(
              "flex items-center gap-2 text-xs",
              req.met
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted"
            )}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
