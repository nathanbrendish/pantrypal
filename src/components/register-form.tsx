"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import {
  isPasswordStrong,
  isValidEmail,
} from "@/lib/password-validation";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const emailError =
    email.length > 0 && !isValidEmail(email)
      ? "Please enter a valid email address."
      : null;
  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  const canSubmit =
    isValidEmail(email) &&
    isPasswordStrong(password) &&
    password === confirmPassword &&
    !isPending;

  const handleSubmit = (formData: FormData) => {
    setClientError(null);

    if (!isValidEmail(email)) {
      setClientError("Please enter a valid email address.");
      return;
    }

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
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="Alex"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(emailError)}
          />
          {emailError && (
            <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            required
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          required
          autoComplete="new-password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={
            !passwordsMatch ? "Passwords do not match." : undefined
          }
        />

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}
