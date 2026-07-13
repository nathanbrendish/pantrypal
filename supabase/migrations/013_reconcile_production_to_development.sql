-- Complete forensic reconciliation: Production -> Development schema parity
--
-- CONTEXT
-- A full forensic audit (read-only introspection of both live databases,
-- comparing tables, columns, types, defaults, PKs, FKs, unique/check
-- constraints, indexes, views, functions, triggers, RLS state, policies,
-- grants, sequences, enums, extensions, and storage buckets) found that
-- Production's actual schema does not match its migration history. Despite
-- supabase_migrations.schema_migrations reporting 001-011 as applied on
-- Production, the following objects that migrations 004-011 should have
-- created were never materialized there:
--
--   * 10 entire tables missing: food_categories, food_subcategories,
--     storage_locations, platform_roles, user_roles, community_foods,
--     community_food_aliases, community_food_votes,
--     community_food_moderation_history, cooking_behavior_observations
--   * 15 of 16 functions missing (only delete_user_account exists)
--   * 1 of 1 triggers missing (community_foods_classification_version)
--   * public.pantry missing 8 columns (category/subcategory from 004;
--     storage_location_id/canonical_food_id/cached_category_id/
--     cached_subcategory_id/classification_version/classification_updated_at
--     from 007), its pantry_items_user_id_idx index from 001, its
--     pantry_user_storage_idx/pantry_canonical_food_idx indexes from 007,
--     and its 4 reconciled FKs from 007
--   * public.shopping_list_items missing 8 columns (needed_for_meals/
--     shortage_label/source from 009; demand_quantity/demand_unit/
--     pantry_quantity/pantry_unit/used_by_meals from 010)
--   * public.pantry's existing RLS policies are present but named
--     differently than Development's (functionally equivalent
--     auth.uid() = user_id checks under different policy names)
--
-- Separately, Production carries an extra legacy table, public.pantry_items,
-- that does not exist in Development at all and is not referenced anywhere
-- in the application (src/). It appears to be an artifact of an earlier
-- version of migration 001 (before the table it creates was renamed from
-- pantry_items to pantry) that was applied to Production before that
-- rename, with no corresponding rename ever migrated. Per the constraint to
-- never perform destructive SQL and never delete user data, this migration
-- does NOT touch public.pantry_items in any way. It is flagged here and in
-- the accompanying report for a deliberate, separate, human decision -- it
-- is not reconciled to match Development because Development's correct
-- state is for it not to exist, and dropping a table that may hold real
-- user rows is explicitly out of scope for an additive reconciliation.
--
-- This migration does NOT modify, replace, or edit migrations 001-012, does
-- NOT edit supabase_migrations.schema_migrations, and does NOT mark any
-- migration as repaired. It is a new, purely additive migration that
-- reconstructs the CURRENT, live definition of every missing or divergent
-- object exactly as it exists in Development today (verified by direct
-- read-only introspection), rather than replaying every historical
-- intermediate migration step. Every statement is idempotent (IF NOT
-- EXISTS / CREATE OR REPLACE / guarded existence checks), so this migration
-- makes zero schema changes when run against Development, and is safe to
-- run repeatedly against either environment.

-- =============================================================================
-- PART A: Tables missing entirely from Production, in dependency order.
-- Each uses CREATE TABLE IF NOT EXISTS with all constraints inline, exactly
-- matching Development's current live definition. A no-op on Development.
-- =============================================================================

-- A1. food_categories (migration 005)
CREATE TABLE IF NOT EXISTS public.food_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  taxonomy_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A2. food_subcategories (migration 005 + substitutable column from 008)
CREATE TABLE IF NOT EXISTS public.food_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_category_id uuid NOT NULL REFERENCES public.food_categories (id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  taxonomy_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  substitutable boolean NOT NULL DEFAULT false,
  CONSTRAINT food_subcategories_category_name_key UNIQUE (food_category_id, name)
);

-- A3. storage_locations (migration 005)
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A4. platform_roles (migration 004)
CREATE TABLE IF NOT EXISTS public.platform_roles (
  role text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_roles_role_format CHECK (role ~ '^[A-Z][A-Z0-9_]{1,63}$')
);

-- A5. user_roles (migration 004)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL REFERENCES public.platform_roles (role) ON UPDATE CASCADE,
  assigned_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_key UNIQUE (user_id, role)
);

