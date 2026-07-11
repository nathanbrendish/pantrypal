import { redirect } from "next/navigation";
import { getDashboardStats } from "@/app/actions/dashboard";
import {
  DashboardGreeting,
  getFirstName,
} from "@/components/dashboard-greeting";
import { DashboardStatsGrid } from "@/components/dashboard-stats-grid";
import { Navbar } from "@/components/navbar";
import { ScanReceiptHeroCard } from "@/components/scan-receipt-hero-card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getDashboardStats(user.id);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-12 px-4 py-12 sm:px-6">
        <DashboardGreeting firstName={getFirstName(user.user_metadata)} />

        <section className="flex flex-col gap-8">
          <ScanReceiptHeroCard />
          <DashboardStatsGrid stats={stats} />
        </section>
      </main>
    </div>
  );
}
