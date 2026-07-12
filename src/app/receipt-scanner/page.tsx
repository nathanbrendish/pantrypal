import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { SupermarketList } from "@/components/supermarket-list";
import { WorkflowSteps } from "@/components/workflow-steps";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
    <PageShell className="pb-24 lg:pb-10">
      <PageHeader
        icon="📷"
        title="Scan Receipt"
        description="We'll automatically extract your food items and update your pantry."
      />

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
    </PageShell>
  );
}
