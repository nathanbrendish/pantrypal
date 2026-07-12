"use client";

import { useActionState, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  changePassword,
  deleteAccount,
} from "@/app/actions/settings";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { isPasswordStrong } from "@/lib/password-validation";

type AccountSettingsProps = {
  emailVerified: boolean;
  createdAt: string;
  lastSignIn?: string | null;
};

export function AccountSettings({
  emailVerified,
  createdAt,
  lastSignIn,
}: AccountSettingsProps) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    null
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const canChangePassword =
    isPasswordStrong(newPassword) &&
    newPassword === confirmPassword &&
    !passwordPending;

  const handleDelete = () => {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteAccount();
      if (result?.error) {
        setDeleteError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Security
        </h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email verified
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {emailVerified ? "Yes" : "Pending verification"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Account created
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {createdAt}
            </dd>
          </div>
          {lastSignIn && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Last sign in
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {lastSignIn}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      <Card className="p-6">
        <form action={passwordAction} className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Change password
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use a strong password you don&apos;t use elsewhere.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <PasswordInput
              id="newPassword"
              name="newPassword"
              label="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordStrength password={newPassword} />
          </div>

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            error={
              confirmPassword && newPassword !== confirmPassword
                ? "Passwords do not match."
                : undefined
            }
            required
          />

          {passwordState?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {passwordState.error}
            </p>
          )}
          {passwordState?.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {passwordState.success}
            </p>
          )}

          <Button type="submit" disabled={!canChangePassword}>
            {passwordPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Session
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign out of PantryPal on this device.
        </p>
        <form action={logout} className="mt-5">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </Card>

      <Card className="border-red-200 p-6 dark:border-red-900/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Delete account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Permanently delete your account and all associated data including
              pantry items, meal plans, shopping lists, and saved meals. This
              cannot be undone.
            </p>
            <Button
              type="button"
              variant="danger"
              className="mt-5"
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        description="All your pantry data, meal plans, shopping lists and saved meals will be permanently deleted."
      >
        {deleteError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {deleteError}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Yes, delete everything"
            )}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
