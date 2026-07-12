-- Community Food Intelligence V1
-- This migration intentionally treats the existing public.pantry table as live-schema
-- authoritative. Community observation tables never store pantry, shopping, recipe,
-- email, or user identifiers.

-- Optional metadata allows verified community defaults to remain editable per pantry item.
ALTER TABLE public.pantry
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE TABLE public.platform_roles (
  role text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_roles_role_format CHECK (role ~ '^[A-Z][A-Z0-9_]{1,63}$')
);

INSERT INTO public.platform_roles (role)
VALUES ('USER'), ('SUPER_ADMIN')
ON CONFLICT (role) DO NOTHING;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL REFERENCES public.platform_roles (role) ON UPDATE CASCADE,
  assigned_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_key UNIQUE (user_id, role)
);

CREATE INDEX user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX user_roles_role_idx ON public.user_roles (role);

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

REVOKE ALL ON FUNCTION public.is_platform_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view platform role definitions"
  ON public.platform_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Super admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE TABLE public.community_foods (
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
  CONSTRAINT community_foods_normalized_name_key UNIQUE (normalized_name),
  CONSTRAINT community_foods_shelf_life_nonnegative CHECK (
    (default_shelf_life_days IS NULL OR default_shelf_life_days >= 0)
    AND (default_fridge_life_days IS NULL OR default_fridge_life_days >= 0)
    AND (default_freezer_life_days IS NULL OR default_freezer_life_days >= 0)
  )
);

CREATE TABLE public.community_food_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_food_id uuid NOT NULL REFERENCES public.community_foods (id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_food_aliases_normalized_alias_key UNIQUE (normalized_alias)
);

CREATE INDEX community_food_aliases_food_id_idx
  ON public.community_food_aliases (community_food_id);
CREATE INDEX community_food_aliases_usage_count_idx
  ON public.community_food_aliases (usage_count DESC);

CREATE TABLE public.community_food_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_food_id uuid NOT NULL REFERENCES public.community_foods (id) ON DELETE CASCADE,
  category text,
  subcategory text,
  unit text,
  shelf_life_days integer,
  fridge_days integer,
  freezer_days integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_food_votes_life_nonnegative CHECK (
    (shelf_life_days IS NULL OR shelf_life_days >= 0)
    AND (fridge_days IS NULL OR fridge_days >= 0)
    AND (freezer_days IS NULL OR freezer_days >= 0)
  )
);

CREATE INDEX community_food_votes_food_id_idx
  ON public.community_food_votes (community_food_id);
CREATE INDEX community_food_votes_food_created_at_idx
  ON public.community_food_votes (community_food_id, created_at DESC);

-- This is a platform audit table, not an anonymous observation table. Actor IDs
-- are retained only to make privileged moderation actions auditable.
CREATE TABLE public.community_food_moderation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_food_id uuid NOT NULL REFERENCES public.community_foods (id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'merged', 'locked', 'edited')),
  actor_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  target_community_food_id uuid REFERENCES public.community_foods (id) ON DELETE SET NULL,
  before_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX community_food_moderation_history_food_idx
  ON public.community_food_moderation_history (community_food_id, created_at DESC);

