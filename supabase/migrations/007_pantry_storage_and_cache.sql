-- Food Knowledge Graph V2 - Pantry storage location + classification cache
-- Storage location is user-owned. Classification is a cached snapshot of the
-- community source of truth (ids + version only). The old free-text category /
-- subcategory columns are DEPRECATED (kept, no longer written); a later cleanup
-- migration will drop them once verified nothing references them.

ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS storage_location_id uuid REFERENCES public.storage_locations (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS canonical_food_id uuid REFERENCES public.community_foods (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cached_category_id uuid REFERENCES public.food_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cached_subcategory_id uuid REFERENCES public.food_subcategories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS classification_version bigint,
  ADD COLUMN IF NOT EXISTS classification_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS pantry_user_storage_idx
  ON public.pantry (user_id, storage_location_id);
CREATE INDEX IF NOT EXISTS pantry_canonical_food_idx
  ON public.pantry (canonical_food_id);

-- Pull-based self-healing cache: refresh only the caller's rows whose cached
-- classification_version has fallen behind the community source of truth.
-- Category is nulled below the learning threshold so the UI shows "Unclassified".
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
