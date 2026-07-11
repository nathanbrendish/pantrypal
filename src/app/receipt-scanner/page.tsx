import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { SupermarketList } from "@/components/supermarket-list";
import { WorkflowSteps } from "@/components/workflow-steps";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { createClient } from "@/lib/supabase/server";

export default async function ReceiptScannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[960px] flex-1 flex-col gap-12 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Upload your shopping receipt
          </h1>
          <p className="max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
            We&apos;ll automatically extract your food items and update your
            pantry.
          </p>
        </div>

        <Card className="p-8 sm:p-12">
          <div className="flex flex-col items-center gap-8">
            <ReceiptScanner />
            <SupermarketList className="w-full text-left" />
          </div>
        </Card>

        <section className="flex flex-col gap-6">
          <SectionHeader
            title="How it works"
            description="From receipt to pantry in four simple steps."
          />
          <WorkflowSteps />
        </section>
      </main>
    </div>
  );
}
