-- Reconcile production schema drift on public.pantry
--
-- CONTEXT
-- Migration history reports 001-011 as applied on both Development and
-- Production, but Production's `pantry` table does not match Development's
-- 16-column schema. Investigation traced every column back to its origin:
--   001 (4 cols) + 002 (4 cols) + 004 (2 cols) + 007 (6 cols) = 16 cols.
-- Production is missing the 2 columns from migration 004 and the 6 columns
-- (plus dependent FKs / indexes / function) from migration 007, even though
-- both migrations are marked as applied. Symptom in the application:
--   "Could not find the 'cached_category_id' column of 'pantry' in the
--    schema cache"
--
-- This migration does NOT rewrite, edit, or replace migrations 004 or 007.
-- It is a new, additive, fully idempotent migration that re-asserts the
-- end-state those two migrations should have produced. Every statement
-- below is safe to run repeatedly and safe to run on a database where 004
-- and 007 already applied correctly (Development): every clause is a no-op
-- there, so running this migration changes nothing on Development and
-- brings Production to schema parity with Development.
--
-- No column is dropped, renamed, or altered destructively anywhere in this
-- file. No existing data is touched except the self-healing UPDATE that
-- already lived inside refresh_stale_pantry_classifications() (unchanged
-- logic, just re-declared via CREATE OR REPLACE).
--
-- Revision note (production-readiness review): every pg_constraint lookup
-- below is scoped to conrelid = 'public.pantry'::regclass (constraint names
-- are only unique per-table in Postgres, not database-wide, so an unscoped
-- name check is not a precise existence check). The FK backstop in section 3
-- now adds constraints NOT VALID and validates them in a separate statement,
-- so the potentially expensive full-table validation scan runs under a
-- SHARE UPDATE EXCLUSIVE lock (does not block reads/writes) instead of the
-- ACCESS EXCLUSIVE lock held for the duration of a validating ADD CONSTRAINT.
-- Section 6 now also verifies column data types and FK validation state, not
-- just presence, so a passing run is stronger evidence of true schema parity.

-- ---------------------------------------------------------------------------
-- 1. Deprecated free-text classification columns (from migration 004)
--
-- `category` / `subcategory` are superseded by the id-based
-- `cached_category_id` / `cached_subcategory_id` added in 007, and are no
-- longer written by the application. They are still part of Development's
-- live schema (no cleanup migration has dropped them yet), so Production
-- must carry them too for the two schemas to be identical.
-- ---------------------------------------------------------------------------

ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text;

-- ---------------------------------------------------------------------------
-- 2. Storage location + classification cache columns (from migration 007)
-- ---------------------------------------------------------------------------

ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS storage_location_id uuid REFERENCES public.storage_locations (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS canonical_food_id uuid REFERENCES public.community_foods (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cached_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cached_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS classification_version bigint,
  ADD COLUMN IF NOT EXISTS classification_updated_at timestamptz;

-- ---------------------------------------------------------------------------
-- 3. Foreign keys, checked independently of column creation.
--
-- Defends against the edge case where a column exists (e.g. added by a
-- partially-applied prior run) but its constraint does not: ADD COLUMN
-- IF NOT EXISTS silently skips the whole clause -- including the inline
-- REFERENCES -- once the column is present, so the FK must be verified
-- and (re)created separately. Constraint names below match Postgres's
-- default auto-generated name for a single-column FK
-- (<table>_<column>_fkey), so this is a genuine no-op wherever the
-- original migration 007 already created the constraint under that name.
-- `category` / `subcategory` (section 1) have no foreign keys in migration
-- 004, so no FK reconciliation is needed for them.
--
-- Every existence check is scoped with `conrelid = 'public.pantry'::regclass`
-- because constraint names are only guaranteed unique per-table in Postgres,
-- not database-wide; an unscoped name match is not a reliable existence
-- check on this specific table.
--
-- Each FK is added with NOT VALID (fast, metadata-only, brief ACCESS
-- EXCLUSIVE lock, no row scan) and then validated in a separate
-- VALIDATE CONSTRAINT statement (SHARE UPDATE EXCLUSIVE lock, does not
-- block concurrent reads/writes while it scans). This avoids holding the
-- table fully locked for the duration of a full-table validation scan,
-- which is the realistic risk in exactly this backstop path if Production
-- data drifted (e.g. orphaned references) while the FK was absent.
-- VALIDATE CONSTRAINT is itself a no-op when the constraint is already
-- valid (including when it was added atomically -- and instantly valid,
-- since new columns start out all NULL -- by section 2 above), so calling
-- it unconditionally after every guarded ADD CONSTRAINT keeps this section
-- fully idempotent.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pantry_storage_location_id_fkey'
      AND conrelid = 'public.pantry'::regclass
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
    WHERE conname = 'pantry_canonical_food_id_fkey'
      AND conrelid = 'public.pantry'::regclass
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
    WHERE conname = 'pantry_cached_category_id_fkey'
      AND conrelid = 'public.pantry'::regclass
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
    WHERE conname = 'pantry_cached_subcategory_id_fkey'
      AND conrelid = 'public.pantry'::regclass
  ) THEN
    ALTER TABLE public.pantry
      ADD CONSTRAINT pantry_cached_subcategory_id_fkey
      FOREIGN KEY (cached_subcategory_id) REFERENCES public.food_subcategories (id) ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

ALTER TABLE public.pantry VALIDATE CONSTRAINT pantry_cached_subcategory_id_fkey;

-- ---------------------------------------------------------------------------
-- 4. Indexes (from migration 007; idempotent, no-op if already present)
--
-- Migration 004 defines no indexes on category/subcategory, so there is
-- nothing to reconcile for section 1 here.
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS pantry_user_storage_idx
  ON public.pantry (user_id, storage_location_id);
CREATE INDEX IF NOT EXISTS pantry_canonical_food_idx
  ON public.pantry (canonical_food_id);

-- ---------------------------------------------------------------------------
-- 5. Function (from migration 007; CREATE OR REPLACE is inherently
--    idempotent; re-declared here in case Production also lost this
--    object, since the 007 migration body never fully materialized).
--    Logic is byte-for-byte identical to the version defined in
--    007_pantry_storage_and_cache.sql.
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 6. Post-flight verification: fail loudly (rolling back this migration)
--    rather than silently leaving Production inconsistent, if for any
--    reason a column, foreign key, index, or function is still missing
--    after the reconciliation above. Covers both migration 004's and
--    migration 007's contributions, so a successful run of this migration
--    is itself proof that Production's pantry schema now matches
--    Development's 16-column schema (001+002 base columns are assumed
--    present and are unaffected by this migration).
--
-- Beyond presence, this section also verifies:
--   * data_type of every reconciled column matches what migrations 004/007
--     declared -- catching the case where a column with the right name
--     already exists but with the wrong type (e.g. from some earlier,
--     incomplete manual fix), which plain existence checks cannot detect;
--   * every reconciled FK's conrelid is scoped to public.pantry (constraint
--     names are only unique per-table in Postgres, not database-wide);
--   * every reconciled FK is fully validated (convalidated = true), i.e.
--     the NOT VALID + VALIDATE CONSTRAINT sequence in section 3 completed
--     and did not leave a constraint in a partially-applied NOT VALID state.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  missing_columns text[];
  type_mismatches text[];
  missing_fks text[];
  unvalidated_fks text[];
  missing_indexes text[];
