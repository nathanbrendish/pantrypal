"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AuthState } from "@/app/actions/auth";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { isValidEmail } from "@/lib/password-validation";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  const emailError =
    email.length > 0 && !isValidEmail(email)
      ? "Please enter a valid email address."
      : null;

  const handleSubmit = (formData: FormData) => {
    setClientError(null);

    if (!isValidEmail(email)) {
      setClientError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setClientError("Please enter your password.");
      return;
    }

    if (remember) {
      formData.set("remember", "true");
    }

    formAction(formData);
  };

  const error = clientError ?? state?.error;

  return (
    <Card className="w-full p-8">
      <form action={handleSubmit} className="flex flex-col gap-5">
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

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isPending || Boolean(emailError)}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Create one
          </Link>
        </p>
      </form>
    </Card>
  );
}
