import { redirect } from "next/navigation";
import { getDashboardHomeData } from "@/app/actions/dashboard";
import { DashboardHome } from "@/components/dashboard-home";
import { getFirstName } from "@/components/dashboard-greeting";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardHomeData(user.id);

  return (
    <PageShell>
      <DashboardHome
        firstName={getFirstName(user.user_metadata)}
        data={data}
      />
    </PageShell>
  );
}
