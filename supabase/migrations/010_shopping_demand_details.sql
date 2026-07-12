-- Quantity-aware shopping demand details
-- Keeps shopping rows readable without recomputing demand on page view while
-- allowing the UI to explain Demand - Pantry Supply = Buy Quantity.

ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS demand_quantity numeric,
  ADD COLUMN IF NOT EXISTS demand_unit text,
  ADD COLUMN IF NOT EXISTS pantry_quantity numeric,
  ADD COLUMN IF NOT EXISTS pantry_unit text,
  ADD COLUMN IF NOT EXISTS used_by_meals jsonb NOT NULL DEFAULT '[]'::jsonb;
