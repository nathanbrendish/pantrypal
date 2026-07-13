# ADR-007: Canonical Food IDs and the Food Knowledge Graph

**Status:** Accepted  
**Date:** July 2026  
**Deciders:** Engineering lead  
**Repository Path:** `/supabase/migrations/004–008`, `/src/lib/food-resolver.ts`, `/src/lib/semantic-match.ts`, `/src/types/taxonomy.ts`

---

## Context

ShelfLife's product features — recipe matching, shopping list computation, pantry deduction, meal suggestions, and "Add Missing Ingredients" — all depend on **comparing food items** from different sources:

- Recipe ingredients (text from `src/data/recipes.ts` or AI-generated)
- Pantry items (user-entered, scanned from receipts)
- Shopping list items (computed or manually added)
- Community-classified canonical foods

In v1, these comparisons were made purely on **display name strings**: "Mozzarella" ≠ "Mozarella", "Macaroni" ≠ "Pasta". The result was incorrect recipe matching, incorrect "Add Missing" behaviour, and classification inconsistency.

The fundamental question was: **what is the canonical identity of a food item in ShelfLife?**

---

## Problem

What is the universal identifier for a food item across all systems in ShelfLife?

If "Mozzarella" and "Mozarella" are the same food, what is the authoritative reference? If "Macaroni" and "Pasta" are interchangeable in some contexts, how is that relationship expressed? If "Butter" belongs in the Dairy category, where is that classification stored and who owns it?

---

## Decision

**Every known food has a canonical UUID (`canonical_food_id`) in the `community_foods` table.** This ID is the universal identity for that food across all ShelfLife systems. All display names, aliases, and classifications are properties of the canonical food record — not properties of pantry items, recipe ingredients, or shopping list rows.

### The Knowledge Graph Structure

```
food_categories (controlled vocabulary)
    id: uuid
    name: "Dairy"
    icon: "🥛"
    
food_subcategories (controlled vocabulary, semi-extensible)
    id: uuid
    category_id → food_categories.id
    name: "Cheese"
    substitutable: bool   ← Is this family interchangeable in recipes?

community_foods (canonical food records)
    id: uuid              ← The canonical_food_id
    canonical_name: "Mozzarella"
    category_id → food_categories.id
    subcategory_id → food_subcategories.id
    confidence_score: numeric
    classification_version: int   ← Monotonically increases on classification change

community_food_aliases
    community_food_id → community_foods.id
    alias: "Mozarella"
    alias: "Fresh Mozzarella"
    alias: "Buffalo Mozzarella"
    alias: "Mozzarella Cheese"

pantry
    canonical_food_id → community_foods.id   ← FK to the Knowledge Graph
    cached_category_id → food_categories.id  ← Cache snapshot (performance only)
    cached_subcategory_id → food_subcategories.id
    classification_version: int              ← Compare to community to detect stale cache
```

### How the Knowledge Graph is Queried

`buildFoodResolver()` in `src/lib/food-resolver.ts` constructs a `FoodResolver` from a set of ingredient names:

```typescript
async function buildFoodResolver(
  supabase: SupabaseClient,
  ingredientNames: string[]
): Promise<FoodResolver>
```

1. Calls `resolve_community_foods` RPC with all names in a single batch
2. Returns a map of `{ name → ResolvedFood }` where `ResolvedFood` contains:
   - `canonical_food_id: string | null`
   - `subcategory_id: string | null`
   - `display_name: string` (original name if unresolved)
3. Fetches all substitutable subcategory IDs in a second query
4. Returns a `FoodResolver` that can resolve any name and determine substitutability

### The `resolve_community_foods` RPC

This PostgreSQL function takes an array of ingredient names and returns their canonical IDs in a single query:

```sql
SELECT resolve_community_foods(ARRAY['Macaroni', 'Pasta', 'Mozzarella', 'Mozarella'])
```

It performs alias matching internally — "Mozarella" resolves to the same `canonical_food_id` as "Mozzarella" because both are in `community_food_aliases` pointing to the same `community_foods` record.

### Pantry as a Cache

The pantry row **never owns food classification**. It contains:

