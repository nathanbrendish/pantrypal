"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { isPasswordStrong } from "@/lib/password-validation";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  const canSubmit =
    isPasswordStrong(password) && password === confirmPassword && !isPending;

  const handleSubmit = (formData: FormData) => {
    setClientError(null);

    if (!isPasswordStrong(password)) {
      setClientError("Please meet all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    formAction(formData);
  };

  const error = clientError ?? state?.error;

  return (
    <Card className="w-full p-8">
      <form action={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <PasswordInput
            id="password"
            name="password"
            label="New password"
            required
            autoComplete="new-password"
            placeholder="Create a new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={!passwordsMatch ? "Passwords do not match." : undefined}
        />

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Updating password…
            </>
          ) : (
            "Update password"
          )}
        </Button>

        <Link
          href="/login"
          className="text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Back to sign in
        </Link>
      </form>
    </Card>
  );
}
