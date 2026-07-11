import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { SavedMealsList } from "@/components/saved-meals-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import type { SavedMeal } from "@/types/v2";

export default async function SavedMealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: meals } = await supabase
    .from("meals_saved")
    .select(
      "id, meal_name, description, ingredients_used, missing_ingredients, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const savedMeals: SavedMeal[] = (meals ?? []).map((meal) => ({
    id: meal.id,
    meal_name: meal.meal_name,
    description: meal.description,
    ingredients_used: meal.ingredients_used as string[],
    missing_ingredients: meal.missing_ingredients as string[],
    created_at: meal.created_at,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <PageHeader
          icon="🔖"
          title="Saved Meals"
          description="Meals you've saved for later from suggestions."
        />

        <SavedMealsList meals={savedMeals} />
      </main>
    </div>
  );
}
