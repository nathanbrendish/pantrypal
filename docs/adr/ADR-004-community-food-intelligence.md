# ADR-004: Community Food Intelligence as the Single Source of Truth for Food Classification

**Status:** Accepted  
**Date:** July 2026  
**Deciders:** Engineering lead  
**Repository Path:** `/supabase/migrations/004_community_food_intelligence.sql`, `/supabase/migrations/006_community_classification.sql`, `/src/app/actions/community-intelligence.ts`, `/src/lib/community-*.ts`

---

## Context

ShelfLife requires food classification to drive several product features:

- Grouping pantry items by category (Dairy, Fruit, Vegetables, etc.)
- Shopping list category headers
- Recipe matching and ingredient family recognition
- Platform analytics and future AI features
- Filtering and searching

Early versions of the application stored `category` and `subcategory` as **free-text strings on the pantry item itself**. For example, a pantry item for "Mozzarella" might have `category = "Other"` — which is factually incorrect, provides no semantic value, and creates inconsistency between users.

The problems with per-item free-text classification:

1. **Inconsistency:** "Mozzarella" is `Other` for user A and `Dairy` for user B
2. **No learning:** Each user's classification is independent; correct classifications are not shared
3. **Poor quality:** Gemini was not consistently producing accurate categories when scanning receipts
4. **Scalability:** As the catalogue grows, per-item classification becomes noise
5. **AI limitations:** Recipe matching, meal suggestions, and shopping cannot reason about food families if every user has different category strings

---

## Problem

Where should food classification (category, subcategory, canonical food name) be authoritative? And how should classification improve over time?

The options are:

1. **Per-item user classification** — each user classifies their own pantry items
2. **Static lookup table** — a fixed classification hardcoded by the engineering team
3. **AI classification on insertion** — Gemini classifies food on every insert
4. **Community Food Intelligence** — a shared knowledge graph built from aggregated user behaviour, moderated by the platform team

---

## Decision

**Community Food Intelligence** is the single source of truth for food classification. The pantry **caches** the most recent community-known classification for performance, but never **owns** it.

### Architecture

```
Community Food Intelligence (authoritative)
         ↓
    community_foods table
    (canonical_food_id, category_id, subcategory_id, confidence_score, classification_version)
         ↓
    On pantry insert:
    1. Resolve ingredient name → canonical_food_id (via alias matching)
    2. Fetch category_id, subcategory_id, confidence, classification_version
    3. Store snapshot in pantry row (cached_category_id, cached_subcategory_id, classification_version)
         ↓
    On pantry read:
    1. Use cached snapshot for fast render
    2. If community.classification_version > pantry.classification_version → refresh cache
         ↓
    Community improves → classification_version increments → all pantry items auto-refresh
```

### Confidence Tiers

| Tier | Threshold | Meaning |
|---|---|---|
| **Verified** | ≥ 95% | High community agreement; future users never prompted |
| **Community** | 75–94% | Strong agreement; classification reliable |
| **Learning** | 40–74% | Moderate evidence; classification used but may change |
| **Unclassified** | < 40% | Insufficient evidence; user may be prompted to classify |

Implemented in `src/lib/food-classification.ts`:
```typescript
export const CONFIDENCE_THRESHOLDS = {
  VERIFIED: 95,
  COMMUNITY: 75,
  LEARNING: 40,
};
```

### Controlled Vocabulary

Food categories are a **controlled vocabulary** owned by ShelfLife, not free-text invented by users. This is implemented via the `food_categories` and `food_subcategories` tables (migration 005).

Categories: Dairy, Fruit, Vegetables, Meat, Seafood, Bakery, Pasta & Rice, Herbs & Spices, Pantry Staples, Condiments & Sauces, Oils & Vinegars, Tinned & Jarred Foods, Frozen Foods, Snacks, Confectionery, Beverages, Baking, Unclassified.

**"Other" has been removed.** It was replaced by "Unclassified" — which communicates "the community has not yet learned this" rather than implying permanent miscellany.

### Alias Resolution

Multiple user-entered names can resolve to one canonical food:
- "Mozzarella", "Mozarella", "Fresh Mozzarella", "Buffalo Mozzarella", "Mozzarella Cheese" → canonical: `Mozzarella`

Aliases are stored in `community_food_aliases`. The `resolve_community_foods` RPC resolves a batch of ingredient names to their canonical forms in a single query.

### Storage Location Separation

**Storage location is completely separate from food classification.** Storage location (Fridge, Freezer, Cupboard, etc.) is **user-owned** via the `storage_locations` table. Community intelligence may suggest a storage location but must never overwrite the user's choice.

This separation was a deliberate design decision to prevent community data from overwriting personal preferences.

### Community Learning Workflow

1. User adds "Mozzarella" to pantry
2. `record_community_food_observation()` RPC called (non-blocking, wrapped in try/catch)
3. If the canonical food exists and has high confidence, the classification is applied immediately
4. If not, the pantry item is marked "Unclassified" and the user may be prompted
5. Platform administrators can review, approve, and edit community food classifications via `/platform`
6. When a classification is approved, `classification_version` increments
7. All pantry items with that canonical food detect the stale version and auto-refresh

---

## Alternatives Considered

### Per-Item User Classification

