import { MealCard } from "@/components/meal-card";
import type { Meal } from "@/types/meals";

type MealSectionProps = {
  icon: string;
  title: string;
  meals: Meal[];
  onCooked: () => void;
};

export function MealSection({
  icon,
  title,
  meals,
  onCooked,
}: MealSectionProps) {
  if (meals.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {meals.map((meal) => (
          <MealCard key={`${title}-${meal.name}`} meal={meal} onCooked={onCooked} />
        ))}
      </div>
    </section>
  );
}
