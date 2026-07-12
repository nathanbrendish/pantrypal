# Community Food Intelligence

## Purpose

Community Food Intelligence is ShelfLife's privacy-preserving foundation for
learning shared food naming, categories, units, and shelf-life defaults. It is
not an AI system, recommendation engine, or user-profile system.

## Architecture

The feature is built from four layers:

1. `community_foods` stores a canonical aggregate food record.
2. `community_food_aliases` maps normalized community names to that canonical
   record.
3. `community_food_votes` stores anonymous observations of category, unit, and
   shelf-life values.
4. Server-side platform moderation turns candidates into verified defaults.

Pantry writes first complete normally. After a successful insert or update, the
server action submits an anonymous observation through
`record_community_food_observation`. A failed community observation never rolls
back or blocks a pantry update.

## Database design

The V1 migration is `supabase/migrations/004_community_food_intelligence.sql`.

### Community tables

- `community_foods`: canonical data, aggregate counts, confidence, lifecycle
  status, and review state.
- `community_food_aliases`: aliases and aggregate usage counts.
- `community_food_votes`: category, subcategory, unit, and shelf-life
  observations without an observer identity.
- `community_food_moderation_history`: a privileged audit trail of moderation
  actions.

Community food status is one of `candidate`, `verified`, or `locked`.
Rejecting a candidate locks it while retaining the audit record; this preserves
the specified status set and avoids deleting moderation history.

### Platform authorization tables

- `platform_roles` is a role catalogue. It starts with `USER` and
  `SUPER_ADMIN`; future roles such as `MODERATOR`, `SUPPORT`, `BETA_TESTER`,
  and `ANALYST` can be added by inserting a row.
- `user_roles` assigns one or more roles to authenticated users. Roles are not
  stored on a profile or in user metadata.

## Privacy guarantees

The observation tables never contain:

- email addresses
- user IDs
- pantry IDs
- pantry rows or quantities
- shopping lists
- recipes
- session identifiers

`community_food_votes` contains only the observed aggregate values and a
timestamp. It has no foreign key or column that can join it back to a user or
pantry.

`community_food_moderation_history` deliberately stores the privileged
moderator actor ID so platform actions are auditable. It is a separate
restricted platform-audit table, not a community observation table, and is
visible only to SUPER_ADMIN users.

Direct table access is denied by RLS. Users receive canonical defaults through
`resolve_community_food` (V2; replaced the V1 `get_verified_community_food`),
which returns only canonical default data plus derived classification. The
dashboard and raw vote aggregates require SUPER_ADMIN.

## Normalization and learning workflow

Names are lowercased, punctuation is converted to spaces, duplicate whitespace
is collapsed, and leading/trailing spaces are trimmed. For example:

```text
Heinz   Baked Beans -> heinz baked beans
```

When food is added manually, edited, or saved from a receipt:

1. ShelfLife normalizes the name.
2. The database searches canonical names and aliases.
3. It creates a candidate and first alias/vote when no match exists.
4. Otherwise it increments use and alias counts and records a new anonymous
   vote.
5. The aggregate default values follow the observed mode for each field.
6. Verified records can prefill category, subcategory, unit, and an editable
   expiry date calculated from shelf-life days.

Candidate records never become verified automatically.

## Confidence engine

The V1 formula is deliberately small and replaceable:

```text
confidence =
  min(35, usageCount * 1.4)
  + categoryAgreement * 0.25
  + unitAgreement * 0.20
  + shelfLifeAgreement * 0.20
```

Every agreement is a percentage from 0 to 100. The result is clamped to 0–100.
The pure TypeScript implementation lives in
`src/lib/community-food-confidence.ts`; the database RPC applies the same
weights when it updates aggregate records.

A candidate is marked `review_required` when:

- `usage_count >= 25`
- category agreement is at least 90%
- unit agreement is at least 90%
- shelf-life agreement is at least 90%

It remains `candidate` until moderation.

## Moderation workflow

`/platform` is protected in middleware, on the page, and in every platform
server action by `requireSuperAdmin`.

SUPER_ADMIN users can:

