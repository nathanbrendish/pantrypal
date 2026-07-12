import { Suspense } from "react";
import { redirect } from "next/navigation";
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

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="⚙️"
        title="Settings"
        description="Manage your profile, account, and preferences."
      />

      <Suspense fallback={null}>
        <SettingsNav />
      </Suspense>

      {tab === "profile" && (
        <ProfileSettings
          displayName={getDisplayName(user.user_metadata) ?? ""}
          email={user.email ?? ""}
        />
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
