-- Food Knowledge Graph V2 - Community classification model
-- Moves food classification from free text to the controlled taxonomy (by id),
-- adds monotonic classification_version + taxonomy_version, and rebuilds the
-- learning RPCs to speak ids and to learn anonymous storage-location defaults.

-- 1. Schema additions ---------------------------------------------------------

ALTER TABLE public.community_foods
  ADD COLUMN IF NOT EXISTS food_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS food_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS classification_version bigint NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS taxonomy_version integer NOT NULL DEFAULT 1;

ALTER TABLE public.community_food_votes
  ADD COLUMN IF NOT EXISTS food_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS food_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS storage_location_id uuid REFERENCES public.storage_locations (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS community_foods_food_category_idx
  ON public.community_foods (food_category_id);
CREATE INDEX IF NOT EXISTS community_food_votes_storage_idx
  ON public.community_food_votes (community_food_id, storage_location_id);

-- 2. classification_version bump trigger --------------------------------------
-- Bumps only when a classification-relevant field changes, so unrelated writes
-- do not trigger needless pantry cache refreshes.

CREATE OR REPLACE FUNCTION public.community_foods_bump_classification_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.food_category_id IS DISTINCT FROM OLD.food_category_id)
     OR (NEW.food_subcategory_id IS DISTINCT FROM OLD.food_subcategory_id)
     OR (NEW.confidence_score IS DISTINCT FROM OLD.confidence_score)
     OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    NEW.classification_version := OLD.classification_version + 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS community_foods_classification_version ON public.community_foods;
CREATE TRIGGER community_foods_classification_version
  BEFORE UPDATE ON public.community_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.community_foods_bump_classification_version();

-- 3. Backfill legacy free-text categories into the controlled taxonomy --------

UPDATE public.community_foods cf
SET food_category_id = fc.id
FROM public.food_categories fc
WHERE cf.food_category_id IS NULL
  AND cf.primary_category IS NOT NULL
  AND lower(trim(cf.primary_category)) = lower(fc.name);

UPDATE public.community_foods cf
SET food_subcategory_id = fs.id
FROM public.food_subcategories fs
WHERE cf.food_subcategory_id IS NULL
  AND cf.food_category_id = fs.food_category_id
  AND cf.secondary_category IS NOT NULL
  AND lower(trim(cf.secondary_category)) = lower(fs.name);

UPDATE public.community_food_votes v
SET food_category_id = fc.id
FROM public.food_categories fc
WHERE v.food_category_id IS NULL
  AND v.category IS NOT NULL
  AND lower(trim(v.category)) = lower(fc.name);

-- 4. Helper functions ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.community_food_tier(confidence numeric)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN confidence >= 95 THEN 'verified'
    WHEN confidence >= 75 THEN 'community'
    WHEN confidence >= 40 THEN 'learning'
    ELSE 'unclassified'
  END;
$$;

-- Percentage of category votes that agree with the expected category id.
CREATE OR REPLACE FUNCTION public.community_food_category_agreement(
  food_id uuid,
  expected uuid
)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN expected IS NULL THEN 0
    WHEN count(*) FILTER (WHERE food_category_id IS NOT NULL) = 0 THEN 0
    ELSE round(
      (count(*) FILTER (WHERE food_category_id = expected))::numeric
      / (count(*) FILTER (WHERE food_category_id IS NOT NULL))::numeric * 100,
      2
    )
  END
  FROM public.community_food_votes
  WHERE community_food_id = food_id;
$$;

-- 5. Aggregate recompute (single source of confidence + classification) -------

