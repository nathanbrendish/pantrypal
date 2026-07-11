import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { RecipeCatalog } from "@/components/recipe-catalog";
import { PageHeader } from "@/components/ui/page-header";
import { getAllRecipes, getRecipeCategories } from "@/lib/recipes";
import { createClient } from "@/lib/supabase/server";

export default async function RecipesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pantry } = await supabase
    .from("pantry")
    .select("ingredient_name, expiry_date")
    .eq("user_id", user.id);

  const recipes = getAllRecipes();
  const categories = getRecipeCategories();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <PageHeader
          icon="🍳"
          title="Meals Available"
          description="Browse 100+ built-in recipes. Filter by category, difficulty, and prep time."
        />

        <RecipeCatalog
          recipes={recipes}
          categories={categories}
          pantry={(pantry ?? []).map((item) => ({
            ingredient_name: item.ingredient_name,
            expiry_date: item.expiry_date as string | null,
          }))}
        />
      </main>
    </div>
  );
}
