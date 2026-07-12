import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AddIngredientForm } from "@/components/add-ingredient-form";
import { PageShell } from "@/components/page-shell";
import { PantryBrowser } from "@/components/pantry-browser";
import { PantryStats } from "@/components/pantry-stats";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { SuccessBanner } from "@/components/ui/success-banner";
import { refreshStalePantryClassifications } from "@/lib/community-foods";
import { createClient } from "@/lib/supabase/server";
import type { PantryItem } from "@/types/pantry";
import type {
  FoodCategory,
  FoodSubcategory,
  StorageLocation,
} from "@/types/taxonomy";

type PantryPageProps = {
  searchParams: Promise<{ added?: string }>;
};

const PANTRY_SELECT =
  "id, ingredient_name, quantity, unit, expiry_date, storage_location_id, canonical_food_id, cached_category_id, cached_subcategory_id, classification_version, created_at, updated_at, storage_location:storage_locations(name, icon), cached_category:food_categories(name, icon), cached_subcategory:food_subcategories(name, icon)";

export default async function PantryPage({ searchParams }: PantryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const addedCount = params.added ? Number.parseInt(params.added, 10) : 0;
  const showSuccessBanner = Number.isFinite(addedCount) && addedCount > 0;

  // Pull-based self-healing: bring stale cached classifications up to date
  // with the community source of truth before rendering.
  try {
    await refreshStalePantryClassifications(supabase);
  } catch {
    // Never block the pantry render on a refresh failure.
  }

  const [
    { data: items },
    { data: storageLocations },
    { data: categories },
    { data: subcategories },
  ] = await Promise.all([
    supabase.from("pantry").select(PANTRY_SELECT).eq("user_id", user.id),
    supabase
      .from("storage_locations")
      .select("id, name, icon, display_order, active")
      .eq("active", true)
      .order("display_order"),
    supabase
      .from("food_categories")
      .select("id, name, icon, display_order, active, taxonomy_version")
      .eq("active", true)
      .order("display_order"),
    supabase
      .from("food_subcategories")
      .select("id, food_category_id, name, icon, display_order, active, taxonomy_version")
      .eq("active", true)
      .order("display_order"),
  ]);

  const pantryItems = (items as unknown as PantryItem[]) ?? [];
  const locations = (storageLocations as StorageLocation[]) ?? [];
  const foodCategories = (categories as FoodCategory[]) ?? [];
  const foodSubcategories = (subcategories as FoodSubcategory[]) ?? [];

  return (
    <PageShell className="pb-28">
      {showSuccessBanner && (
        <SuccessBanner
          message={`${addedCount} new ingredient${addedCount === 1 ? "" : "s"} added.`}
        />
      )}

      <PageHeader
        icon="🥫"
        title="Pantry"
        description="Search, browse by storage location, and manage everything in your kitchen."
      />

      <PantryStats ingredientCount={pantryItems.length} />

      <section id="add-ingredient" className="flex flex-col gap-4">
        <SectionHeader
          title="Add ingredient"
          description="Add name, quantity, unit, storage location, and optional expiry date."
        />
        <AddIngredientForm
          storageLocations={locations}
          categories={foodCategories}
        />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Your ingredients"
          description="Grouped by storage location, with expiring items shown first."
        />
        <PantryBrowser
          items={pantryItems}
          storageLocations={locations}
          categories={foodCategories}
          subcategories={foodSubcategories}
        />
      </section>

      <Link
        href="#add-ingredient"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600/40 lg:bottom-8"
        aria-label="Add ingredient"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </PageShell>
  );
}
