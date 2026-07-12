import { cn } from "@/lib/cn";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/60",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="pp-card p-6">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="pp-card p-6">
      <Skeleton className="h-10 w-10 rounded-2xl" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-8 w-16" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="pp-card flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