CREATE OR REPLACE FUNCTION public.refresh_community_food_aggregate(food_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  category_mode uuid;
  subcategory_mode uuid;
  unit_mode text;
  shelf_life_mode integer;
  fridge_mode integer;
  freezer_mode integer;
  category_agreement numeric;
  unit_agreement numeric;
  expiry_agreement numeric;
  calculated_confidence numeric;
  vote_total integer;
BEGIN
  SELECT value INTO category_mode FROM (
    SELECT food_category_id AS value, count(*) AS c
    FROM public.community_food_votes
    WHERE community_food_id = food_id AND food_category_id IS NOT NULL
    GROUP BY food_category_id ORDER BY c DESC, food_category_id LIMIT 1
  ) m;

  SELECT value INTO subcategory_mode FROM (
    SELECT food_subcategory_id AS value, count(*) AS c
    FROM public.community_food_votes
    WHERE community_food_id = food_id AND food_subcategory_id IS NOT NULL
    GROUP BY food_subcategory_id ORDER BY c DESC, food_subcategory_id LIMIT 1
  ) m;

  SELECT value INTO unit_mode FROM (
    SELECT unit AS value, count(*) AS c
    FROM public.community_food_votes
    WHERE community_food_id = food_id AND unit IS NOT NULL
    GROUP BY unit ORDER BY c DESC, unit LIMIT 1
  ) m;

  SELECT value INTO shelf_life_mode FROM (
    SELECT shelf_life_days AS value, count(*) AS c
    FROM public.community_food_votes
    WHERE community_food_id = food_id AND shelf_life_days IS NOT NULL
    GROUP BY shelf_life_days ORDER BY c DESC, shelf_life_days LIMIT 1
  ) m;

  SELECT value INTO fridge_mode FROM (
    SELECT fridge_days AS value, count(*) AS c
    FROM public.community_food_votes
    WHERE community_food_id = food_id AND fridge_days IS NOT NULL
    GROUP BY fridge_days ORDER BY c DESC, fridge_days LIMIT 1
  ) m;

  SELECT value INTO freezer_mode FROM (
    SELECT freezer_days AS value, count(*) AS c
    FROM public.community_food_votes
    WHERE community_food_id = food_id AND freezer_days IS NOT NULL
    GROUP BY freezer_days ORDER BY c DESC, freezer_days LIMIT 1
  ) m;

  category_agreement := public.community_food_category_agreement(food_id, category_mode);
  unit_agreement := public.community_food_agreement(food_id, 'unit', unit_mode);
  expiry_agreement := public.community_food_agreement(food_id, 'shelf_life_days', shelf_life_mode::text);

  SELECT count(*) INTO vote_total
  FROM public.community_food_votes
  WHERE community_food_id = food_id;

  calculated_confidence :=
    least(35::numeric, coalesce(vote_total, 0)::numeric * 1.4)
    + coalesce(category_agreement, 0) * 0.25
    + coalesce(unit_agreement, 0) * 0.20
    + coalesce(expiry_agreement, 0) * 0.20;

  UPDATE public.community_foods
  SET
    food_category_id = category_mode,
    food_subcategory_id = subcategory_mode,
    default_unit = coalesce(unit_mode, default_unit),
    default_shelf_life_days = coalesce(shelf_life_mode, default_shelf_life_days),
    default_fridge_life_days = coalesce(fridge_mode, default_fridge_life_days),
    default_freezer_life_days = coalesce(freezer_mode, default_freezer_life_days),
    usage_count = coalesce(vote_total, 0),
    alias_count = (SELECT count(*) FROM public.community_food_aliases WHERE community_food_id = food_id),
    confidence_score = round(greatest(0, least(100, calculated_confidence)), 2),
    review_required = review_required OR (
      coalesce(vote_total, 0) >= 25
      AND category_agreement >= 90
      AND unit_agreement >= 90
    ),
    updated_at = now()
  WHERE id = food_id;
END;
$$;

-- 6. Observation + classification RPCs (id-based) -----------------------------

DROP FUNCTION IF EXISTS public.record_community_food_observation(text, text, text, text, integer, integer, integer);
DROP FUNCTION IF EXISTS public.get_verified_community_food(text);

CREATE OR REPLACE FUNCTION public.record_community_food_observation(
  observed_name text,
  observed_unit text DEFAULT NULL,
  observed_shelf_life_days integer DEFAULT NULL,
  observed_fridge_days integer DEFAULT NULL,
  observed_freezer_days integer DEFAULT NULL,
  observed_storage_location_id uuid DEFAULT NULL,
  observed_food_category_id uuid DEFAULT NULL,
  observed_food_subcategory_id uuid DEFAULT NULL
)
RETURNS TABLE (
  resolved_food_id uuid,
  resolved_confidence numeric,
  resolved_version bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  normalized_observed_name text := public.community_food_normalize(observed_name);
  food public.community_foods%ROWTYPE;
  canonical_food_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF normalized_observed_name IS NULL THEN
    RAISE EXCEPTION 'A food name is required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.community_food_aliases aliases
    WHERE aliases.normalized_alias = normalized_observed_name
  ) THEN
    SELECT foods.* INTO food
    FROM public.community_food_aliases aliases
    JOIN public.community_foods foods ON foods.id = aliases.community_food_id
    WHERE aliases.normalized_alias = normalized_observed_name;
  ELSE
    INSERT INTO public.community_foods (
      canonical_name,
      normalized_name,
      food_category_id,
      food_subcategory_id,
      default_unit,
      default_shelf_life_days,
      default_fridge_life_days,
      default_freezer_life_days
    )
    VALUES (
      trim(observed_name),
      normalized_observed_name,
      observed_food_category_id,
      observed_food_subcategory_id,
      nullif(trim(observed_unit), ''),
      observed_shelf_life_days,
      observed_fridge_days,
      observed_freezer_days
    )
    ON CONFLICT (normalized_name) DO UPDATE
    SET updated_at = now()
    RETURNING * INTO food;
  END IF;

  canonical_food_id := food.id;

  INSERT INTO public.community_food_aliases (
    community_food_id,
    alias,
    normalized_alias,
    usage_count
  )
  VALUES (canonical_food_id, trim(observed_name), normalized_observed_name, 1)
  ON CONFLICT (normalized_alias) DO UPDATE
  SET usage_count = public.community_food_aliases.usage_count + 1;

  INSERT INTO public.community_food_votes (
    community_food_id,
    food_category_id,
    food_subcategory_id,
    unit,
    shelf_life_days,
    fridge_days,
    freezer_days,
    storage_location_id
  )
  VALUES (
    canonical_food_id,
    observed_food_category_id,
    observed_food_subcategory_id,
    nullif(trim(observed_unit), ''),
    observed_shelf_life_days,
    observed_fridge_days,
    observed_freezer_days,
    observed_storage_location_id
  );

  PERFORM public.refresh_community_food_aggregate(canonical_food_id);

  RETURN QUERY
  SELECT foods.id, foods.confidence_score, foods.classification_version
  FROM public.community_foods foods
  WHERE foods.id = canonical_food_id;
END;
$$;

-- Explicit user classification is just an observation carrying category ids.
CREATE OR REPLACE FUNCTION public.classify_community_food(
  observed_name text,
  in_food_category_id uuid,
  in_food_subcategory_id uuid DEFAULT NULL
)
RETURNS TABLE (
  resolved_food_id uuid,
  resolved_confidence numeric,
  resolved_version bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.record_community_food_observation(
    observed_name := observed_name,
    observed_food_category_id := in_food_category_id,
    observed_food_subcategory_id := in_food_subcategory_id
  );
$$;

-- 7. Read RPCs ----------------------------------------------------------------

-- Effective classification for a set of canonical foods. Category is nulled
-- below the learning threshold so callers render "Unclassified".
CREATE OR REPLACE FUNCTION public.get_community_classifications(food_ids uuid[])
RETURNS TABLE (
  canonical_food_id uuid,
  food_category_id uuid,
  food_subcategory_id uuid,
  tier text,
  classification_version bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    f.id,
    CASE WHEN f.confidence_score >= 40 THEN f.food_category_id ELSE NULL END,
    CASE WHEN f.confidence_score >= 40 THEN f.food_subcategory_id ELSE NULL END,
    public.community_food_tier(f.confidence_score),
    f.classification_version
  FROM public.community_foods f
  WHERE f.id = ANY (food_ids);
$$;

-- Resolve a free-text name to its canonical food + effective classification.
CREATE OR REPLACE FUNCTION public.resolve_community_food(search_name text)
RETURNS TABLE (
  canonical_food_id uuid,
  food_category_id uuid,
  food_subcategory_id uuid,
  confidence_score numeric,
  tier text,
  classification_version bigint,
  suggested_storage_location_id uuid,
  default_unit text,
  default_shelf_life_days integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH matches AS (
    SELECT f.*, 0 AS priority
    FROM public.community_foods f
    WHERE f.normalized_name = public.community_food_normalize(search_name)
    UNION ALL
    SELECT f.*, 1 AS priority
    FROM public.community_food_aliases a
    JOIN public.community_foods f ON f.id = a.community_food_id
    WHERE a.normalized_alias = public.community_food_normalize(search_name)
  ),
  resolved AS (
    SELECT * FROM matches ORDER BY priority LIMIT 1
  )
  SELECT
    r.id,
    CASE WHEN r.confidence_score >= 40 THEN r.food_category_id ELSE NULL END,
    CASE WHEN r.confidence_score >= 40 THEN r.food_subcategory_id ELSE NULL END,
    r.confidence_score,
    public.community_food_tier(r.confidence_score),
    r.classification_version,
    (
      SELECT v.storage_location_id
      FROM public.community_food_votes v
      WHERE v.community_food_id = r.id AND v.storage_location_id IS NOT NULL
      GROUP BY v.storage_location_id
      ORDER BY count(*) DESC, v.storage_location_id
      LIMIT 1
    ),
    r.default_unit,
    r.default_shelf_life_days
  FROM resolved r;
$$;

CREATE OR REPLACE FUNCTION public.get_suggested_storage_location(search_name text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.storage_location_id
  FROM public.community_food_votes v
  JOIN (
    SELECT f.id
    FROM public.community_foods f
    WHERE f.normalized_name = public.community_food_normalize(search_name)
    UNION ALL
    SELECT a.community_food_id
    FROM public.community_food_aliases a
    WHERE a.normalized_alias = public.community_food_normalize(search_name)
    LIMIT 1
  ) resolved ON resolved.id = v.community_food_id
  WHERE v.storage_location_id IS NOT NULL
  GROUP BY v.storage_location_id
  ORDER BY count(*) DESC, v.storage_location_id
  LIMIT 1;
$$;

-- 8. Grants -------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.community_food_tier(numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.community_food_category_agreement(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_community_food_observation(text, text, integer, integer, integer, uuid, uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.classify_community_food(text, uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_community_classifications(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_community_food(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_suggested_storage_location(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.community_food_tier(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_community_food_observation(text, text, integer, integer, integer, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.classify_community_food(text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_classifications(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_community_food(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_suggested_storage_location(text) TO authenticated;
