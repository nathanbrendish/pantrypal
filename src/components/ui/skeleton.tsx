import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";
import { AppCard } from "@/components/ui/card";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--ds-radius-md)] bg-border/80",
        ds.loadingPulse,
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function LoadingSkeleton() {
  return (
    <AppCard className="p-[var(--ds-space-xl)]">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="mt-[var(--ds-space-lg)] h-4 w-full" />
      <Skeleton className="mt-[var(--ds-space-sm)] h-4 w-4/5" />
      <div className="mt-[var(--ds-space-xl)] flex gap-[var(--ds-space-sm)]">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </AppCard>
  );
}

/** @deprecated Prefer LoadingSkeleton */
export function CardSkeleton() {
  return <LoadingSkeleton />;
}

export function StatSkeleton() {
  return (
    <AppCard className="p-[var(--ds-space-xl)]">
      <Skeleton className="h-10 w-10 rounded-[var(--ds-radius-xl)]" />
      <Skeleton className="mt-[var(--ds-space-lg)] h-4 w-2/3" />
      <Skeleton className="mt-[var(--ds-space-sm)] h-8 w-16" />
    </AppCard>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-[var(--ds-space-md)]">
      {Array.from({ length: rows }).map((_, index) => (
        <AppCard
          key={index}
          className="flex items-center gap-[var(--ds-space-lg)] p-[var(--ds-space-lg)]"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-[var(--ds-radius-md)]" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-[var(--ds-space-sm)] h-3 w-1/3" />
          </div>
        </AppCard>
      ))}
    </div>
  );
}
