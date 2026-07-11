import { redirect } from "next/navigation";
import { getShoppingList } from "@/app/actions/shopping";
import { Navbar } from "@/components/navbar";
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
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <PageHeader
          icon="🛒"
          title="Shopping Trip"
          description="Automatically calculated from your meal plan and pantry."
        />

        <ShoppingTrip initialData={shoppingData} />
      </main>
    </div>
  );
}
