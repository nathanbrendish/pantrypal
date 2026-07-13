-- Defensive, forward-only hardening of migration 012's undeclared
-- prerequisite dependency. Does NOT edit 012's file content and does NOT
-- mark 012 as applied without running it -- both are explicitly out of
-- bounds for this engagement. This is a new, additive, permanent migration.
--
-- CONTEXT
-- Migration 012 (012_reconcile_production_schema.sql) adds four FK-bearing
-- columns to public.pantry using an inline REFERENCES clause:
--   storage_location_id  -> public.storage_locations
--   canonical_food_id     -> public.community_foods
--   cached_category_id    -> public.food_categories
--   cached_subcategory_id -> public.food_subcategories
-- Postgres validates the REFERENCES target at ALTER TABLE execution time.
-- "ADD COLUMN IF NOT EXISTS" only guards against the *column* already
-- existing; it does not defer or skip validation of the REFERENCES target
-- when the column does not yet exist. When migration 012 was first
-- attempted against Production (forensic audit found migrations 004-011
-- had not actually materialized there, despite being marked applied), it
-- failed immediately with "relation \"public.storage_locations\" does not
-- exist" and its entire transaction rolled back -- Production was left
-- completely unchanged, no partial damage.
--
-- Migration 013 (013_reconcile_production_to_development.sql) already
-- creates all four of those prerequisite tables, and every one of its
-- statements is idempotent. Once 013's effects are present in a database
-- (via the normal migration pipeline, or a one-time direct pre-application
-- ahead of a `db push` batch when unblocking an existing, already-affected
-- environment), migration 012 succeeds entirely on its own, completely
-- unmodified, because by the time it runs its "ADD COLUMN IF NOT EXISTS
-- ... REFERENCES ..." targets already exist and Postgres's own
-- IF-NOT-EXISTS short-circuit means the REFERENCES clause for an
-- already-existing column is never re-evaluated at all.
--
-- This migration exists for the one scenario that arrangement cannot
-- cover: a brand-new, from-scratch replay of migration history
-- (001 -> 002 -> ... -> 012) where 012 will still fail on its very first
-- run, before 013 or this file ever gets a chance to execute, because a
-- migration runner stops the entire batch at the first failing statement.
-- Nothing numbered after 012 can prevent 012 itself from failing in that
-- specific scenario -- that limitation is accepted and permanent. What
-- this migration guarantees instead is that pantry converges to the exact
-- same final shape 012 was always meant to produce, on any database where
-- it is reached at all (i.e. every database that didn't hard-stop at 012),
-- and that it can never itself cause a migration batch to fail: each
-- FK-bearing column is only added, together with its foreign key, if its
-- referenced table actually exists; if not, that one column is skipped
-- with a NOTICE instead of raising an error. It is a pure no-op wherever
-- migration 012 (or 013) already completed successfully -- including
-- Development today.

-- category / subcategory (migration 004) and the two FK-free columns from
-- migration 007 have no prerequisite-table dependency and are safe
-- unconditionally, exactly as in migration 012.
ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text;

ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS classification_version bigint,
  ADD COLUMN IF NOT EXISTS classification_updated_at timestamptz;

-- Each of the four FK-bearing columns below is added, together with its
-- foreign key (NOT VALID + separate VALIDATE CONSTRAINT, for the same
-- locking reasons documented in migration 012), only if its referenced
-- table exists. If the table is missing, the column is skipped with a
-- NOTICE rather than raising an error.

DO $$
BEGIN
  IF to_regclass('public.storage_locations') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = 'storage_location_id'
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD COLUMN storage_location_id uuid REFERENCES public.storage_locations (id) ON DELETE SET NULL';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'pantry_storage_location_id_fkey' AND conrelid = 'public.pantry'::regclass
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD CONSTRAINT pantry_storage_location_id_fkey FOREIGN KEY (storage_location_id) REFERENCES public.storage_locations (id) ON DELETE SET NULL NOT VALID';
    END IF;
    EXECUTE 'ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_storage_location_id_fkey';
  ELSE
    RAISE NOTICE 'Skipping public.pantry.storage_location_id: public.storage_locations does not exist yet';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.community_foods') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = 'canonical_food_id'
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD COLUMN canonical_food_id uuid REFERENCES public.community_foods (id) ON DELETE SET NULL';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'pantry_canonical_food_id_fkey' AND conrelid = 'public.pantry'::regclass
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD CONSTRAINT pantry_canonical_food_id_fkey FOREIGN KEY (canonical_food_id) REFERENCES public.community_foods (id) ON DELETE SET NULL NOT VALID';
    END IF;
    EXECUTE 'ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_canonical_food_id_fkey';
  ELSE
    RAISE NOTICE 'Skipping public.pantry.canonical_food_id: public.community_foods does not exist yet';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.food_categories') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = 'cached_category_id'
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD COLUMN cached_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'pantry_cached_category_id_fkey' AND conrelid = 'public.pantry'::regclass
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD CONSTRAINT pantry_cached_category_id_fkey FOREIGN KEY (cached_category_id) REFERENCES public.food_categories (id) ON DELETE SET NULL NOT VALID';
    END IF;
    EXECUTE 'ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_cached_category_id_fkey';
  ELSE
    RAISE NOTICE 'Skipping public.pantry.cached_category_id: public.food_categories does not exist yet';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.food_subcategories') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = 'cached_subcategory_id'
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD COLUMN cached_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'pantry_cached_subcategory_id_fkey' AND conrelid = 'public.pantry'::regclass
    ) THEN
      EXECUTE 'ALTER TABLE public.pantry ADD CONSTRAINT pantry_cached_subcategory_id_fkey FOREIGN KEY (cached_subcategory_id) REFERENCES public.food_subcategories (id) ON DELETE SET NULL NOT VALID';
    END IF;
    EXECUTE 'ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_cached_subcategory_id_fkey';
  ELSE
    RAISE NOTICE 'Skipping public.pantry.cached_subcategory_id: public.food_subcategories does not exist yet';
  END IF;