```
pantry.canonical_food_id        → who this food is (FK to community_foods)
pantry.cached_category_id       → what category it is (cache of community knowledge)
pantry.cached_subcategory_id    → what subcategory it is (cache)
pantry.classification_version   → when this cache was populated
```

When `classification_version` in the pantry row is less than `classification_version` in `community_foods`, the cache is stale and is automatically refreshed. This is handled by `refresh_stale_pantry_classifications()` called at the top of `/pantry/page.tsx`.

**This ensures:** when community moderators correct a misclassification (e.g., "Mozzarella" was marked as "Snacks" by error), every user's pantry automatically updates without any user action.

### Storage Location is Not Part of the Knowledge Graph

Storage location (Fridge, Freezer, Cupboard) is **user-owned** via the `storage_locations` table and the `pantry.storage_location_id` column. Community intelligence may suggest a default storage location based on food category, but it must never overwrite the user's stored preference. This separation is enforced by never including `storage_location_id` in any community learning write path.

---

## Alternatives Considered

### Free-Text Category Strings on Each Pantry Row

The v1 approach: store `category: "Dairy"` as a string directly on the pantry row.

| Factor | Assessment |
|---|---|
| Simplicity | Very simple |
| Consistency | Two users may store the same food under different categories |
| Improvement | No propagation — if the canonical answer is learned later, nothing updates |
| Matching | Cannot match "Pasta" and "Macaroni" — only string comparison available |

Rejected: This was the v1 state that motivated the Food Knowledge Graph. See [docs/development-log.md](./development-log.md) for the history.

### Category Enum in Application Code

Replace free-text with a TypeScript enum:

```typescript
enum FoodCategory { Dairy = "Dairy", Fruit = "Fruit", ... }
```

| Factor | Assessment |
|---|---|
| Consistency | Consistent for the defined set |
| Extension | New categories require code changes and deployments |
| Community input | No mechanism for community to improve classification |
| Subcategories | Enum cannot express the category → subcategory hierarchy |
| Matching | Still string-based; no canonical ID for foods |

Rejected: Addresses consistency but not correctness or scalability. Every new food variant still requires manual categorisation in code.

### External Food Database (Open Food Facts, USDA)

Use an existing food database as the canonical source:

| Factor | Assessment |
|---|---|
| Coverage | Very high — hundreds of thousands of foods |
| Accuracy | High for packaged foods; lower for generic ingredients |
| Control | External API dependency; rate limits; possible service disruption |
| Community | Cannot extend or correct classifications without the external service |
| Privacy | Sending user ingredient data to external service |
| Cost | Possible API costs at scale |
| Integration | Complex schema mapping between external database and ShelfLife's taxonomy |

Considered but not adopted: An external database would be a reasonable data source for bootstrapping the Knowledge Graph, but ShelfLife's taxonomy (food categories, subcategories, substitutable families) is specific to the meal planning use case and requires custom curation. An external dependency also introduces operational risk. This remains a possible future enrichment path.

### Graph Database (Neo4j, ArangoDB)

Model the Knowledge Graph as a true graph:
```
(Macaroni) -[IS_A]→ (Pasta) -[BELONGS_TO]→ (Pasta & Rice category)
```

| Factor | Assessment |
|---|---|
| Expressiveness | Natural for hierarchical food relationships |
| Complexity | Separate database infrastructure; GraphQL or Cypher query language |
| Team | Requires graph database expertise |
| Hosting | Separate from Supabase; operational complexity |
| Scale | Overkill for the current taxonomy size (17 categories, ~100 subcategories) |

Rejected: The Knowledge Graph expressed in ShelfLife's taxonomy is shallow (food → subcategory → category, plus substitutable flag). A relational database with a `substitutable` boolean on `food_subcategories` expresses the required semantics without a graph database infrastructure.

---

## The Classification Version Mechanism

The `classification_version` mechanism deserves detailed explanation because it is central to the cache invalidation design.

### Why Not Timestamps?

The naive approach would be to compare `pantry.classification_updated_at` with `community_foods.updated_at`. This is fragile:
- Clock synchronisation issues between client and database
- `updated_at` may be set by an unrelated change
- Comparison requires fetching `community_foods.updated_at` for every pantry item

### Why Monotonic Integers?

