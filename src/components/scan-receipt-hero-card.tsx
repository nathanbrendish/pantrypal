import Link from "next/link";
import { ScanLine } from "lucide-react";
import { DragDropIllustration } from "@/components/drag-drop-illustration";
import { SupermarketList } from "@/components/supermarket-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ScanReceiptHeroCard() {
  return (
    <Card className="p-8 sm:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-5">
          <span className="text-5xl" role="img" aria-hidden="true">
            🧾
          </span>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Scan Receipt
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              Automatically update your pantry from a shopping receipt. Drop a
              receipt anywhere in the app to get started.
            </p>
          </div>

          <SupermarketList />

          <Link href="/receipt-scanner" className="w-fit">
            <Button className="h-12 px-8">
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              Scan Receipt
            </Button>
          </Link>
        </div>

        <div className="w-full lg:max-w-sm">
          <DragDropIllustration />
        </div>
      </div>
    </Card>
  );
}
