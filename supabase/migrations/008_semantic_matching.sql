-- Food Knowledge Graph V2 - Semantic matching foundation
-- Enables recipe/shopping matching to use canonical foods and interchangeable
-- ingredient families instead of raw string matching.
--
-- Design:
--   * `substitutable` on food_subcategories declares which subcategories are
--     interchangeable families (e.g. Pasta covers Macaroni/Penne/Spaghetti,
--     Cheese covers Cheddar/Mozzarella). This is admin-controlled data, NOT a
--     hardcoded synonym list, so recipe quality stays under editorial control.
--   * `resolve_community_foods` batch-projects the knowledge graph onto the
--     exact ingredient/pantry strings in play, in one round-trip.
--   * A focused starter seed classifies the two demonstrated families so the
--     feature works out of the box; the community keeps improving it over time.

-- 1. Interchangeable-family flag ----------------------------------------------

ALTER TABLE public.food_subcategories
  ADD COLUMN IF NOT EXISTS substitutable boolean NOT NULL DEFAULT false;

-- Seed the two families the product explicitly calls out. Everything else
-- stays non-substitutable (e.g. Onion must never satisfy Garlic).
UPDATE public.food_subcategories fs
SET substitutable = true
FROM public.food_categories fc
WHERE fs.food_category_id = fc.id
  AND (
    (fc.name = 'Pasta & Rice' AND fs.name = 'Pasta')
    OR (fc.name = 'Dairy' AND fs.name = 'Cheese')
  );

-- 2. Batch resolver -----------------------------------------------------------
-- Returns one row per input name with its canonical food + effective (>= 40
-- confidence) classification. Names not in the graph return NULL columns so the
-- caller can fall back to string matching.

CREATE OR REPLACE FUNCTION public.resolve_community_foods(search_names text[])
RETURNS TABLE (
  input_name text,
  canonical_food_id uuid,
  food_category_id uuid,
  food_subcategory_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    n.name AS input_name,
    r.canonical_food_id,
    r.food_category_id,
    r.food_subcategory_id
  FROM unnest(search_names) AS n(name)
  LEFT JOIN LATERAL public.resolve_community_food(n.name) r ON true;
$$;

REVOKE ALL ON FUNCTION public.resolve_community_foods(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_community_foods(text[]) TO authenticated;

-- 3. Starter knowledge-graph seed ---------------------------------------------
-- Distinct canonical foods (Macaroni != Spaghetti) that share a substitutable
-- subcategory, so family matching resolves them to one another. Seeded as
-- verified with full confidence; refresh_community_food_aggregate is never
-- called on these rows, so the classification stays authoritative.

INSERT INTO public.community_foods (
  canonical_name,
  normalized_name,
  food_category_id,
  food_subcategory_id,
  confidence_score,
  status,
  usage_count
)
SELECT
  v.name,
  public.community_food_normalize(v.name),
  fc.id,
  fs.id,
  100,
  'verified',
  25
FROM (
  VALUES
    ('Pasta', 'Pasta & Rice', 'Pasta'),
    ('Macaroni', 'Pasta & Rice', 'Pasta'),
    ('Penne', 'Pasta & Rice', 'Pasta'),
    ('Rigatoni', 'Pasta & Rice', 'Pasta'),
    ('Spaghetti', 'Pasta & Rice', 'Pasta'),
    ('Fusilli', 'Pasta & Rice', 'Pasta'),
    ('Tagliatelle', 'Pasta & Rice', 'Pasta'),
    ('Linguine', 'Pasta & Rice', 'Pasta'),
    ('Lasagne', 'Pasta & Rice', 'Pasta'),
    ('Fettuccine', 'Pasta & Rice', 'Pasta'),
    ('Cheese', 'Dairy', 'Cheese'),
    ('Cheddar', 'Dairy', 'Cheese'),
    ('Mozzarella', 'Dairy', 'Cheese'),
    ('Parmesan', 'Dairy', 'Cheese'),
    ('Feta', 'Dairy', 'Cheese'),
    ('Gouda', 'Dairy', 'Cheese'),
    ('Brie', 'Dairy', 'Cheese')
) AS v(name, cat, sub)
JOIN public.food_categories fc ON fc.name = v.cat
JOIN public.food_subcategories fs
  ON fs.name = v.sub AND fs.food_category_id = fc.id
ON CONFLICT (normalized_name) DO NOTHING;
