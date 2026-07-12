import { Card } from "@/components/ui/card";
import { ChefHat } from "lucide-react";

export function AppearanceSettings() {
  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--ds-radius-xl)] bg-background text-2xl ring-1 ring-border">
        🎨
      </div>
      <h2 className="mt-6 text-xl font-semibold text-foreground">
        Appearance
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        Theme preferences and accent colours are coming soon. ShelfLife follows
        your system light and dark mode for now.
      </p>
    </Card>
  );
}

export function AboutSettings() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--ds-radius-lg)] bg-gradient-to-br from-primary to-primary-hover shadow-primary">
            <ChefHat className="h-7 w-7 text-inverse" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              ShelfLife
            </h2>
            <p className="text-sm text-muted">Version 1.0.0</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          ShelfLife helps you manage your kitchen, plan meals, and shop smarter.
          Scan receipts, track expiry dates, discover recipes, and build weekly
          meal plans — all in one friendly app.
        </p>
      </Card>
      <Card className="divide-y divide-border overflow-hidden p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-foreground">
            Made for home cooks
          </span>
          <span className="text-sm text-muted">❤️</span>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-foreground">
            Privacy first
          </span>
          <span className="text-sm text-muted">Your data stays yours</span>
        </div>
      </Card>
    </div>
  );
}
