-- Shopping list metadata persistence
-- Allows /shopping to read the current persisted list without regenerating the
-- weekly planner list on every page view. Planner/pantry mutations remain the
-- only code paths that regenerate computed weekly items.

ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS needed_for_meals integer NOT NULL DEFAULT 1
    CHECK (needed_for_meals >= 1),
  ADD COLUMN IF NOT EXISTS shortage_label text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'meal_plan'));
