import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { RecipeCatalog } from "@/components/recipe-catalog";
import { PageHeader } from "@/components/ui/page-header";
import {
  getAllRecipes,
  getRecipeById,
  getRecipeCategories,
} from "@/lib/recipes";
import { createClient } from "@/lib/supabase/server";

type RecipesPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const requestedId = params.id?.trim() || null;
  const initialRecipeId =
    requestedId && getRecipeById(requestedId) ? requestedId : null;
  const missingRecipeId =
    requestedId && !getRecipeById(requestedId) ? requestedId : null;

  const { data: pantry } = await supabase
    .from("pantry")
    .select("ingredient_name, expiry_date")
    .eq("user_id", user.id);

  const recipes = getAllRecipes();
  const categories = getRecipeCategories();

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="🍳"
        title="Recipes"
        description="Browse 100+ built-in recipes. Filter by category, difficulty, and prep time."
      />

      <RecipeCatalog
        key={`${initialRecipeId ?? "none"}:${missingRecipeId ?? "ok"}`}
        recipes={recipes}
        categories={categories}
        pantry={(pantry ?? []).map((item) => ({
          ingredient_name: item.ingredient_name,
          expiry_date: item.expiry_date as string | null,
        }))}
        initialRecipeId={initialRecipeId}
        missingRecipeId={missingRecipeId}
      />
    </PageShell>
  );
}
