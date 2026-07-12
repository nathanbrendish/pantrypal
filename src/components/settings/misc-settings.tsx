import { Card } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

export function AppearanceSettings() {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <span className="text-2xl" aria-hidden="true">
          🎨
        </span>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Appearance settings
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Theme preferences and accent colours are coming in a future update.
        PantryPal currently follows your system light/dark mode setting.
      </p>
    </Card>
  );
}

export function AboutSettings() {
  return (
    <Card className="p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
          <ChefHat className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            PantryPal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Version 1.0.0
          </p>
        </div>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        PantryPal helps you manage your kitchen, plan meals, and shop smarter.
        Scan receipts, track expiry dates, discover recipes, and build weekly
        meal plans — all in one friendly app.
      </p>
    </Card>
  );
}
