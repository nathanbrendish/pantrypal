import { redirect } from "next/navigation";
import { getShoppingList } from "@/app/actions/shopping";
import { PageShell } from "@/components/page-shell";
import { ShoppingTrip } from "@/components/shopping-trip";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function ShoppingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const shoppingData = await getShoppingList();

  return (
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="🛒"
        title="Shopping List"
        description="Your supermarket checklist, automatically calculated from your meal plan and pantry."
      />

      <ShoppingTrip initialData={shoppingData} />
    </PageShell>
  );
}
