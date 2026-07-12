"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  showStrength?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { label, error, className, id, showStrength: _showStrength, ...props },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? "password";

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            error={Boolean(error)}
            className={cn("pr-12", className)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="pp-focus-ring absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
