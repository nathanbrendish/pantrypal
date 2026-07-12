import { redirect } from "next/navigation";
import { getCurrentMealPlan } from "@/app/actions/planner";
import { MealPlanner } from "@/components/meal-planner";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function PlannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getCurrentMealPlan();

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="📅"
        title="Weekly Meal Planner"
        description="Plan your week with AI-generated meals that use your pantry and reduce waste."
      />

      <MealPlanner
        initialItems={plan.items}
        initialDaysCount={plan.daysCount}
      />
    </PageShell>
  );
}
