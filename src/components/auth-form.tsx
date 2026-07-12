"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  action: (prevState: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  alternateText: string;
  alternateHref: string;
  alternateLinkText: string;
  passwordAutoComplete?: "current-password" | "new-password";
};

export function AuthForm({
  action,
  submitLabel,
  alternateText,
  alternateHref,
  alternateLinkText,
  passwordAutoComplete = "current-password",
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <Card className="w-full p-8">
      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={passwordAutoComplete}
            minLength={6}
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Please wait…" : submitLabel}
        </Button>

        <p className="text-center text-sm text-muted">
          {alternateText}{" "}
          <a
            href={alternateHref}
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {alternateLinkText}
          </a>
        </p>
      </form>
    </Card>
  );
}
