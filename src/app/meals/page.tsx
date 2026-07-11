import { redirect } from "next/navigation";
import { MealsSuggestions } from "@/components/meals-suggestions";
import { Navbar } from "@/components/navbar";
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
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Meal Suggestions
            </h1>
            <p className="mt-2 max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
              Discover what you can cook with the ingredients in your pantry.
              Meals prioritise ingredients closest to expiry.
            </p>
          </div>
          <a
            href="/saved-meals"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View saved meals →
          </a>
        </div>

        <MealsSuggestions hasIngredients={hasIngredients} />
      </main>
    </div>
  );
}