ALTER TABLE public.community_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_food_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_food_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_food_moderation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage community foods"
  ON public.community_foods FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can manage community aliases"
  ON public.community_food_aliases FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can view community votes"
  ON public.community_food_votes FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admins can view moderation history"
  ON public.community_food_moderation_history FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE OR REPLACE FUNCTION public.community_food_normalize(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT NULLIF(
    regexp_replace(
      trim(lower(regexp_replace(coalesce(value, ''), '[[:punct:]]+', ' ', 'g')),
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

CREATE OR REPLACE FUNCTION public.record_community_food_observation(
  observed_name text,
  observed_category text DEFAULT NULL,
  observed_subcategory text DEFAULT NULL,
  observed_unit text DEFAULT NULL,
  observed_shelf_life_days integer DEFAULT NULL,
  observed_fridge_days integer DEFAULT NULL,
  observed_freezer_days integer DEFAULT NULL
)
RETURNS TABLE (
  community_food_id uuid,
  confidence_score numeric,
  review_required boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_observed_name text := public.community_food_normalize(observed_name);
  food public.community_foods%ROWTYPE;
  canonical_food_id uuid;
  category_mode text;
  subcategory_mode text;
  unit_mode text;
  shelf_life_mode integer;
  fridge_mode integer;
  freezer_mode integer;
  category_agreement numeric;
  unit_agreement numeric;
  expiry_agreement numeric;
  calculated_confidence numeric;
  requires_review boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF normalized_observed_name IS NULL THEN
    RAISE EXCEPTION 'A food name is required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.community_food_aliases aliases
    WHERE aliases.normalized_alias = normalized_observed_name
  ) THEN
    SELECT foods.*
    INTO food
    FROM public.community_food_aliases aliases
    JOIN public.community_foods foods ON foods.id = aliases.community_food_id
    WHERE aliases.normalized_alias = normalized_observed_name;
  ELSE
    INSERT INTO public.community_foods (
      canonical_name,
      normalized_name,
      primary_category,
      secondary_category,
      default_unit,
      default_shelf_life_days,
      default_fridge_life_days,
      default_freezer_life_days
    )
    VALUES (
      trim(observed_name),
      normalized_observed_name,
      nullif(trim(observed_category), ''),
      nullif(trim(observed_subcategory), ''),
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
    category,
    subcategory,
    unit,
    shelf_life_days,
    fridge_days,
    freezer_days
  )
  VALUES (
    canonical_food_id,
    nullif(trim(observed_category), ''),
    nullif(trim(observed_subcategory), ''),
    nullif(trim(observed_unit), ''),
    observed_shelf_life_days,
    observed_fridge_days,
    observed_freezer_days
  );

  SELECT value INTO category_mode
  FROM (
    SELECT category AS value, count(*) AS count
    FROM public.community_food_votes
    WHERE community_food_id = canonical_food_id AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC, category ASC
    LIMIT 1
  ) mode;

  SELECT value INTO subcategory_mode
  FROM (
    SELECT subcategory AS value, count(*) AS count
    FROM public.community_food_votes
    WHERE community_food_id = canonical_food_id AND subcategory IS NOT NULL
    GROUP BY subcategory
    ORDER BY count DESC, subcategory ASC
    LIMIT 1
  ) mode;

  SELECT value INTO unit_mode
  FROM (
    SELECT unit AS value, count(*) AS count
    FROM public.community_food_votes
    WHERE community_food_id = canonical_food_id AND unit IS NOT NULL
    GROUP BY unit
    ORDER BY count DESC, unit ASC
    LIMIT 1
  ) mode;

  SELECT value INTO shelf_life_mode
  FROM (
    SELECT shelf_life_days AS value, count(*) AS count
    FROM public.community_food_votes
    WHERE community_food_id = canonical_food_id AND shelf_life_days IS NOT NULL
    GROUP BY shelf_life_days
    ORDER BY count DESC, shelf_life_days ASC
    LIMIT 1
  ) mode;

  SELECT value INTO fridge_mode
  FROM (
    SELECT fridge_days AS value, count(*) AS count
    FROM public.community_food_votes
    WHERE community_food_id = canonical_food_id AND fridge_days IS NOT NULL
    GROUP BY fridge_days
    ORDER BY count DESC, fridge_days ASC
    LIMIT 1
  ) mode;

  SELECT value INTO freezer_mode
  FROM (
    SELECT freezer_days AS value, count(*) AS count
    FROM public.community_food_votes
    WHERE community_food_id = canonical_food_id AND freezer_days IS NOT NULL
    GROUP BY freezer_days
    ORDER BY count DESC, freezer_days ASC
    LIMIT 1
  ) mode;

  SELECT
    public.community_food_agreement(canonical_food_id, 'category', category_mode),
    public.community_food_agreement(canonical_food_id, 'unit', unit_mode),
    public.community_food_agreement(canonical_food_id, 'shelf_life_days', shelf_life_mode::text)
  INTO category_agreement, unit_agreement, expiry_agreement;

  SELECT
    least(35::numeric, count(*)::numeric * 1.4)
    + coalesce(category_agreement, 0) * 0.25
    + coalesce(unit_agreement, 0) * 0.20
    + coalesce(expiry_agreement, 0) * 0.20
  INTO calculated_confidence
  FROM public.community_food_votes
  WHERE community_food_id = canonical_food_id;

  SELECT
    count(*) >= 25
    AND category_agreement >= 90
    AND unit_agreement >= 90
    AND expiry_agreement >= 90
  INTO requires_review
  FROM public.community_food_votes
  WHERE community_food_id = canonical_food_id;

  UPDATE public.community_foods AS foods
  SET
    primary_category = coalesce(category_mode, primary_category),
    secondary_category = coalesce(subcategory_mode, secondary_category),
    default_unit = coalesce(unit_mode, default_unit),
    default_shelf_life_days = coalesce(shelf_life_mode, default_shelf_life_days),
    default_fridge_life_days = coalesce(fridge_mode, default_fridge_life_days),
    default_freezer_life_days = coalesce(freezer_mode, default_freezer_life_days),
    usage_count = (SELECT count(*) FROM public.community_food_votes WHERE community_food_id = canonical_food_id),
    alias_count = (SELECT count(*) FROM public.community_food_aliases WHERE community_food_id = canonical_food_id),
    confidence_score = round(greatest(0, least(100, calculated_confidence)), 2),
    review_required = foods.review_required OR requires_review,
    updated_at = now()
  WHERE foods.id = canonical_food_id
  RETURNING foods.id, foods.confidence_score, foods.review_required
  INTO community_food_id, confidence_score, review_required;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_verified_community_food(
  search_name text
)
RETURNS TABLE (
  id uuid,
  canonical_name text,
  primary_category text,
  secondary_category text,
  default_unit text,
  default_shelf_life_days integer,
  default_fridge_life_days integer,
  default_freezer_life_days integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    foods.id,
    foods.canonical_name,
    foods.primary_category,
    foods.secondary_category,
    foods.default_unit,
    foods.default_shelf_life_days,
    foods.default_fridge_life_days,
    foods.default_freezer_life_days
  FROM public.community_food_aliases aliases
  JOIN public.community_foods foods ON foods.id = aliases.community_food_id
  WHERE aliases.normalized_alias = public.community_food_normalize(search_name)
    AND foods.status = 'verified'
  UNION ALL
  SELECT
    foods.id,
    foods.canonical_name,
    foods.primary_category,
    foods.secondary_category,
    foods.default_unit,
    foods.default_shelf_life_days,
    foods.default_fridge_life_days,
    foods.default_freezer_life_days
  FROM public.community_foods foods
  WHERE foods.normalized_name = public.community_food_normalize(search_name)
    AND foods.status = 'verified'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.refresh_community_food_aggregate(food_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  food public.community_foods%ROWTYPE;
  category_agreement numeric;
  unit_agreement numeric;
  expiry_agreement numeric;
  calculated_confidence numeric;
BEGIN
  SELECT * INTO food FROM public.community_foods WHERE id = food_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community food not found';
  END IF;

  category_agreement := public.community_food_agreement(food_id, 'category', food.primary_category);
  unit_agreement := public.community_food_agreement(food_id, 'unit', food.default_unit);
  expiry_agreement := public.community_food_agreement(
    food_id,
    'shelf_life_days',
    food.default_shelf_life_days::text
  );

  SELECT
    least(35::numeric, count(*)::numeric * 1.4)
    + category_agreement * 0.25
    + unit_agreement * 0.20
    + expiry_agreement * 0.20
  INTO calculated_confidence
  FROM public.community_food_votes
  WHERE community_food_id = food_id;

  UPDATE public.community_foods
  SET
    usage_count = (SELECT count(*) FROM public.community_food_votes WHERE community_food_id = food_id),
    alias_count = (SELECT count(*) FROM public.community_food_aliases WHERE community_food_id = food_id),
    confidence_score = round(greatest(0, least(100, calculated_confidence)), 2),
    review_required = review_required OR (
      (SELECT count(*) FROM public.community_food_votes WHERE community_food_id = food_id) >= 25
      AND category_agreement >= 90
      AND unit_agreement >= 90
      AND expiry_agreement >= 90
    ),
    updated_at = now()
  WHERE id = food_id;
END;
$$;

REVOKE ALL ON FUNCTION public.community_food_normalize(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.community_food_agreement(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_community_food_observation(text, text, text, text, integer, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_verified_community_food(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_community_food_aggregate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_food_normalize(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_community_food_observation(text, text, text, text, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_verified_community_food(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_community_food_aggregate(uuid) TO authenticated;
