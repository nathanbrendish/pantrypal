# Contributing to ShelfLife

**Repository:** https://github.com/nathanbrendish/shelflife  
**Version:** 2.0  
**Last Updated:** July 2026

This document defines the engineering standards, contribution process, and quality requirements for ShelfLife. All contributors — including AI coding assistants — must follow these standards before merging any change.

---

## Table of Contents

1. [Repository Philosophy](#1-repository-philosophy)
2. [Engineering Principles](#2-engineering-principles)
3. [Shared Component Policy](#3-shared-component-policy)
4. [TypeScript Standards](#4-typescript-standards)
5. [Naming Conventions](#5-naming-conventions)
6. [Folder Organisation](#6-folder-organisation)
7. [Branch Strategy](#7-branch-strategy)
8. [Feature Development Lifecycle](#8-feature-development-lifecycle)
9. [Testing Requirements](#9-testing-requirements)
10. [Migration Rules](#10-migration-rules)
11. [Supabase Best Practices](#11-supabase-best-practices)
12. [Commit Message Conventions](#12-commit-message-conventions)
13. [Pull Request Checklist](#13-pull-request-checklist)
14. [Review Checklist](#14-review-checklist)
15. [Deployment Checklist](#15-deployment-checklist)
16. [Release Checklist](#16-release-checklist)
17. [Documentation Checklist](#17-documentation-checklist)
18. [Versioning Policy](#18-versioning-policy)
19. [Bug Reporting](#19-bug-reporting)
20. [Feature Requests](#20-feature-requests)

---

## 1. Repository Philosophy

ShelfLife is built on the principle that **correctness beats novelty**. The shopping list is deterministic mathematics. The pantry is the source of truth. Community Food Intelligence is the single source of truth for food classification. These constraints are intentional and must be preserved.

**Non-negotiable invariants:**
1. The shopping list is computed from `Demand − Pantry Supply`. It is never AI-generated.
2. The pantry caches classification data from Community Food Intelligence. The pantry never owns classification.
3. Storage location is user-owned. The community may suggest but must never overwrite a user's storage choice.
4. One canonical implementation exists for each major operation: pantry insertion, shopping insertion, cooking completion, semantic matching, "Add Missing Ingredients".
5. Community learning is always non-blocking. It must never fail a user's primary action.

---

## 2. Engineering Principles

### Consolidation Over Duplication

Before implementing any feature, search the repository for existing implementations of similar logic. If it exists, extend it. If it does not, create a canonical implementation that every future caller uses.

```bash
# Always search before implementing
rg "functionName" src/
rg "ComponentName" src/
```

### Single Canonical Implementations

| Operation | Canonical Location |
|---|---|
| Pantry row INSERT | `insertOrStackPantryItem()` in `src/lib/pantry-stacking.ts` |
| Shopping row INSERT | `insertShoppingListRows()` in `src/lib/shopping-list-persistence.ts` |
| "Add Missing Ingredients" decision | `planMissingIngredientsForShoppingList()` in `src/lib/add-missing-ingredients-core.mjs` |
| "Add Missing Ingredients" server action | `addMissingIngredientsToShoppingList()` in `src/app/actions/shopping-list.ts` |
| Pantry consumption (cooking) | `consumePantryForCookedMeal()` in `src/lib/pantry-consumption.ts` |
| Semantic food matching | `foodsMatch()` / `matchesAnyPantry()` in `src/lib/semantic-match.ts` |
| Knowledge Graph resolution | `buildFoodResolver()` in `src/lib/food-resolver.ts` |
| Shopping list computation | `computeShoppingList()` in `src/lib/shopping-list.ts` |

Violating any of these canonical paths is grounds for PR rejection.

### Separation of Concerns

- **Server Actions** perform mutations; they return typed results, never throw to the client
- **React Components** handle presentation and user interaction; they do not contain business logic
- **`src/lib/`** contains pure domain logic and shared utilities; it must not contain React components or route-specific logic
- **Community learning** (recording observations) is a side effect of user actions, not a primary operation

---

## 3. Shared Component Policy

### The Golden Rule

**Before modifying any shared component, hook, server action, utility, or library, search the entire repository for every place it is used. Verify the change is backward-compatible for every caller. Test every affected page.**

This is a hard engineering standard, not a suggestion.

### What Counts as a Shared Component

The following are shared across multiple pages and features. Any modification to these components requires auditing every consumer:

| Component / Module | Used By |
|---|---|
| `MissingIngredientsSection` | MealPlanner, RecipeCatalog, RecipeDetailModal, MealCard, SavedMealsList |
| `AddMissingToShoppingButton` | Always via MissingIngredientsSection |
| `IngredientFields` | AddIngredientForm, ReceiptIngredientReview |
| `CookingConfirmationModal` | RecipeDetailModal, MealCard |
| `insertShoppingListRows()` | `regenerateShoppingList`, `addMissingIngredientsToShoppingList` |
| `insertOrStackPantryItem()` | `addIngredient`, `saveScannedIngredients` |
| `consumePantryForCookedMeal()` | `completeCookedMeal` |
| `buildFoodResolver()` | Shopping regen, Add Missing, catalogue suggestions, AI suggestions, dashboard, recipes page |
| `foodsMatch()` | Shopping computation, recipe matching, pantry consumption, Add Missing |
| `planMissingIngredientsForShoppingList()` | `addMissingIngredientsToShoppingList` only (canonical; do not add callers) |
| `triggerShoppingListRegeneration()` | All pantry mutations, all planner mutations, cooking completion |
| `categorizeIngredient()` | Shopping list insertion, Add Missing core |
| `parseIngredientRequirement()` | Add Missing, shopping computation, CookingConfirmationModal |

### How to Audit a Shared Component

```bash
# Find all usages of a function or component
rg "insertShoppingListRows" src/
rg "MissingIngredientsSection" src/
rg "buildFoodResolver" src/

# Find all imports of a module
rg "from.*pantry-stacking" src/
rg "from.*semantic-match" src/
```

### What Happens If You Skip This Audit

Previous bugs in ShelfLife were caused by incomplete shared-component audits:
- "Fresh Basil" was dropped from the shopping list because a new category was added to `categorizeIngredient()` but not to `SHOPPING_CATEGORIES` — every consumer of the category list was not audited.
- "Add Missing" on recipe cards added the entire meal plan because `getShoppingList()` called `regenerateShoppingList()` — the read path was not audited when the write path was refactored.

---

## 4. TypeScript Standards

- **Strict mode is enabled.** All code must pass `tsc --noEmit` (run via `npm run build`).
- Never use `any` without an explicit documented reason.
- Never use `@ts-ignore` without a comment explaining why it is necessary.
- Prefer discriminated unions for action results: `{ success: true } | { success: false; error: string }`.
- All Server Action parameters and return types must be explicitly typed.
- Use `as const` when literal types are needed (e.g., `source: "manual" as const`).
- `null` vs `undefined`: prefer `null` for optional database values; use `undefined` only for genuinely absent properties.
- Avoid non-null assertions (`!`) except at Supabase client creation where environment variables are guaranteed.

---

## 5. Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| React components | `kebab-case.tsx` | `recipe-catalog.tsx` |
| Server Actions | `kebab-case.ts` | `shopping-list.ts` |
| Utilities / libraries | `kebab-case.ts` | `ingredient-match.ts` |
| Pure JS modules | `kebab-case.mjs` | `add-missing-ingredients-core.mjs` |
| SQL migrations | `NNN_snake_case.sql` | `012_add_user_preferences.sql` |
| ADRs | `ADR-NNN-short-title.md` | `ADR-008-new-decision.md` |

### TypeScript

| Entity | Convention | Example |
|---|---|---|
| Types and interfaces | PascalCase | `ShoppingListItem`, `FoodResolver` |
| Functions | camelCase | `buildFoodResolver`, `foodsMatch` |
| Constants | SCREAMING_SNAKE_CASE | `SHOPPING_CATEGORIES`, `EMPTY_FOOD_RESOLVER` |
| React components | PascalCase | `MissingIngredientsSection` |
| Server Actions | camelCase | `addMissingIngredientsToShoppingList` |

### Database

| Entity | Convention | Example |
|---|---|---|
| Tables | `snake_case` | `community_foods`, `shopping_list_items` |
| Columns | `snake_case` | `canonical_food_id`, `created_at` |
| Functions / RPCs | `snake_case` | `resolve_community_foods` |
| Indexes | `table_column_idx` | `pantry_canonical_food_idx` |
| Policies | Descriptive sentence | `"Users can view their own pantry items"` |

---

## 6. Folder Organisation

```
src/app/actions/        Server Actions — one file per domain
src/app/api/            Route Handlers — only for binary/AI routes
src/app/*/page.tsx      Page components — Server Components by default
src/components/         Client and shared React components
src/components/ui/      Design-system primitives (Button, Card, Input, etc.)
src/components/ds/      Typography, layout, barrel export
src/lib/                Pure domain logic, SDK wrappers, utilities
src/lib/gemini/         All Gemini AI code
src/lib/supabase/       Supabase client helpers
src/types/              Shared TypeScript types
src/styles/             Design tokens and theme
supabase/migrations/    SQL migration files
tests/                  Node test runner test files
docs/                   Engineering documentation
docs/adr/               Architecture Decision Records
```

**Rules:**
- Business logic belongs in `src/lib/`, not in components or pages
- Components should not contain database calls; these belong in Server Actions or passed as props
- `src/lib/` files may not import from `src/app/` (no circular dependencies)
- `"use server"` belongs only in `src/app/actions/` files and `src/app/api/` route handlers
- `"use client"` belongs in components that require browser APIs, event handlers, or React hooks

---

## 7. Branch Strategy

| Branch | Purpose | Merges Into |
|---|---|---|
| `main` | Production-ready; deployed to Vercel | — |
| `develop` | Feature integration branch | `main` (via PR) |
| `feature/<name>` | Individual features or fixes | `develop` (via PR) |
| `fix/<name>` | Bug fixes | `develop` or `main` (via PR, depending on severity) |

**Rules:**
- Never push directly to `main`
- All features branch from and merge into `develop`
- `develop` → `main` requires a passing build, green tests, and review
- Hotfixes for production bugs may branch directly from `main` and merge back to both `main` and `develop`

---

## 8. Feature Development Lifecycle

```
1. Search repository for existing implementation
        ↓
2. Branch from develop: git checkout -b feature/my-feature develop
        ↓
3. Implement feature using shared canonical implementations
        ↓
4. Write or update regression tests
        ↓
5. npm test && npm run lint && npm run build (all must pass)
        ↓
6. Audit every shared component modified (see Shared Component Policy)
        ↓
7. Update relevant documentation
        ↓
8. Open PR against develop
        ↓
9. Code review
        ↓
10. Merge to develop
        ↓
11. develop → main PR for release
```

---

## 9. Testing Requirements

### Before Every Merge

```bash
npm test          # All tests must pass
npm run lint      # Zero errors
npm run build     # Build must succeed
```

### Regression Tests

Regression tests live in `tests/recipe-shopping-list.test.mjs` and use the Node.js built-in test runner.

**When to add a regression test:**
- Any time a bug is fixed — add a test that would have caught it
- Any time a shared component's behaviour is modified
- Any time a new canonical implementation is created
- Any time a new mutation path is added that affects shopping, pantry, or cooking

**Minimum regression test coverage for new features:**
- Happy path (expected behaviour)
- Deduplication / no double-writes
- Shared component paths (verify all callers produce consistent results)
- Semantic matching where applicable

### What the Test Suite Covers

See [docs/developer-onboarding.md — Running Tests](./docs/developer-onboarding.md#9-running-tests) for the full list of covered scenarios.

---

## 10. Migration Rules

### Hard Rules

1. **Never edit an applied migration.** Once a migration has been applied to any environment (development or production), it is immutable.
2. **Always create a new migration** for any schema change.
3. **All migrations must be additive.** Drop columns or tables only when verified that no code references them, and only after a deprecation period.
4. **Use `IF NOT EXISTS`** on every `CREATE TABLE`, `CREATE INDEX`, and `ADD COLUMN` statement.
5. **Apply RLS** to every new table. No exceptions.
6. **Test migrations** against the development Supabase project before pushing.

### Migration Template

```sql
-- Short description of what this migration does and why.
-- Migration introduced in: v2.x / date

-- 1. Schema changes
ALTER TABLE public.your_table
  ADD COLUMN IF NOT EXISTS new_column text;

-- 2. Indexes
CREATE INDEX IF NOT EXISTS your_table_new_column_idx
  ON public.your_table (new_column);

-- 3. RLS (if new table)
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ..."
  ON public.new_table FOR SELECT
  TO authenticated
  USING (true);
```

---

## 11. Supabase Best Practices

### Authentication

- Always call `supabase.auth.getUser()` (not `getSession()`) in Server Actions and Route Handlers — `getUser()` validates the token against the server, `getSession()` only reads the cookie.
- The `getAuthenticatedUser()` helper in each action module is the canonical way to authenticate. Do not inline the auth check.
- Redirect to `/login` (via Next.js `redirect()`) if no user is found — never return an error.

### Row Level Security

- Every user table must have RLS enabled.
- Every policy must be as restrictive as possible: `auth.uid() = user_id` for user-owned data.
- For tables that all authenticated users should read (taxonomy tables, community foods), use `TO authenticated USING (true)`.
- SECURITY DEFINER functions must be granted explicitly: `GRANT EXECUTE ON FUNCTION ... TO authenticated;` and should `REVOKE ALL FROM PUBLIC` first.

### Community Learning

- Community learning is a **side effect** of user actions.
- It must always be wrapped in a try/catch.
- On failure, it returns an empty cache snapshot (`EMPTY_CACHE`) and the primary write continues.
- **Never block a user action on community learning success.**

### Queries

- Always scope user data queries with `.eq("user_id", user.id)` — never rely solely on RLS in application code.
- Use parallel fetches (`Promise.all`) for independent queries.
- Avoid N+1 patterns: batch database calls where possible.
- Use `select("column1, column2")` rather than `select("*")` — only select what is needed.

---

## 12. Commit Message Conventions

Format: `<type>: <short description in present-tense imperative>`

```
feat: add cooking confirmation modal
fix: prevent Fresh Basil from being dropped when shopping category is missing
refactor: consolidate shopping insertion into shared persistence module
test: add regression test for quantity-aware shopping rows
docs: update api-reference with completeCookedMeal action
chore: update @supabase/ssr to latest
perf: batch community food resolution into single RPC call
```

| Type | Use For |
|---|---|
| `feat` | New user-facing functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behaviour change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Dependency updates, tooling, config |
| `perf` | Performance improvement |

**Rules:**
- Subject line ≤ 72 characters
- Use present-tense imperative ("add" not "added", "fix" not "fixes")
- Do not end subject line with a period
- Include a body with additional context for non-obvious changes

---

## 13. Pull Request Checklist

Complete this checklist before marking a PR ready for review.

### Code Quality
- [ ] `npm test` passes with zero failures
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` succeeds (exit code 0)
- [ ] No `console.log` statements left in production paths
- [ ] No `@ts-ignore` added without documented reason
- [ ] No `any` types introduced without justification

### Shared Components
- [ ] Any modified shared component was audited for all callers
- [ ] All callers of modified shared components still work correctly
- [ ] New functionality routes through existing canonical implementations where applicable
- [ ] No duplicate logic introduced (no new "Add Missing" implementation, no direct pantry INSERT, no direct shopping INSERT)

### Database
- [ ] New migrations use `IF NOT EXISTS` guards
- [ ] New tables have RLS enabled with appropriate policies
- [ ] New SECURITY DEFINER functions revoke public access and grant to `authenticated`
- [ ] Migration applied to development project and verified

### Documentation
- [ ] `docs/api-reference.md` updated for any new or modified Server Actions
- [ ] `docs/database-schema.md` updated for any new tables or columns
- [ ] `docs/release-notes.md` updated for significant changes
- [ ] Inline code comments added for non-obvious logic

### Testing
- [ ] Regression test added for any bug fix
- [ ] Regression test added for any new canonical implementation

---

## 14. Review Checklist

For reviewers of a PR:

- [ ] Does this change follow the Shared Component Policy?
- [ ] Does this change introduce any duplicate business logic?
- [ ] Are all database mutations scoped by `user_id`?
- [ ] Is community learning non-blocking?
- [ ] Does the change preserve the invariant that `getShoppingList()` is read-only?
- [ ] Does any new pantry INSERT go through `insertOrStackPantryItem()`?
- [ ] Does any new shopping INSERT go through `insertShoppingListRows()`?
- [ ] Does any new cooking completion go through `consumePantryForCookedMeal()`?
- [ ] Does any new "Add Missing" implementation route through `addMissingIngredientsToShoppingList()`?
- [ ] Is the build green?
- [ ] Are tests green?

---

## 15. Deployment Checklist

Before deploying to any environment:

- [ ] `npm run build` passes locally
- [ ] `npm run lint` passes locally
- [ ] `npm test` passes locally
- [ ] All new migrations applied to the target Supabase project
- [ ] No secrets in committed code
- [ ] Vercel environment variables set for the target environment
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly for the target environment
- [ ] Supabase Auth redirect URLs updated if any new auth paths were added
- [ ] Manual smoke test: register / login / scan / plan / shop / cook

---

## 16. Release Checklist

Before merging `develop` → `main`:

- [ ] All items in the Deployment Checklist completed
- [ ] `docs/release-notes.md` updated with all significant changes in this release
- [ ] `docs/api-reference.md` reflects any new or modified actions
- [ ] `docs/database-schema.md` reflects any schema changes
- [ ] Migrations applied to Production Supabase project
- [ ] Production environment variables verified in Vercel
- [ ] Vercel preview deployment for `develop` is healthy
- [ ] Full manual regression test against Production or staging environment

---

## 17. Documentation Checklist

When a PR modifies application architecture:

- [ ] **New Server Action** → add to `docs/api-reference.md`
- [ ] **New database table or column** → add to `docs/database-schema.md`
- [ ] **New migration** → add to migration timeline in `docs/database-schema.md`
- [ ] **Significant new feature** → add to `docs/release-notes.md`
- [ ] **New shared canonical implementation** → add to the Shared Component Policy table in this file
- [ ] **New architectural decision** → create a new ADR in `docs/adr/`
- [ ] **Breaking change** → add a Breaking Changes section in `docs/release-notes.md`

---

## 18. Versioning Policy

ShelfLife does not currently use semantic versioning in `package.json` — the `version` field is `0.1.0` regardless of the release commits. Version identity is communicated through:

- Git commit messages (e.g., `Release PantryPal v1.0.0`)
- `docs/release-notes.md`
- Branch names and PR titles

When a formal versioning scheme is adopted, SemVer conventions should apply:
- **MAJOR** version: breaking changes to the public-facing product or API
- **MINOR** version: new features backward-compatible
- **PATCH** version: bug fixes backward-compatible

---

## 19. Bug Reporting

When reporting a bug, include:

1. **Description:** What is the unexpected behaviour?
2. **Expected behaviour:** What should happen?
3. **Steps to reproduce:** Exact steps to reproduce
4. **Affected route/component:** Which page or action?
5. **Browser / environment:** Browser version, OS, local vs production
6. **Relevant error messages:** Console errors, network errors, Supabase errors
7. **Related code paths:** If known (which Server Action, which component)

---

## 20. Feature Requests

When requesting a new feature, include:

1. **Problem statement:** What problem does this solve?
2. **Proposed solution:** How should it work?
3. **Impact on shared components:** Does this touch any canonical implementations?
4. **Impact on database:** New tables or columns required?
5. **Impact on migrations:** New migration required?
6. **Impact on existing tests:** Which tests need updating?
7. **Alternative approaches considered:** Why this approach over others?

For architectural features, submit an ADR in `docs/adr/` using the standard format.
