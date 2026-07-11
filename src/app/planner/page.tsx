import { redirect } from "next/navigation";
import { getCurrentMealPlan } from "@/app/actions/planner";
import { MealPlanner } from "@/components/meal-planner";
import { Navbar } from "@/components/navbar";
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
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <PageHeader
          icon="📅"
          title="Weekly Meal Planner"
          description="Plan your week with AI-generated meals that use your pantry and reduce waste."
        />

        <MealPlanner
          initialItems={plan.items}
          initialDaysCount={plan.daysCount}
        />
      </main>
    </div>
  );
}
