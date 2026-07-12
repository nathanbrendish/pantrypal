import { MealCard } from "@/components/meal-card";
import type { Meal } from "@/types/meals";

type MealSectionProps = {
  icon: string;
  title: string;
  meals: Meal[];
  onCooked: () => void;
  onOpenRecipe?: (meal: Meal) => void;
};

export function MealSection({
  icon,
  title,
  meals,
  onCooked,
  onOpenRecipe,
}: MealSectionProps) {
  if (meals.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {meals.map((meal) => (
          <MealCard
            key={`${title}-${meal.recipeId ?? meal.name}`}
            meal={meal}
            onCooked={onCooked}
            onOpenRecipe={onOpenRecipe}
          />
        ))}
      </div>
    </section>
  );
}
