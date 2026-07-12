import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MealSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-2 flex flex-wrap gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="mt-2 h-12 w-40 rounded-xl" />
      </div>
    </Card>
  );
}

export function MealsLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MealSkeleton key={index} />
      ))}
    </div>
  );
}
