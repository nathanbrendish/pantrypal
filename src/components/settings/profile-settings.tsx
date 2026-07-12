"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile, updateEmail } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/password-validation";
import { useState } from "react";

type ProfileSettingsProps = {
  displayName: string;
  email: string;
};

export function ProfileSettings({ displayName, email }: ProfileSettingsProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    null
  );
  const [emailState, emailAction, emailPending] = useActionState(
    updateEmail,
    null
  );
  const [name, setName] = useState(displayName);
  const [newEmail, setNewEmail] = useState(email);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Profile picture
        </h2>
        <p className="mt-1 text-sm text-muted">
          Custom avatars are coming soon. For now, we use your initials.
        </p>
        <div className="mt-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white">
          {(name || email).slice(0, 2).toUpperCase()}
        </div>
      </Card>

      <Card className="p-6">
        <form action={profileAction} className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Display name
            </h2>
            <p className="mt-1 text-sm text-muted">
              This is how you&apos;ll appear across ShelfLife.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          {profileState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {profileState.error}
            </p>
          )}
          {profileState?.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {profileState.success}
            </p>
          )}

          <Button type="submit" disabled={profilePending || !name.trim()}>
            {profilePending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <form action={emailAction} className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Email address
            </h2>
            <p className="mt-1 text-sm text-muted">
              Changing your email requires verification via Supabase.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              error={newEmail.length > 0 && !isValidEmail(newEmail)}
              required
            />
          </div>

          {emailState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {emailState.error}
            </p>
          )}
          {emailState?.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {emailState.success}
            </p>
          )}

          <Button
            type="submit"
            disabled={emailPending || !isValidEmail(newEmail)}
          >
            {emailPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update email"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
