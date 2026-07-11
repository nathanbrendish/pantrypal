import { redirect } from "next/navigation";
import { AddIngredientForm } from "@/components/add-ingredient-form";
import { Navbar } from "@/components/navbar";
import { PantryBrowser } from "@/components/pantry-browser";
import { PantryStats } from "@/components/pantry-stats";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { SuccessBanner } from "@/components/ui/success-banner";
import { createClient } from "@/lib/supabase/server";
import type { PantryItem } from "@/types/pantry";

type PantryPageProps = {
  searchParams: Promise<{ added?: string }>;
};

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

  const { data: items } = await supabase
    .from("pantry")
    .select(
      "id, ingredient_name, quantity, unit, expiry_date, created_at, updated_at"
    )
    .eq("user_id", user.id);

  const pantryItems = (items as PantryItem[]) ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        {showSuccessBanner && (
          <SuccessBanner
            message={`${addedCount} new ingredient${addedCount === 1 ? "" : "s"} added.`}
          />
        )}

        <PageHeader
          icon="🥫"
          title="Pantry"
          description="Search, browse by category, and manage everything in your kitchen."
        />

        <PantryStats ingredientCount={pantryItems.length} />

        <section id="add-ingredient" className="flex flex-col gap-4">
          <SectionHeader
            title="Add ingredient"
            description="Add name, quantity, unit, and optional expiry date."
          />
          <AddIngredientForm />
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Your ingredients"
            description="Grouped by category with expiring items shown first."
          />
          <PantryBrowser items={pantryItems} />
        </section>
      </main>
    </div>
  );
}