-- A6. community_foods (migration 004 base columns + 006 classification columns)
CREATE TABLE IF NOT EXISTS public.community_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  normalized_name text NOT NULL,
  primary_category text,
  secondary_category text,
  default_unit text,
  default_shelf_life_days integer,
  default_fridge_life_days integer,
  default_freezer_life_days integer,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  alias_count integer NOT NULL DEFAULT 0 CHECK (alias_count >= 0),
  confidence_score numeric(5,2) NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  status text NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'verified', 'locked')),
  review_required boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  food_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  food_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  classification_version bigint NOT NULL DEFAULT 1,
  taxonomy_version integer NOT NULL DEFAULT 1,
  CONSTRAINT community_foods_normalized_name_key UNIQUE (normalized_name),
  CONSTRAINT community_foods_shelf_life_nonnegative CHECK (
    (default_shelf_life_days IS NULL OR default_shelf_life_days >= 0)
    AND (default_fridge_life_days IS NULL OR default_fridge_life_days >= 0)
    AND (default_freezer_life_days IS NULL OR default_freezer_life_days >= 0)
  )
);

-- A7. community_food_aliases (migration 004)
CREATE TABLE IF NOT EXISTS public.community_food_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_food_id uuid NOT NULL REFERENCES public.community_foods (id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_food_aliases_normalized_alias_key UNIQUE (normalized_alias)
);

-- A8. community_food_votes (migration 004 base columns + 006 classification/storage columns)
CREATE TABLE IF NOT EXISTS public.community_food_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_food_id uuid NOT NULL REFERENCES public.community_foods (id) ON DELETE CASCADE,
  category text,
  subcategory text,
  unit text,
  shelf_life_days integer,
  fridge_days integer,
  freezer_days integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  food_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  food_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  storage_location_id uuid REFERENCES public.storage_locations (id) ON DELETE SET NULL,
  CONSTRAINT community_food_votes_life_nonnegative CHECK (
    (shelf_life_days IS NULL OR shelf_life_days >= 0)
    AND (fridge_days IS NULL OR fridge_days >= 0)
    AND (freezer_days IS NULL OR freezer_days >= 0)
  )
);

-- A9. community_food_moderation_history (migration 004)
CREATE TABLE IF NOT EXISTS public.community_food_moderation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_food_id uuid NOT NULL REFERENCES public.community_foods (id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'merged', 'locked', 'edited')),
  actor_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  target_community_food_id uuid REFERENCES public.community_foods (id) ON DELETE SET NULL,
  before_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- A10. cooking_behavior_observations (migration 011)
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

-- =============================================================================
-- PART B: Reconcile existing tables (pantry, shopping_list_items) that are
-- present on Production but missing columns/indexes/FKs/correctly-named
-- policies from later migrations.
-- =============================================================================

-- B1. pantry: columns from migrations 004 and 007
ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text;

ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS storage_location_id uuid REFERENCES public.storage_locations (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS canonical_food_id uuid REFERENCES public.community_foods (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cached_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cached_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS classification_version bigint,
  ADD COLUMN IF NOT EXISTS classification_updated_at timestamptz;

-- FK backstop, table-scoped, NOT VALID + VALIDATE CONSTRAINT to avoid holding
-- an ACCESS EXCLUSIVE lock for a full-table validation scan (defends against
-- the case where a column already existed without its FK).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pantry_storage_location_id_fkey' AND conrelid = 'public.pantry'::regclass
  ) THEN
    ALTER TABLE public.pantry
      ADD CONSTRAINT pantry_storage_location_id_fkey
      FOREIGN KEY (storage_location_id) REFERENCES public.storage_locations (id) ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;
ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_storage_location_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pantry_canonical_food_id_fkey' AND conrelid = 'public.pantry'::regclass
  ) THEN
    ALTER TABLE public.pantry
      ADD CONSTRAINT pantry_canonical_food_id_fkey
      FOREIGN KEY (canonical_food_id) REFERENCES public.community_foods (id) ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;
ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_canonical_food_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pantry_cached_category_id_fkey' AND conrelid = 'public.pantry'::regclass
  ) THEN
    ALTER TABLE public.pantry
      ADD CONSTRAINT pantry_cached_category_id_fkey
      FOREIGN KEY (cached_category_id) REFERENCES public.food_categories (id) ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;
ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_cached_category_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pantry_cached_subcategory_id_fkey' AND conrelid = 'public.pantry'::regclass
  ) THEN
    ALTER TABLE public.pantry
      ADD CONSTRAINT pantry_cached_subcategory_id_fkey
      FOREIGN KEY (cached_subcategory_id) REFERENCES public.food_subcategories (id) ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;
ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_cached_subcategory_id_fkey;