BEGIN
  SELECT array_agg(col) INTO missing_columns
  FROM unnest(ARRAY[
    -- migration 004
    'category',
    'subcategory',
    -- migration 007
    'storage_location_id',
    'canonical_food_id',
    'cached_category_id',
    'cached_subcategory_id',
    'classification_version',
    'classification_updated_at'
  ]) AS col
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pantry' AND column_name = col
  );

  -- Only compares columns that exist (missing ones are already reported
  -- above), so the two failure categories stay distinct and unambiguous.
  SELECT array_agg(
    expected.column_name || ' (expected ' || expected.expected_type
      || ', found ' || actual.data_type || ')'
  ) INTO type_mismatches
  FROM (
    VALUES
      ('category', 'text'),
      ('subcategory', 'text'),
      ('storage_location_id', 'uuid'),
      ('canonical_food_id', 'uuid'),
      ('cached_category_id', 'uuid'),
      ('cached_subcategory_id', 'uuid'),
      ('classification_version', 'bigint'),
      ('classification_updated_at', 'timestamp with time zone')
  ) AS expected (column_name, expected_type)
  JOIN information_schema.columns actual
    ON actual.table_schema = 'public'
    AND actual.table_name = 'pantry'
    AND actual.column_name = expected.column_name
  WHERE actual.data_type <> expected.expected_type;

  SELECT array_agg(fk) INTO missing_fks
  FROM unnest(ARRAY[
    'pantry_storage_location_id_fkey',
    'pantry_canonical_food_id_fkey',
    'pantry_cached_category_id_fkey',
    'pantry_cached_subcategory_id_fkey'
  ]) AS fk
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = fk AND conrelid = 'public.pantry'::regclass
  );

  -- Only checks FKs already confirmed present above, so this reports a
  -- distinct failure mode (present but stuck NOT VALID) rather than
  -- overlapping with missing_fks.
  SELECT array_agg(fk) INTO unvalidated_fks
  FROM unnest(ARRAY[
    'pantry_storage_location_id_fkey',
    'pantry_canonical_food_id_fkey',
    'pantry_cached_category_id_fkey',
    'pantry_cached_subcategory_id_fkey'
  ]) AS fk
  WHERE EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = fk AND conrelid = 'public.pantry'::regclass AND NOT convalidated
  );

  SELECT array_agg(idx) INTO missing_indexes
  FROM unnest(ARRAY[
    'pantry_user_storage_idx',
    'pantry_canonical_food_idx'
  ]) AS idx
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'pantry' AND indexname = idx
  );

  IF missing_columns IS NOT NULL
    OR type_mismatches IS NOT NULL
    OR missing_fks IS NOT NULL
    OR unvalidated_fks IS NOT NULL
    OR missing_indexes IS NOT NULL
  THEN
    RAISE EXCEPTION
      'Migration 012 failed to fully reconcile public.pantry. missing_columns=%, type_mismatches=%, missing_fks=%, unvalidated_fks=%, missing_indexes=%',
      missing_columns, type_mismatches, missing_fks, unvalidated_fks, missing_indexes;
  END IF;

  IF to_regprocedure('public.refresh_stale_pantry_classifications()') IS NULL THEN
    RAISE EXCEPTION 'Migration 012 failed: public.refresh_stale_pantry_classifications() does not exist';
  END IF;
END $$;
