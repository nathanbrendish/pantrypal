-- Anonymous cooking behaviour observations
-- Stores expected-vs-actual ingredient usage for future intelligence without
-- automatically modifying recipes or community food records.

CREATE TABLE IF NOT EXISTS public.cooking_behavior_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id text,
  recipe_name text NOT NULL,
  expected_ingredient text,
  actual_ingredient text NOT NULL,
  expected_quantity numeric,
  expected_unit text,
  actual_quantity numeric NOT NULL DEFAULT 0 CHECK (actual_quantity >= 0),
  actual_unit text,
  action text NOT NULL DEFAULT 'used'
    CHECK (action IN ('used', 'skipped', 'extra', 'substituted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cooking_behavior_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can record anonymous cooking observations"
  ON public.cooking_behavior_observations FOR INSERT
  TO authenticated
  WITH CHECK (true);
