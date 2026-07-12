import { redirect } from "next/navigation";
import Link from "next/link";
import { getCatalogueMealSuggestions } from "@/app/actions/meals";
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

  const [{ data: items }, catalogueResult] = await Promise.all([
    supabase
      .from("pantry")
      .select("ingredient_name, expiry_date")
      .eq("user_id", user.id),
    getCatalogueMealSuggestions(),
  ]);

  const pantry = (items ?? []).map((item) => ({
    ingredient_name: item.ingredient_name as string,
    expiry_date: item.expiry_date as string | null,
  }));

  const hasIngredients = pantry.length > 0;
  const initialSuggestions =
    catalogueResult.status === "success" ? catalogueResult.suggestions : null;

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="🍽️"
        title="Meal Suggestions"
        description="Instant recipe matches from your pantry. Ask AI only when you want extra ideas beyond the built-in catalogue."
        action={
          <Link
            href="/saved-meals"
            className="text-sm font-medium text-primary hover:underline"
          >
            View saved meals →
          </Link>
        }
      />

      <MealsSuggestions
        hasIngredients={hasIngredients}
        initialSuggestions={initialSuggestions}
        pantry={pantry}
      />
    </PageShell>
  );
}