- approve a candidate as verified
- reject a candidate (locks it)
- merge aliases and votes into another canonical food
- lock a food
- edit canonical default values
- review confidence details and moderation history

Every moderation mutation writes a before/after audit record.

## First SUPER_ADMIN bootstrap

After the migration is applied, assign the first administrator manually in the
Supabase SQL editor. Replace the UUID with the intended authenticated user's
`auth.users.id`.

```sql
insert into public.user_roles (user_id, role, assigned_by)
values ('AUTH_USER_UUID', 'SUPER_ADMIN', null);
```

Subsequent SUPER_ADMIN users can be managed through the same role system when
future user-management tooling is added.

## V2: Food Knowledge Graph (Storage Location + Community Classification)

V2 separates two concepts that V1 conflated in a single free-text category:

- **Storage Location** is user-owned navigation (Fridge, Freezer, Cupboard, …).
  Community intelligence never modifies a user's storage location.
- **Food Classification** is community-owned metadata drawn from a controlled
  taxonomy, referenced everywhere by ID (`food_category_id` /
  `food_subcategory_id`). Category/subcategory names are display-only.

### New migrations

- `005_food_taxonomy.sql`: `food_categories`, `food_subcategories`
  (semi-controlled — SUPER_ADMIN promotes new ones), and `storage_locations`
  lookup tables. Seeds 17 categories (there is deliberately **no** "Unclassified"
  row — Unclassified is the absence of a category), starter subcategories, and 6
  storage locations. `taxonomy_version` makes vocabulary evolution deliberate.
- `006_community_classification.sql`: adds `food_category_id`,
  `food_subcategory_id`, monotonic `classification_version`, and
  `taxonomy_version` to `community_foods`; adds category/subcategory/storage IDs
  to `community_food_votes`; backfills legacy text; and replaces the learning
  RPCs with ID-based ones. A `BEFORE UPDATE` trigger bumps
  `classification_version` only when a classification-relevant field changes.
- `007_pantry_storage_and_cache.sql`: adds `storage_location_id`,
  `canonical_food_id`, `cached_category_id`, `cached_subcategory_id`,
  `classification_version`, and `classification_updated_at` to `pantry`. The old
  `category`/`subcategory` columns are **deprecated** (kept, no longer written);
  a later cleanup migration drops them once verified.

### Source of truth and caching

`community_foods` remains the single source of truth for classification. The
pantry stores only a cache: canonical food ID, cached category/subcategory IDs,
and the `classification_version` it was derived from. Confidence, tier, and the
"Unclassified" state are **never stored** on the pantry — they are derived on
demand from `community_foods.confidence_score`.

Reads are self-healing. `refresh_stale_pantry_classifications()` (called before
the pantry page renders) updates only the caller's rows whose cached version has
fallen behind the community `classification_version`. Category is nulled when
confidence `< 40`, so improving community knowledge automatically propagates to
every pantry without user action.

### Confidence tiers

Tier is a pure function of confidence (`community_food_tier`):

```text
>= 95  Verified
75-94  Community
40-74  Learning
< 40   Unclassified (no category)
```

Classification is never requested at add time. Unknown foods are stored
immediately and shown as "Unclassified"; users classify later via the edit
modal, which records a controlled-category vote through
`classify_community_food`.

### Learned storage suggestions

Storage location is user-owned, but the default is community-learned: each
add records an anonymous `storage_location_id` vote, and
`get_suggested_storage_location` returns the mode. The user can always override,
and community writes never change a stored location. (A future personalization
layer could blend community defaults with per-user habits.)

### Platform taxonomy management

The `/platform` SUPER_ADMIN dashboard manages the controlled vocabulary: add
categories, promote new subcategories, add storage locations, and activate /
deactivate any of them. Food moderation now edits classification by ID.

## Future roadmap

The role and aggregate foundation is designed for future modules without schema
redesign:

- analytics
- feedback and bug reports
- feature flags
- user management
- AI monitoring
- OCR and barcode learning
- duplicate detection
- regional food naming
- crowdsourced shelf-life optimization

Those modules are intentionally not part of Community Food Intelligence V1.
