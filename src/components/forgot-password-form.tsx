"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { forgotPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/password-validation";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);
  const [email, setEmail] = useState("");

  const emailError =
    email.length > 0 && !isValidEmail(email)
      ? "Please enter a valid email address."
      : null;

  if (state?.success) {
    return (
      <Card className="w-full p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <MailCheck className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Check your email
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {state.success}
        </p>
        <Link href="/login" className="mt-8 inline-block">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full p-8">
      <form action={formAction} className="flex flex-col gap-5">
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

        {state?.error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isPending || !isValidEmail(email)}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </form>
    </Card>
  );
}