```sql
-- In community_foods:
classification_version INTEGER NOT NULL DEFAULT 1

-- Trigger increments version on classification change:
NEW.classification_version = OLD.classification_version + 1
```

The pantry item's `classification_version` is stored at cache time. On read, if:
```
community.classification_version > pantry.classification_version
```
the cache is stale. This is a simple integer comparison with no clock issues, no timezone ambiguity, and no unrelated field contamination.

---

## Consequences

### Positive

- Every ingredient comparison can use `canonical_food_id` — "Mozarella" and "Mozzarella" are provably the same food
- Recipe matching, shopping computation, and "Add Missing" all produce semantically correct results
- The `substitutable` flag encodes food family relationships without hardcoded synonym lists
- Classification improvements propagate automatically to all users via cache invalidation
- Pantry reads are fast — cached category data is on the pantry row
- The Knowledge Graph grows with usage — new foods enter as Unclassified and become Verified over time

### Negative / Trade-offs

- New foods start as Unclassified — there is an initial quality gap for uncommon foods
- The cache invalidation mechanism adds a query to every pantry page load (`refresh_stale_pantry_classifications()`)
- Community moderator effort is required to approve and curate classifications
- The `resolve_community_foods` RPC must be called before any semantic matching can occur — latency cost on first use

### Mitigations

- The `EMPTY_FOOD_RESOLVER` constant ensures that matching degrades gracefully to string comparison when the Knowledge Graph cannot be queried
- The `refresh_stale_pantry_classifications()` call is deferred — page load does not block on it
- Community learning is non-blocking — the canonical pantry insert succeeds even if classification resolution fails
- The fallback to string comparison in `foodsMatch()` (Tier 3) ensures no ingredient is ever silently discarded

---

## Implementation

| File | Purpose |
|---|---|
| `supabase/migrations/004_community_food_intelligence.sql` | community_foods, aliases, votes, RPCs |
| `supabase/migrations/005_food_taxonomy.sql` | food_categories, food_subcategories (controlled vocabulary) |
| `supabase/migrations/006_community_classification.sql` | ID-based columns, classification_version trigger |
| `supabase/migrations/007_pantry_storage_and_cache.sql` | canonical_food_id, cache columns on pantry |
| `supabase/migrations/008_semantic_matching.sql` | substitutable column, resolve_community_foods RPC |
| `src/types/taxonomy.ts` | TypeScript types: FoodCategory, FoodSubcategory, StorageLocation, ClassificationTier |
| `src/lib/food-resolver.ts` | buildFoodResolver() — server-only Knowledge Graph projection |
| `src/lib/semantic-match.ts` | foodsMatch(), matchesAnyPantry(), FoodResolver, ResolvedFood types |
| `src/lib/food-classification.ts` | tierFromConfidence(), tierLabel(), CONFIDENCE_THRESHOLDS, isUnclassified() |
| `src/lib/storage-locations.ts` | suggestStorageLocationId() — community-based storage suggestion |

---

## Future Implications

- The `cooking_behavior_observations` table (migration 011) captures actual ingredient usage during cooking. Future analysis of this data could improve portion size recommendations in recipes and identify common substitutions for Knowledge Graph enrichment.
- Personal storage preference learning (storing that a specific user consistently places Butter in the Freezer) would be an extension of the storage location system — not the Knowledge Graph — keeping the separation clean.
- If ShelfLife adopts barcode scanning, product barcodes could be resolved to `canonical_food_id` via a product-to-food mapping table, without changing the core Knowledge Graph schema.
- The `substitutable` flag could evolve into a `substitution_strength` numeric to allow partial substitutability — "Cheddar as a Cheese substitute is 95%; Parmesan as a Cheese substitute is 80%".

---

## Cross References

- [docs/architecture.md — Community Food Intelligence and Semantic Matching](../architecture.md)
- [docs/database-schema.md — community_foods, food_categories, food_subcategories](../database-schema.md)
- [docs/community-food-intelligence.md](../community-food-intelligence.md)
- [ADR-004: Community Food Intelligence](./ADR-004-community-food-intelligence.md)
- [ADR-005: Semantic Matching](./ADR-005-semantic-matching.md)
- [ADR-006: Shopping Persistence](./ADR-006-shopping-persistence.md)
