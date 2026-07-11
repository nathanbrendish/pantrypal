import { Card } from "@/components/ui/card";

export function MealSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/80" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/80" />
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="h-7 w-20 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
          <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
          <div className="h-7 w-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
        <div className="mt-2 h-11 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </Card>
  );
}