-- pantry indexes: pantry_items_user_id_idx from migration 001 was also found
-- missing on Production (table exists, but this specific index never did).
CREATE INDEX IF NOT EXISTS pantry_items_user_id_idx ON public.pantry (user_id);
CREATE INDEX IF NOT EXISTS pantry_user_storage_idx ON public.pantry (user_id, storage_location_id);
CREATE INDEX IF NOT EXISTS pantry_canonical_food_idx ON public.pantry (canonical_food_id);

-- pantry RLS policies exist on Production but under different names than
-- Development's. Data-access behaviour is already identical (same
-- auth.uid() = user_id logic); only the labels differ. Renaming is a
-- metadata-only change -- no data is read, written, or deleted -- and is
-- required for true structural parity. Each rename is guarded so it only
-- fires when the old name exists and the new name does not, making it a
-- no-op on Development (which never had the old names) and a no-op on any
-- re-run of this migration (post-rename, the old name is gone).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pantry' AND policyname = 'Users can view their pantry')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pantry' AND policyname = 'Users can view their own pantry items')
  THEN
    ALTER POLICY "Users can view their pantry" ON public.pantry RENAME TO "Users can view their own pantry items";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pantry' AND policyname = 'Users can insert pantry items')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pantry' AND policyname = 'Users can insert their own pantry items')
  THEN
    ALTER POLICY "Users can insert pantry items" ON public.pantry RENAME TO "Users can insert their own pantry items";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pantry' AND policyname = 'Users can delete pantry items')
     AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'pantry' AND policyname = 'Users can delete their own pantry items')
  THEN
    ALTER POLICY "Users can delete pantry items" ON public.pantry RENAME TO "Users can delete their own pantry items";
  END IF;
END $$;

-- B2. shopping_list_items: columns from migrations 009 and 010
ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS needed_for_meals integer NOT NULL DEFAULT 1
    CHECK (needed_for_meals >= 1),
  ADD COLUMN IF NOT EXISTS shortage_label text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'meal_plan'));

ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS demand_quantity numeric,
  ADD COLUMN IF NOT EXISTS demand_unit text,
  ADD COLUMN IF NOT EXISTS pantry_quantity numeric,
  ADD COLUMN IF NOT EXISTS pantry_unit text,
  ADD COLUMN IF NOT EXISTS used_by_meals jsonb NOT NULL DEFAULT '[]'::jsonb;

-- =============================================================================
-- PART C: Indexes for the new tables that are not already inline UNIQUE
-- constraints in Part A. CREATE INDEX IF NOT EXISTS is a no-op on Development.
-- =============================================================================

CREATE INDEX IF NOT EXISTS food_subcategories_category_idx
  ON public.food_subcategories (food_category_id);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles (role);

CREATE INDEX IF NOT EXISTS community_foods_food_category_idx
  ON public.community_foods (food_category_id);

CREATE INDEX IF NOT EXISTS community_food_aliases_food_id_idx
  ON public.community_food_aliases (community_food_id);
CREATE INDEX IF NOT EXISTS community_food_aliases_usage_count_idx
  ON public.community_food_aliases (usage_count DESC);

CREATE INDEX IF NOT EXISTS community_food_votes_food_id_idx
  ON public.community_food_votes (community_food_id);
CREATE INDEX IF NOT EXISTS community_food_votes_food_created_at_idx
  ON public.community_food_votes (community_food_id, created_at DESC);
CREATE INDEX IF NOT EXISTS community_food_votes_storage_idx
  ON public.community_food_votes (community_food_id, storage_location_id);

CREATE INDEX IF NOT EXISTS community_food_moderation_history_food_idx
  ON public.community_food_moderation_history (community_food_id, created_at DESC);