| Factor | Assessment |
|---|---|
| Simplicity | Simple to implement |
| Quality | Inconsistent across users |
| Scalability | Does not improve with usage; each user starts from zero |
| AI integration | Cannot reason about food families if classifications diverge |

Rejected: Does not improve with scale. Two users adding "Mozzarella" produce different classifications. No shared intelligence.

### Static Hardcoded Lookup

```typescript
const CATEGORY_MAP = {
  "mozzarella": "Dairy",
  "cheddar": "Dairy",
  // ... hundreds of entries
}
```

| Factor | Assessment |
|---|---|
| Consistency | Consistent for known foods |
| Maintenance | Engineering team must maintain every mapping manually |
| Coverage | New foods require code changes; receipts contain unknown items |
| Alias handling | Cannot handle "Mozarella" (misspelling) without exhaustive entry |

Rejected: Does not scale. Impossible to keep up with the diversity of food names users enter. Receipt scanning produces highly variable ingredient names.

### AI Classification on Every Insert

Call Gemini to classify every ingredient when it is added:

| Factor | Assessment |
|---|---|
| Coverage | AI can handle unknown foods reasonably |
| Consistency | AI responses are non-deterministic; same food may get different categories |
| Cost | Every pantry insert makes an AI call; expensive at scale |
| Latency | Adds AI latency to every insert |
| Correctness | AI makes mistakes; no correction mechanism |

Rejected: Non-deterministic (same food gets different categories across users), adds cost and latency to every insert, and provides no mechanism for the community to correct errors.

### Pre-populated Static Database

Seed the database with a comprehensive food taxonomy:

| Factor | Assessment |
|---|---|
| Initial quality | High for seeded foods |
| Unknown foods | Receipt scanning produces unknown names; no handling |
| Improvement | No mechanism for learning; static snapshot |

Rejected: Cannot handle the long tail of food variants, brand names, and misspellings that real receipts produce. No improvement mechanism.

---

## Consequences

### Positive

- Classification improves automatically as more users classify the same foods
- Once a food reaches Verified confidence, future users never see a classification prompt
- Alias resolution means "Mozarella" and "Mozzarella" are treated as the same food everywhere
- Platform administrators can correct community mistakes via the moderation dashboard
- The pantry cache means reads are fast — no community lookup on every render
- `classification_version` ensures stale caches are detected without timestamp comparison

### Negative / Trade-offs

- New foods start as "Unclassified" until the community provides evidence
- Community learning requires multiple user interactions before reaching Verified
- Moderator time is required for community food approval
- The cache invalidation mechanism (comparing `classification_version`) adds complexity to pantry reads

### Mitigations

- The platform admin at `/platform` enables efficient batch moderation
- Community learning is **non-blocking**: `record_community_food_observation()` is called in a try/catch, and failure does not fail the primary pantry insert
- The empty cache (`EMPTY_CACHE` constant in `src/app/actions/pantry.ts`) is returned on community learning failure, ensuring the pantry insert still succeeds
- The `refreshStalePantryClassifications()` call at the top of `/pantry/page.tsx` ensures classifications are refreshed on each pantry page load

---

## Implementation

| File | Purpose |
|---|---|
| `supabase/migrations/004_community_food_intelligence.sql` | Platform roles, community_foods, aliases, votes, moderation history, RPCs |
| `supabase/migrations/005_food_taxonomy.sql` | food_categories, food_subcategories (controlled vocabulary), storage_locations |
| `supabase/migrations/006_community_classification.sql` | ID-based classification columns, classification_version trigger |
| `supabase/migrations/007_pantry_storage_and_cache.sql` | Pantry cache columns |
| `src/lib/food-classification.ts` | Confidence tier thresholds and helpers |
| `src/lib/community-foods.ts` | Community food utilities |
| `src/lib/community-normalization.ts` | Food name normalization |
| `src/lib/community-confidence.ts` | Confidence calculation helpers |
| `src/app/actions/pantry.ts` | `learnAndSnapshot()`, `getCommunityFoodDefaults()` |
| `src/app/actions/community-intelligence.ts` | Platform admin actions (SUPER_ADMIN) |
| `src/components/platform/community-intelligence-dashboard.tsx` | Admin moderation UI |

---

## Future Implications

- The `cooking_behavior_observations` table (migration 011) stores expected vs actual ingredient usage during cooking. This is the foundation for future cooking behaviour personalisation — personalising ingredient quantities and substitution suggestions per user.
- As confidence data grows, automatic Verified promotion could be implemented: foods that consistently receive the same classification from `N` independent users become Verified without manual moderation.
- The `substitutable` flag on `food_subcategories` (migration 008) extends the Knowledge Graph for semantic matching — see [ADR-005](./ADR-005-semantic-matching.md).

---

## Cross References

- [docs/architecture.md — Community Food Intelligence](../architecture.md)
- [docs/database-schema.md — community_foods, food_categories, food_subcategories](../database-schema.md)
- [docs/community-food-intelligence.md](../community-food-intelligence.md)
- [ADR-005: Semantic Matching](./ADR-005-semantic-matching.md)
- [ADR-007: Canonical Food Knowledge Graph](./ADR-007-canonical-food-knowledge-graph.md)
