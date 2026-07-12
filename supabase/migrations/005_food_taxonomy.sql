-- Food Knowledge Graph V2 - Taxonomy foundation
-- Introduces the controlled food-classification vocabulary and the user-owned
-- storage-location vocabulary as reference (lookup) tables. Names are display
-- only; everything else in the platform references these rows by id.
-- taxonomy_version lets the vocabulary evolve deliberately over time.

CREATE TABLE public.food_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  taxonomy_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.food_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_category_id uuid NOT NULL REFERENCES public.food_categories (id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  taxonomy_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT food_subcategories_category_name_key UNIQUE (food_category_id, name)
);

CREATE INDEX food_subcategories_category_idx
  ON public.food_subcategories (food_category_id);

CREATE TABLE public.storage_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Controlled category vocabulary. "Unclassified" is intentionally NOT a row:
-- it is represented by a NULL category id so it never pollutes analytics.
INSERT INTO public.food_categories (name, icon, display_order) VALUES
  ('Dairy', '🧀', 10),
  ('Fruit', '🍎', 20),
  ('Vegetables', '🥬', 30),
  ('Meat', '🥩', 40),
  ('Seafood', '🐟', 50),
  ('Bakery', '🍞', 60),
  ('Pasta & Rice', '🍝', 70),
  ('Herbs & Spices', '🌿', 80),
  ('Pantry Staples', '🥫', 90),
  ('Condiments & Sauces', '🫙', 100),
  ('Oils & Vinegars', '🫗', 110),
  ('Tinned & Jarred Foods', '🥫', 120),
  ('Frozen Foods', '🧊', 130),
  ('Snacks', '🍿', 140),
  ('Confectionery', '🍬', 150),
  ('Beverages', '🥤', 160),
  ('Baking', '🧁', 170);

-- Starter subcategories (semi-controlled; SUPER_ADMIN can add/promote more).
INSERT INTO public.food_subcategories (food_category_id, name, display_order)
SELECT c.id, sub.name, sub.display_order
FROM public.food_categories c
JOIN (
  VALUES
    ('Dairy', 'Cheese', 10),
    ('Dairy', 'Milk', 20),
    ('Dairy', 'Butter', 30),
    ('Dairy', 'Cream', 40),
    ('Dairy', 'Yogurt', 50),
    ('Dairy', 'Eggs', 60),
    ('Fruit', 'Fresh Fruit', 10),
    ('Fruit', 'Dried Fruit', 20),
    ('Vegetables', 'Fresh Vegetables', 10),
    ('Vegetables', 'Leafy Greens', 20),
    ('Meat', 'Beef', 10),
    ('Meat', 'Pork', 20),
    ('Meat', 'Poultry', 30),
    ('Meat', 'Lamb', 40),
    ('Seafood', 'Fish', 10),
    ('Seafood', 'Shellfish', 20),
    ('Bakery', 'Bread', 10),
    ('Bakery', 'Pastries', 20),
    ('Pasta & Rice', 'Pasta', 10),
    ('Pasta & Rice', 'Rice', 20),
    ('Pasta & Rice', 'Noodles', 30),
    ('Herbs & Spices', 'Herbs', 10),
    ('Herbs & Spices', 'Spices', 20),
    ('Beverages', 'Juice', 10),
    ('Beverages', 'Soft Drinks', 20),
    ('Beverages', 'Water', 30),
    ('Beverages', 'Tea & Coffee', 40),
    ('Baking', 'Flour', 10),
    ('Baking', 'Sugar', 20)
) AS sub(category_name, name, display_order) ON sub.category_name = c.name;

INSERT INTO public.storage_locations (name, icon, display_order) VALUES
  ('Fridge', '🧊', 10),
  ('Freezer', '❄️', 20),
  ('Cupboard', '🗄️', 30),
  ('Pantry', '🥫', 40),
  ('Drinks Cabinet', '🍷', 50),
  ('Cellar', '🍾', 60);

ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view food categories"
  ON public.food_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage food categories"
  ON public.food_categories FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Authenticated users can view food subcategories"
  ON public.food_subcategories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage food subcategories"
  ON public.food_subcategories FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Authenticated users can view storage locations"
  ON public.storage_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage storage locations"
  ON public.storage_locations FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
