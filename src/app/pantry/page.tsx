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
      "id, ingredient_name, quantity, unit, category, subcategory, expiry_date, created_at, updated_at"
    )
    .eq("user_id", user.id);

  const pantryItems = (items as PantryItem[]) ?? [];

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