-- =============================================================================
-- PART D: Functions. CREATE OR REPLACE is inherently idempotent. Bodies are
-- byte-for-byte identical to each function's CURRENT definition (the final,
-- live version on Development after all superseding migrations -- e.g.
-- record_community_food_observation uses migration 006's signature, not
-- migration 004's original, since 006 dropped and replaced it and that is
-- what Development actually runs today).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.community_food_normalize(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT NULLIF(
    regexp_replace(
      trim(lower(regexp_replace(coalesce(value, ''), '[[:punct:]]+', ' ', 'g'))),
      '\s+',
      ' ',
      'g'
    ),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.community_food_agreement(
  food_id uuid,
  field_name text,
  expected_value text
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
  matching_count integer;
BEGIN
  IF expected_value IS NULL THEN
    RETURN 0;
  END IF;

  SELECT
    count(*) FILTER (WHERE value IS NOT NULL),
    count(*) FILTER (WHERE value = expected_value)
  INTO total_count, matching_count
  FROM (
    SELECT CASE field_name
      WHEN 'category' THEN category
      WHEN 'unit' THEN unit
      WHEN 'shelf_life_days' THEN shelf_life_days::text
      ELSE NULL
    END AS value
    FROM public.community_food_votes
    WHERE community_food_id = food_id
  ) votes;

  IF coalesce(total_count, 0) = 0 THEN
    RETURN 0;
  END IF;

  RETURN round((matching_count::numeric / total_count::numeric) * 100, 2);
END;
$$;

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

CREATE OR REPLACE FUNCTION public.refresh_community_food_aggregate(food_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

CREATE OR REPLACE FUNCTION public.is_platform_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_platform_role('SUPER_ADMIN');
$$;

CREATE OR REPLACE FUNCTION public.refresh_stale_pantry_classifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  updated_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  WITH updated AS (
    UPDATE public.pantry p
    SET
      cached_category_id = CASE WHEN f.confidence_score >= 40 THEN f.food_category_id ELSE NULL END,
      cached_subcategory_id = CASE WHEN f.confidence_score >= 40 THEN f.food_subcategory_id ELSE NULL END,
      classification_version = f.classification_version,
      classification_updated_at = now()
    FROM public.community_foods f
    WHERE p.canonical_food_id = f.id
      AND p.user_id = auth.uid()
      AND (p.classification_version IS NULL OR f.classification_version > p.classification_version)
    RETURNING p.id
  )
  SELECT count(*) INTO updated_count FROM updated;

  RETURN updated_count;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- =============================================================================
-- PART E: Trigger (migration 006). Depends on community_foods table (Part A6)
-- and community_foods_bump_classification_version() (Part D), both created
-- above. DROP TRIGGER IF EXISTS + CREATE TRIGGER is idempotent by construction.
-- =============================================================================

DROP TRIGGER IF EXISTS community_foods_classification_version ON public.community_foods;
CREATE TRIGGER community_foods_classification_version
  BEFORE UPDATE ON public.community_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.community_foods_bump_classification_version();

-- =============================================================================
-- PART F: RLS enable + policies for the new tables. ENABLE ROW LEVEL SECURITY
-- is idempotent natively. CREATE POLICY has no native IF NOT EXISTS, so each
-- is guarded by a pg_policies existence check. Placed after Part D because
-- several policies call public.is_super_admin(), which must already exist
-- for CREATE POLICY's expression validation to succeed.
-- =============================================================================

ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_food_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_food_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_food_moderation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_behavior_observations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'food_categories' AND policyname = 'Authenticated users can view food categories') THEN
    CREATE POLICY "Authenticated users can view food categories"
      ON public.food_categories FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'food_categories' AND policyname = 'Super admins can manage food categories') THEN
    CREATE POLICY "Super admins can manage food categories"
      ON public.food_categories FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'food_subcategories' AND policyname = 'Authenticated users can view food subcategories') THEN
    CREATE POLICY "Authenticated users can view food subcategories"
      ON public.food_subcategories FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'food_subcategories' AND policyname = 'Super admins can manage food subcategories') THEN
    CREATE POLICY "Super admins can manage food subcategories"
      ON public.food_subcategories FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'storage_locations' AND policyname = 'Authenticated users can view storage locations') THEN
    CREATE POLICY "Authenticated users can view storage locations"
      ON public.storage_locations FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'storage_locations' AND policyname = 'Super admins can manage storage locations') THEN
    CREATE POLICY "Super admins can manage storage locations"
      ON public.storage_locations FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'platform_roles' AND policyname = 'Authenticated users can view platform role definitions') THEN
    CREATE POLICY "Authenticated users can view platform role definitions"
      ON public.platform_roles FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Super admins can manage user roles') THEN
    CREATE POLICY "Super admins can manage user roles"
      ON public.user_roles FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_foods' AND policyname = 'Super admins can manage community foods') THEN
    CREATE POLICY "Super admins can manage community foods"
      ON public.community_foods FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_food_aliases' AND policyname = 'Super admins can manage community aliases') THEN
    CREATE POLICY "Super admins can manage community aliases"
      ON public.community_food_aliases FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_food_votes' AND policyname = 'Super admins can view community votes') THEN
    CREATE POLICY "Super admins can view community votes"
      ON public.community_food_votes FOR SELECT
      TO authenticated
      USING (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_food_moderation_history' AND policyname = 'Super admins can view moderation history') THEN
    CREATE POLICY "Super admins can view moderation history"
      ON public.community_food_moderation_history FOR SELECT
      TO authenticated
      USING (public.is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cooking_behavior_observations' AND policyname = 'Authenticated users can record anonymous cooking observations') THEN
    CREATE POLICY "Authenticated users can record anonymous cooking observations"
      ON public.cooking_behavior_observations FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- =============================================================================
-- PART G: Function grants. REVOKE/GRANT are naturally idempotent (re-running
-- either never errors). Only current, live function signatures are granted
-- here -- migration 004's original (now-superseded) signature for
-- record_community_food_observation, and the now-dropped
-- get_verified_community_food, are intentionally NOT replayed, since neither
-- exists in Development's current schema and attempting to grant on a
-- nonexistent signature would raise "function does not exist".
-- =============================================================================

REVOKE ALL ON FUNCTION public.is_platform_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.community_food_normalize(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.community_food_agreement(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_community_food_aggregate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_food_normalize(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_community_food_aggregate(uuid) TO authenticated;

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

REVOKE ALL ON FUNCTION public.resolve_community_foods(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_community_foods(text[]) TO authenticated;

REVOKE ALL ON FUNCTION public.refresh_stale_pantry_classifications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_stale_pantry_classifications() TO authenticated;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- =============================================================================
-- PART H: Seed / reference data. Every statement is purely additive
-- (ON CONFLICT DO NOTHING or a no-op UPDATE by value), touches no existing
-- row's identity, and never deletes anything. Required for functional (not
-- just structural) parity: these lookup tables back real UI dropdowns and
-- classification logic. Placed after Part D because the community_foods
-- seed insert calls public.community_food_normalize().
-- =============================================================================

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
  ('Baking', '🧁', 170)
ON CONFLICT (name) DO NOTHING;

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
) AS sub(category_name, name, display_order) ON sub.category_name = c.name
ON CONFLICT (food_category_id, name) DO NOTHING;

INSERT INTO public.storage_locations (name, icon, display_order) VALUES
  ('Fridge', '🧊', 10),
  ('Freezer', '❄️', 20),
  ('Cupboard', '🗄️', 30),
  ('Pantry', '🥫', 40),
  ('Drinks Cabinet', '🍷', 50),
  ('Cellar', '🍾', 60)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.platform_roles (role)
VALUES ('USER'), ('SUPER_ADMIN')
ON CONFLICT (role) DO NOTHING;

-- Seed the two substitutable families the product explicitly calls out
-- (migration 008). Re-running this UPDATE with the same value is a no-op.
UPDATE public.food_subcategories fs
SET substitutable = true
FROM public.food_categories fc
WHERE fs.food_category_id = fc.id
  AND (
    (fc.name = 'Pasta & Rice' AND fs.name = 'Pasta')
    OR (fc.name = 'Dairy' AND fs.name = 'Cheese')
  );

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

-- =============================================================================
-- PART I: Comprehensive post-flight verification. Aborts (rolling back this
-- entire migration) rather than silently leaving either environment
-- inconsistent, if any expected object is still missing or malformed.
-- =============================================================================

DO $$
DECLARE
  missing_tables text[];
  missing_columns text[];
  type_mismatches text[];
  missing_fks text[];
  unvalidated_fks text[];
  missing_indexes text[];
  missing_functions text[];
  missing_trigger text[];
  missing_rls text[];
  missing_policies text[];
  low_seed_counts text[];
BEGIN
  -- A. Tables
  SELECT array_agg(t) INTO missing_tables
  FROM unnest(ARRAY[
    'food_categories','food_subcategories','storage_locations','platform_roles',
    'user_roles','community_foods','community_food_aliases','community_food_votes',
    'community_food_moderation_history','cooking_behavior_observations'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  -- B. Reconciled columns on pantry + shopping_list_items (existence)
  SELECT array_agg(tc) INTO missing_columns
  FROM unnest(ARRAY[
    'pantry.category','pantry.subcategory','pantry.storage_location_id',
    'pantry.canonical_food_id','pantry.cached_category_id','pantry.cached_subcategory_id',
    'pantry.classification_version','pantry.classification_updated_at',
    'shopping_list_items.needed_for_meals','shopping_list_items.shortage_label',
    'shopping_list_items.source','shopping_list_items.demand_quantity',
    'shopping_list_items.demand_unit','shopping_list_items.pantry_quantity',
    'shopping_list_items.pantry_unit','shopping_list_items.used_by_meals'
  ]) AS tc
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = split_part(tc, '.', 1)
      AND column_name = split_part(tc, '.', 2)
  );

  -- C. Data types for the same reconciled columns
  SELECT array_agg(
    expected.tc || ' (expected ' || expected.expected_type || ', found ' || actual.data_type || ')'
  ) INTO type_mismatches
  FROM (
    VALUES
      ('pantry.category', 'text'),
      ('pantry.subcategory', 'text'),
      ('pantry.storage_location_id', 'uuid'),
      ('pantry.canonical_food_id', 'uuid'),
      ('pantry.cached_category_id', 'uuid'),
      ('pantry.cached_subcategory_id', 'uuid'),
      ('pantry.classification_version', 'bigint'),
      ('pantry.classification_updated_at', 'timestamp with time zone'),
      ('shopping_list_items.needed_for_meals', 'integer'),
      ('shopping_list_items.shortage_label', 'text'),
      ('shopping_list_items.source', 'text'),
      ('shopping_list_items.demand_quantity', 'numeric'),
      ('shopping_list_items.demand_unit', 'text'),
      ('shopping_list_items.pantry_quantity', 'numeric'),
      ('shopping_list_items.pantry_unit', 'text'),
      ('shopping_list_items.used_by_meals', 'jsonb')
  ) AS expected (tc, expected_type)
  JOIN information_schema.columns actual
    ON actual.table_schema = 'public'
    AND actual.table_name = split_part(expected.tc, '.', 1)
    AND actual.column_name = split_part(expected.tc, '.', 2)
  WHERE actual.data_type <> expected.expected_type;

  -- D. Foreign keys on pantry (existence, table-scoped)
  SELECT array_agg(fk) INTO missing_fks
  FROM unnest(ARRAY[
    'pantry_storage_location_id_fkey','pantry_canonical_food_id_fkey',
    'pantry_cached_category_id_fkey','pantry_cached_subcategory_id_fkey'
  ]) AS fk
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = fk AND conrelid = 'public.pantry'::regclass
  );

  -- E. Those same FKs must be fully validated, not left NOT VALID
  SELECT array_agg(fk) INTO unvalidated_fks
  FROM unnest(ARRAY[
    'pantry_storage_location_id_fkey','pantry_canonical_food_id_fkey',
    'pantry_cached_category_id_fkey','pantry_cached_subcategory_id_fkey'
  ]) AS fk
  WHERE EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = fk AND conrelid = 'public.pantry'::regclass AND NOT convalidated
  );

  -- F. Indexes
  SELECT array_agg(idx) INTO missing_indexes
  FROM unnest(ARRAY[
    'pantry_items_user_id_idx','pantry_user_storage_idx','pantry_canonical_food_idx',
    'food_subcategories_category_idx','user_roles_user_id_idx','user_roles_role_idx',
    'community_foods_food_category_idx','community_food_aliases_food_id_idx',
    'community_food_aliases_usage_count_idx','community_food_votes_food_id_idx',
    'community_food_votes_food_created_at_idx','community_food_votes_storage_idx',
    'community_food_moderation_history_food_idx'
  ]) AS idx
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = idx
  );

  -- G. Functions
  SELECT array_agg(sig) INTO missing_functions
  FROM unnest(ARRAY[
    'public.community_food_normalize(text)',
    'public.community_food_agreement(uuid,text,text)',
    'public.community_food_tier(numeric)',
    'public.community_food_category_agreement(uuid,uuid)',
    'public.refresh_community_food_aggregate(uuid)',
    'public.record_community_food_observation(text,text,integer,integer,integer,uuid,uuid,uuid)',
    'public.classify_community_food(text,uuid,uuid)',
    'public.get_community_classifications(uuid[])',
    'public.resolve_community_food(text)',
    'public.get_suggested_storage_location(text)',
    'public.resolve_community_foods(text[])',
    'public.is_platform_role(text)',
    'public.is_super_admin()',
    'public.refresh_stale_pantry_classifications()',
    'public.community_foods_bump_classification_version()',
    'public.delete_user_account()'
  ]) AS sig
  WHERE to_regprocedure(sig) IS NULL;

  -- H. Trigger
  SELECT array_agg('community_foods_classification_version'::text) INTO missing_trigger
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE c.relname = 'community_foods' AND t.tgname = 'community_foods_classification_version'
      AND NOT t.tgisinternal
  );

  -- I. RLS enabled on all reconciled tables
  SELECT array_agg(t) INTO missing_rls
  FROM unnest(ARRAY[
    'food_categories','food_subcategories','storage_locations','platform_roles',
    'user_roles','community_foods','community_food_aliases','community_food_votes',
    'community_food_moderation_history','cooking_behavior_observations'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = t AND c.relrowsecurity
  );

  -- J. A representative policy per reconciled table, plus pantry's renamed policies
  SELECT array_agg(tp) INTO missing_policies
  FROM unnest(ARRAY[
    'food_categories:Super admins can manage food categories',
    'food_subcategories:Super admins can manage food subcategories',
    'storage_locations:Super admins can manage storage locations',
    'platform_roles:Authenticated users can view platform role definitions',
    'user_roles:Super admins can manage user roles',
    'community_foods:Super admins can manage community foods',
    'community_food_aliases:Super admins can manage community aliases',
    'community_food_votes:Super admins can view community votes',
    'community_food_moderation_history:Super admins can view moderation history',
    'cooking_behavior_observations:Authenticated users can record anonymous cooking observations',
    'pantry:Users can view their own pantry items',
    'pantry:Users can insert their own pantry items',
    'pantry:Users can delete their own pantry items'
  ]) AS tp
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = split_part(tp, ':', 1)
      AND policyname = split_part(tp, ':', 2)
  );

  -- K. Seed/reference data present in at least expected minimum quantities
  SELECT array_agg(chk) INTO low_seed_counts
  FROM (
    SELECT 'food_categories >= 17' AS chk WHERE (SELECT count(*) FROM public.food_categories) < 17
    UNION ALL
    SELECT 'storage_locations >= 6' WHERE (SELECT count(*) FROM public.storage_locations) < 6
    UNION ALL
    SELECT 'platform_roles >= 2' WHERE (SELECT count(*) FROM public.platform_roles) < 2
    UNION ALL
    SELECT 'community_foods >= 17' WHERE (SELECT count(*) FROM public.community_foods) < 17
  ) checks;

  IF missing_tables IS NOT NULL OR missing_columns IS NOT NULL OR type_mismatches IS NOT NULL
    OR missing_fks IS NOT NULL OR unvalidated_fks IS NOT NULL OR missing_indexes IS NOT NULL
    OR missing_functions IS NOT NULL OR missing_trigger IS NOT NULL OR missing_rls IS NOT NULL
    OR missing_policies IS NOT NULL OR low_seed_counts IS NOT NULL
  THEN
    RAISE EXCEPTION
      E'Migration 013 failed to fully reconcile Production to Development.\n'
      'missing_tables=%\nmissing_columns=%\ntype_mismatches=%\nmissing_fks=%\n'
      'unvalidated_fks=%\nmissing_indexes=%\nmissing_functions=%\nmissing_trigger=%\n'
      'missing_rls=%\nmissing_policies=%\nlow_seed_counts=%',
      missing_tables, missing_columns, type_mismatches, missing_fks,
      unvalidated_fks, missing_indexes, missing_functions, missing_trigger,
      missing_rls, missing_policies, low_seed_counts;
  END IF;
END $$;
