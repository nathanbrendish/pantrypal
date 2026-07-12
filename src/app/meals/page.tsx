import { redirect } from "next/navigation";
import Link from "next/link";
import { MealsSuggestions } from "@/components/meals-suggestions";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function MealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: items } = await supabase
    .from("pantry")
    .select("id")
    .eq("user_id", user.id);

  const hasIngredients = (items ?? []).length > 0;

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="🍽️"
        title="Meal Suggestions"
        description="Discover what you can cook with the ingredients in your pantry. Meals prioritise ingredients closest to expiry."
        action={
          <Link
            href="/saved-meals"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View saved meals →
          </Link>
        }
      />

      <MealsSuggestions hasIngredients={hasIngredients} />
    </PageShell>
  );
}