END $$;

-- Indexes from migration 007: no prerequisite-table dependency, safe
-- unconditionally.
CREATE INDEX IF NOT EXISTS pantry_user_storage_idx
  ON public.pantry (user_id, storage_location_id);
CREATE INDEX IF NOT EXISTS pantry_canonical_food_idx
  ON public.pantry (canonical_food_id);

-- refresh_stale_pantry_classifications: CREATE OR REPLACE is inherently
-- idempotent, and being plpgsql, its body is not validated against table
-- existence at creation time -- safe unconditionally, byte-for-byte
-- identical to migrations 007/012/013.
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

REVOKE ALL ON FUNCTION public.refresh_stale_pantry_classifications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_stale_pantry_classifications() TO authenticated;

-- Verification: unconditional pieces must always be present. Each
-- FK-bearing column/FK pair is only required if its referenced table
-- exists -- mirroring the exact same guard used to add it above, so this
-- migration can never fail due to a prerequisite that genuinely isn't
-- there yet, while still catching any *other* unexpected inconsistency.
DO $$
DECLARE
  missing_unconditional text[];
  missing_conditional text[];
  unvalidated_fks text[];
  missing_indexes text[];
BEGIN
  SELECT array_agg(col) INTO missing_unconditional
  FROM unnest(ARRAY[
    'category', 'subcategory', 'classification_version', 'classification_updated_at'
  ]) AS col
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = col
  );

  SELECT array_agg(chk.label) INTO missing_conditional
  FROM (
    VALUES
      ('storage_location_id / pantry_storage_location_id_fkey', 'public.storage_locations', 'storage_location_id', 'pantry_storage_location_id_fkey'),
      ('canonical_food_id / pantry_canonical_food_id_fkey', 'public.community_foods', 'canonical_food_id', 'pantry_canonical_food_id_fkey'),
      ('cached_category_id / pantry_cached_category_id_fkey', 'public.food_categories', 'cached_category_id', 'pantry_cached_category_id_fkey'),
      ('cached_subcategory_id / pantry_cached_subcategory_id_fkey', 'public.food_subcategories', 'cached_subcategory_id', 'pantry_cached_subcategory_id_fkey')
  ) AS chk (label, prereq_table, column_name, fk_name)
  WHERE to_regclass(chk.prereq_table) IS NOT NULL
    AND (
      NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = chk.column_name
      )
      OR NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = chk.fk_name AND conrelid = 'public.pantry'::regclass
      )
    );

  SELECT array_agg(fk) INTO unvalidated_fks
  FROM unnest(ARRAY[
    'pantry_storage_location_id_fkey', 'pantry_canonical_food_id_fkey',
    'pantry_cached_category_id_fkey', 'pantry_cached_subcategory_id_fkey'
  ]) AS fk
  WHERE EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = fk AND conrelid = 'public.pantry'::regclass AND NOT convalidated
  );

  SELECT array_agg(idx) INTO missing_indexes
  FROM unnest(ARRAY['pantry_user_storage_idx', 'pantry_canonical_food_idx']) AS idx
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'pantry' AND indexname = idx
  );

  IF missing_unconditional IS NOT NULL OR missing_conditional IS NOT NULL
    OR unvalidated_fks IS NOT NULL OR missing_indexes IS NOT NULL
  THEN
    RAISE EXCEPTION
      'Migration 014 failed. missing_unconditional=%, missing_conditional (prerequisite table existed but reconciliation still incomplete)=%, unvalidated_fks=%, missing_indexes=%',
      missing_unconditional, missing_conditional, unvalidated_fks, missing_indexes;
  END IF;

  IF to_regprocedure('public.refresh_stale_pantry_classifications()') IS NULL THEN
    RAISE EXCEPTION 'Migration 014 failed: public.refresh_stale_pantry_classifications() does not exist';
  END IF;
END $$;
