-- Extend existing pantry table
ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS quantity numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Saved meals
CREATE TABLE IF NOT EXISTS public.meals_saved (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  meal_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  ingredients_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meals_saved_user_id_idx ON public.meals_saved (user_id);

ALTER TABLE public.meals_saved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved meals"
  ON public.meals_saved FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved meals"
  ON public.meals_saved FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved meals"
  ON public.meals_saved FOR DELETE
  USING (auth.uid() = user_id);

-- Weekly meal plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  days_count integer NOT NULL CHECK (days_count IN (3, 5, 7)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_plans_user_id_idx ON public.meal_plans (user_id);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meal plans"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.meal_plans (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day_index integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  meal_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  ingredients_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_ingredients jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS meal_plan_items_plan_id_idx ON public.meal_plan_items (plan_id);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meal plan items"
  ON public.meal_plan_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Shopping list
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity numeric,
  unit text,
  category text NOT NULL DEFAULT 'Other',
  checked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shopping_list_items_user_id_idx ON public.shopping_list_items (user_id);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shopping list"
  ON public.shopping_list_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pantry update policy if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pantry'
      AND policyname = 'Users can update their own pantry items'
  ) THEN
    CREATE POLICY "Users can update their own pantry items"
      ON public.pantry FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
