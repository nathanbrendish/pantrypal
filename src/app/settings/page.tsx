import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsNav } from "@/components/settings-nav";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import {
  AboutSettings,
  AppearanceSettings,
} from "@/components/settings/misc-settings";
import { getDisplayName } from "@/components/dashboard-greeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const tab = params.tab ?? "profile";
  const displayName = getDisplayName(user.user_metadata) ?? "";
  const email = user.email ?? "";
  const initials = (displayName || email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="⚙️"
        title="Settings"
        description="Manage your profile, account, and preferences."
      />

      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white shadow-md shadow-blue-500/25">
            {initials}
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {displayName || "Your profile"}
            </h2>
            <p className="mt-0.5 text-sm text-muted">{email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={user.email_confirmed_at ? "success" : "orange"}>
                {user.email_confirmed_at ? "Email verified" : "Email pending"}
              </Badge>
              <Badge variant="muted">
                Member since {formatDate(user.created_at)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/settings?tab=profile">
            <Button variant="secondary">Edit profile</Button>
          </Link>
          <Link href="/settings?tab=account">
            <Button variant="secondary">Change password</Button>
          </Link>
        </div>
      </Card>

      <Suspense fallback={null}>
        <SettingsNav />
      </Suspense>

      {tab === "profile" && (
        <ProfileSettings displayName={displayName} email={email} />
      )}

      {tab === "account" && (
        <AccountSettings
          emailVerified={Boolean(user.email_confirmed_at)}
          createdAt={formatDate(user.created_at)}
          lastSignIn={formatDate(user.last_sign_in_at)}
        />
      )}

      {tab === "appearance" && <AppearanceSettings />}

      {tab === "about" && <AboutSettings />}
    </PageShell>
  );
}
