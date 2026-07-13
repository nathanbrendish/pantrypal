# ShelfLife Developer Onboarding Guide

**Classification:** Internal Engineering Reference  
**Version:** 2.0  
**Status:** Current  
**Audience:** New engineers, onboarding developers, AI coding assistants  
**Last Updated:** July 2026  
**Repository:** https://github.com/nathanbrendish/shelflife  
**Live URL:** https://myshelflife.co.uk

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Technology Stack](#3-technology-stack)
4. [Prerequisites](#4-prerequisites)
5. [Local Setup](#5-local-setup)
6. [Environment Variables](#6-environment-variables)
7. [Supabase Setup](#7-supabase-setup)
8. [Running the Application](#8-running-the-application)
9. [Running Tests](#9-running-tests)
10. [Lint and Build](#10-lint-and-build)
11. [Database Migrations](#11-database-migrations)
12. [Branch and Git Workflow](#12-branch-and-git-workflow)
13. [Development Workflow](#13-development-workflow)
14. [Deployment](#14-deployment)
15. [Debugging](#15-debugging)
16. [Common Issues and Troubleshooting](#16-common-issues-and-troubleshooting)
17. [Documentation Index](#17-documentation-index)
18. [Best Practices](#18-best-practices)
19. [Common Mistakes to Avoid](#19-common-mistakes-to-avoid)

---

## 1. Project Overview

ShelfLife is an AI-powered pantry management, meal planning, and shopping list application. Users scan receipts, manage expiry, plan meals using AI, and generate deterministic shopping lists.

**Core product loop:**
```
Receipt scan → Pantry → Recipe matching → Meal planning → Shopping list → Cook → Pantry updated
```

**Key engineering principles:**
- AI generates meals; mathematics generates shopping lists
- Community Food Intelligence is the single source of truth for food classification
- The pantry caches classification data; it never owns it
- Shared components handle common behaviour — never duplicate logic
- Server Actions handle all mutations; REST API is used only for binary AI routes

**Full technical context:** See [docs/architecture.md](./architecture.md)

---

## 2. Repository Structure

```
shelflife/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── actions/                  # Server Actions (mutations)
│   │   │   ├── auth.ts
│   │   │   ├── pantry.ts
│   │   │   ├── meals.ts
│   │   │   ├── planner.ts
│   │   │   ├── shopping.ts
│   │   │   ├── shopping-list.ts
│   │   │   ├── receipt.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── settings.ts
│   │   │   └── community-intelligence.ts
│   │   ├── api/
│   │   │   └── scan-receipt/route.ts # POST – Gemini Vision OCR
│   │   ├── auth/callback/route.ts    # Supabase auth code exchange
│   │   ├── dashboard/page.tsx
│   │   ├── pantry/page.tsx
│   │   ├── receipt-scanner/page.tsx
│   │   ├── meals/page.tsx
│   │   ├── recipes/page.tsx
│   │   ├── saved-meals/page.tsx
│   │   ├── planner/page.tsx
│   │   ├── shopping/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── platform/page.tsx         # SUPER_ADMIN only
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── components/                   # React UI components
│   │   ├── platform/                 # Platform admin components
│   │   ├── ui/                       # Design-system primitives
│   │   ├── ds/                       # Typography, layout, barrel
│   │   └── *.tsx                     # Feature components
│   ├── data/
│   │   └── recipes.ts                # 100 built-in recipes
│   ├── lib/                          # Pure logic, SDK wrappers
│   │   ├── gemini/                   # AI config, prompts, parsers, retry
│   │   ├── supabase/                 # client.ts, server.ts, middleware.ts
│   │   └── *.ts / *.mjs              # Domain utilities
│   ├── middleware.ts                 # Session refresh + route guards
│   ├── styles/                       # tokens.css, theme.css, base.css
│   └── types/                        # TypeScript type definitions
├── supabase/
│   └── migrations/                   # 001–011 SQL migrations
├── tests/
│   └── recipe-shopping-list.test.mjs # Node test runner regression tests
├── scripts/
│   ├── generate-recipes.mjs
│   └── add-recipe-instructions.mjs
├── docs/                             # Engineering documentation
│   └── adr/                          # Architecture Decision Records
├── public/                           # Static assets
├── .env.local                        # Local secrets (not committed)
├── package.json
├── tsconfig.json
├── next.config.ts
└── eslint.config.mjs
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.2.10 | App Router, Server Components, Server Actions |
| UI | React | 19.2.4 | Component model |
| Language | TypeScript | 5.x | Type safety (strict mode) |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with design tokens |
| Database | Supabase (PostgreSQL) | Latest | Auth, database, RLS, RPC functions |
| Auth | Supabase Auth + `@supabase/ssr` | 0.12.0 | Session management, cookie-based SSR |
| AI | Google Gemini (`@google/generative-ai`) | 0.24.1 | Receipt OCR, meal suggestions, meal planning |
| Icons | Lucide React | 1.24.0 | Icon set |
| Testing | Node.js built-in test runner | — | `node --test` |
| Deployment | Vercel | — | Production hosting, preview deployments |
| CSS processing | `@tailwindcss/postcss` | 4.x | PostCSS integration |
| Linting | ESLint 9 + `eslint-config-next` | — | Code quality |

For the rationale behind these choices, see [docs/adr/](./adr/).

---

## 4. Prerequisites

### Required Software

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.18.0+ | Required by Next.js 16. Use nvm or fnm to manage versions |
| npm | 9.x+ | Comes with Node.js |
| Git | 2.x+ | |
| Supabase CLI | Latest | For migration management |

### Recommended Tools

- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.sh/)
- VS Code extensions: ESLint, Tailwind CSS IntelliSense, Prisma (for SQL syntax)
- [Supabase Studio](https://supabase.com/dashboard) — web UI for database inspection
- [Postman](https://www.postman.com/) or similar — for testing the `/api/scan-receipt` route

### Checking Your Environment

```bash
node --version     # Should be >= 18.18.0
npm --version      # Should be >= 9.0.0
git --version
npx supabase --version
```

---

## 5. Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nathanbrendish/shelflife.git
cd shelflife
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your local environment file

```bash
cp .env.local.example .env.local   # If template exists
# Or create it manually — see Section 6
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Environment Variables

Create a `.env.local` file in the project root. **This file must never be committed.**

```bash
# .env.local

# Supabase — Development project
NEXT_PUBLIC_SUPABASE_URL=https://<your-dev-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-dev-anon-key>

# Google Gemini AI
GEMINI_API_KEY=<your-gemini-api-key>

# Optional: override the default model (gemini-3.5-flash)
# GEMINI_MODEL=gemini-3.5-flash

# Site URL — required for auth redirects (email confirmation, password reset)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variable Reference

| Variable | Where Used | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Yes | RLS-scoped anon key. Public but limited by RLS |
| `GEMINI_API_KEY` | Server only | Yes | Powers receipt OCR, meal suggestions, meal planning |
| `GEMINI_MODEL` | Server only | No | Overrides default `gemini-3.5-flash` |
| `NEXT_PUBLIC_SITE_URL` | Server + auth | Yes | Canonical origin. Used in `emailRedirectTo` for auth emails |

### Supabase Project Environments

There are two Supabase projects:

| Environment | Purpose | Used When |
|---|---|---|
| **Development** | Feature development, testing, migrations | `npm run dev`, PR previews |
| **Production** | Live traffic at myshelflife.co.uk | `main` branch Vercel deployment |

> **Never connect your local environment to the Production Supabase project.** Always use the Development project for local development and migration testing.

---

## 7. Supabase Setup

### Install the Supabase CLI

```bash
# macOS / Linux (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (cross-platform)
npm install -g supabase
```

### Link Your Project

```bash
# Login
supabase login

# Link to the development project
# Find your project ref in the Supabase dashboard URL: supabase.com/dashboard/project/<ref>
supabase link --project-ref <development-project-ref>
```

### Apply Migrations

```bash
# Apply all pending migrations to the linked project
supabase db push
```

### Inspect Migration Status

```bash
supabase migration list
```

### Creating a New Migration

```bash
# Preferred: create an empty file with the correct naming convention
# Naming: NNN_descriptive_snake_case_name.sql
# Example:
touch supabase/migrations/012_add_user_preferences.sql
```

See [Migration naming conventions](#migration-naming-conventions) below.

### Resetting the Database (Development Only)

```bash
# WARNING: Destroys all data. Development only.
supabase db reset
```

If there is no `supabase/config.toml`, a full local reset is not possible without one. In that case, apply migrations manually via `supabase db push` against a fresh project.

---

## 8. Running the Application

### Development Server

```bash
npm run dev
```

Uses Next.js development mode with Turbopack. Hot reload is active.

### Production Build

```bash
npm run build
npm start
```

### Verify Environment Variables Loaded

If you suspect environment variable issues in development, add a temporary log (then remove it) in a server action, or check the Vercel runtime logs for preview deployments. See [docs/development-log.md](./development-log.md) for the history of environment variable debugging.

---

## 9. Running Tests

```bash
npm test
```

This runs `node --test tests/*.test.mjs`. The test suite is in `tests/recipe-shopping-list.test.mjs` and uses Node.js's built-in test runner (no external test framework required).

### What the tests cover

- `addMissingIngredientsToShoppingList` does not call `regenerateShoppingList`
- `getShoppingList` is read-only (no planner imports)
- Multiple missing ingredients are all inserted
- Semantic matching: covered ingredients are skipped
- Semantic non-match: missing ingredients are inserted
- Unknown ingredients (not in Knowledge Graph) fall back to display name
- Duplicate protection: repeated invocations do not create duplicates
- All UI entry points use `MissingIngredientsSection` → `AddMissingToShoppingButton`
- Shopping UI renders every category emitted by `categorizeIngredient()`
- Shopping demand engine aggregates quantities and subtracts pantry supply
- Shopping insertions use the shared `insertShoppingListRows()` path
- Cooking completion uses the canonical pantry consumption engine
- Cooking confirmation supports used / modified / skipped / extra usage

### Running a single test file manually

```bash
node --test tests/recipe-shopping-list.test.mjs
```

---

## 10. Lint and Build

### Lint

```bash
npm run lint
```

Uses ESLint 9 with `eslint-config-next`. Zero lint errors is a hard requirement before merging.

### Type Check

The Next.js build performs a full TypeScript type check. Run it explicitly with:

```bash
npm run build
```

### Build

```bash
npm run build
```

A green build (`exit code 0`) is required before any merge or deployment. Never disable TypeScript errors with `@ts-ignore` without documenting the reason.

---

## 11. Database Migrations

### Migration Naming Convention

```
NNN_descriptive_snake_case_name.sql
```

| Part | Rule | Example |
|---|---|---|
| `NNN` | 3-digit zero-padded sequence | `012`, `013` |
| `_` | Separator | — |
| `descriptive_name` | Snake case, describes the change | `add_user_preferences` |

**Examples:**
```
001_pantry_items.sql
002_v2_features.sql
011_cooking_behavior_observations.sql
012_add_user_preferences.sql    ← next migration
```

### Migration Rules

- **Never edit a migration that has already been applied** to any environment
- All changes must be **additive** — new migrations only
- Use `ADD COLUMN IF NOT EXISTS` to prevent replay errors
- Use `CREATE TABLE IF NOT EXISTS` for new tables
- Include a comment block at the top explaining the migration's purpose
- Test every migration in a local Docker environment or against the development project before pushing

### Current Migration Chain

| # | File | Key Changes |
|---|---|---|
| 001 | `001_pantry_items.sql` | Creates `pantry` table |
| 002 | `002_v2_features.sql` | Adds qty/expiry to pantry; creates meals_saved, meal_plans, meal_plan_items, shopping_list_items |
| 003 | `003_delete_account.sql` | `delete_user_account()` RPC |
| 004 | `004_community_food_intelligence.sql` | Platform roles, Community Foods, aliases, votes, moderation history |
| 005 | `005_food_taxonomy.sql` | food_categories, food_subcategories, storage_locations (with seed data) |
| 006 | `006_community_classification.sql` | ID-based classification, classification_version trigger |
| 007 | `007_pantry_storage_and_cache.sql` | Pantry storage_location_id and classification cache columns |
| 008 | `008_semantic_matching.sql` | substitutable flag, batch resolve RPC, seed pasta/cheese families |
| 009 | `009_shopping_list_metadata.sql` | needed_for_meals, shortage_label, source on shopping_list_items |
| 010 | `010_shopping_demand_details.sql` | demand_quantity, pantry_quantity, used_by_meals on shopping_list_items |
| 011 | `011_cooking_behavior_observations.sql` | cooking_behavior_observations table |

For full column-by-column schema, see [docs/database-schema.md](./database-schema.md).

### Supabase Auth Email Redirect Setup

In the Supabase dashboard for any project, add these URLs under **Authentication → URL Configuration → Redirect URLs**:

```
http://localhost:3000/auth/callback
https://myshelflife.co.uk/auth/callback
https://<vercel-preview-url>/auth/callback
```

---

## 12. Branch and Git Workflow

### Branches

| Branch | Purpose | Deploys To |
|---|---|---|
| `main` | Production-ready code | Vercel production (myshelflife.co.uk) |
| `develop` | Feature integration branch | Vercel preview deployment |
| `fix/migration-chain` | Historical: migration repair work | — |
| `feature/<name>` | Individual features | Vercel preview (per branch) |

### Git Flow

```
main
  └─── develop
            └─── feature/my-feature
```

1. Branch from `develop` for features
2. Open PR against `develop`
3. `develop` → `main` PR for releases

### Commit Messages

Use clear, present-tense imperative:

```
feat: add cooking confirmation modal
fix: prevent Fresh Basil from being dropped in Add Missing
refactor: consolidate shopping insertion into shared persistence module
docs: add ADR-005 for semantic matching
test: add regression test for quantity-aware shopping rows
chore: bump package dependencies
```

Format: `<type>: <short description>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

---

## 13. Development Workflow

### Adding a New Feature

1. **Branch** from `develop`
2. **Search** the repository for any existing implementation of similar logic before writing new code
3. **Build** on shared components where they exist (`MissingIngredientsSection`, `IngredientFields`, `insertShoppingListRows`, `insertOrStackPantryItem`, etc.)
4. **Write** server actions for mutations; use `revalidatePath` to invalidate cache
5. **Test** — run `npm test`, `npm run lint`, `npm run build` before raising a PR
6. **Document** — if the change modifies shared architecture, update the relevant doc

### Adding a New Database Table or Column

1. Create a new migration file following naming conventions
2. Use `ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS`
3. Add RLS policies for every new table
4. Update `docs/database-schema.md` with the new table/column
5. Update `src/types/` with new TypeScript types
6. Apply via `supabase db push`

### Adding a New Server Action

1. Add to the appropriate `src/app/actions/` file
2. Always authenticate via `getAuthenticatedUser()` at the top
3. Scope DB queries with `user_id = user.id`
4. Call `revalidatePath()` for all affected routes after mutations
5. Return typed discriminated union: `{ success: true }` or `{ success: false; error: string }`
6. Document the new action in `docs/api-reference.md`

### Modifying a Shared Component

Before modifying any shared component, utility, or server action:

1. Run `rg "<component-name>" src/` to find every caller
2. Verify the change is backward-compatible for all callers
3. Test all affected pages manually

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full shared component policy.

---

## 14. Deployment

### How Deployment Works

ShelfLife deploys on Vercel. All pushes to `main` trigger a production deployment at https://myshelflife.co.uk.

### Required Vercel Environment Variables

Set these in the Vercel dashboard for both Preview and Production environments:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GEMINI_API_KEY
GEMINI_MODEL          (optional)
NEXT_PUBLIC_SITE_URL  (set to https://myshelflife.co.uk for production)
```

### Pre-Deployment Checklist

```
[ ] npm run build passes locally with exit code 0
[ ] npm run lint passes with zero errors
[ ] npm test passes
[ ] All new migrations applied to the target Supabase project
[ ] Supabase redirect URLs updated if new auth paths added
[ ] No secrets committed to the repository
[ ] NEXT_PUBLIC_SITE_URL is set correctly for the environment
```

### Applying Migrations to Production

```bash
# Link to production project first
supabase link --project-ref <production-project-ref>

# Then push
supabase db push

# Switch back to development
supabase link --project-ref <development-project-ref>
```

> Do not run `supabase db reset` against the production project. It destroys all data.

---

## 15. Debugging

### Supabase Errors

| Error | Likely Cause |
|---|---|
| `"Invalid API key"` | Wrong `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the environment |
| `relation "..." does not exist` | Migration not applied. Run `supabase db push` |
| `Not authenticated` | `auth.uid()` is NULL in an RPC; action called without a valid session |
| `permission denied` | RLS policy missing or SECURITY DEFINER function not granted to `authenticated` role |

### Gemini Errors

| Error | Likely Cause |
|---|---|
| `"Meal suggestions are not configured."` | `GEMINI_API_KEY` not set |
| 404 on model | Model name invalid. Check `GEMINI_MODEL` env; default is `gemini-3.5-flash` |
| 503 intermittent | Transient provider overload; retry logic handles this automatically |

See `src/lib/gemini/map-gemini-error.ts` for the full error mapping.

### Shopping List Debugging

If the shopping list contains unexpected items, check:
1. Was `regenerateShoppingList()` called unintentionally? It should only be triggered by pantry/planner mutations.
2. Was `getShoppingList()` returning cached stale data? It reads `shopping_list_items` directly — no computation.
3. Are `demand_quantity` / `pantry_quantity` null? This means the ingredient arrived via `addMissingIngredientsToShoppingList` without a quantity string.

### Pantry Classification Debugging

If pantry items show "Unclassified":
1. `confidence_score < 40` — the food has too few community votes
2. `canonical_food_id` is NULL — the food was never resolved against the Knowledge Graph
3. Call `refresh_stale_pantry_classifications()` manually via Supabase SQL editor to force a cache refresh

---

## 16. Common Issues and Troubleshooting

| Issue | Symptom | Solution |
|---|---|---|
| Auth redirect fails | `/auth/callback` returns error | Check `NEXT_PUBLIC_SITE_URL` and Supabase redirect URL allow-list |
| Shopping list empty after regen | No items returned | Check meal plan exists (`meal_plans` table); check pantry not empty |
| Receipt scan fails with EMPTY_RESULT | No ingredients extracted | Image quality too low; try a clearer photo |
| Build fails with type error | `npm run build` exits non-zero | Fix TypeScript errors; never use `@ts-ignore` without documented reason |
| Migrations conflict | `relation already exists` | Use `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` |
| SUPER_ADMIN redirect loop | `/platform` redirects immediately | User row missing in `user_roles` for `SUPER_ADMIN` role; add via Supabase dashboard |
| Gemini returns empty meal plan | No meals parsed | Retry; if persistent, check prompt in `src/lib/gemini/planner-prompt.ts` |

### Useful Commands

```bash
# Start dev server
npm run dev

# Run all tests
npm test

# Lint
npm run lint

# Build
npm run build

# Apply pending migrations
supabase db push

# Check migration status
supabase migration list

# Open Supabase SQL editor (redirects to dashboard)
supabase dashboard

# Search codebase for a symbol
rg "symbolName" src/

# Search for component usage
rg "insertShoppingListRows" src/

# Check git status
git status

# Check current branch
git branch
```

---

## 17. Documentation Index

| Document | Purpose |
|---|---|
| [README.md](../README.md) | Getting started, quick reference |
| [docs/architecture.md](./architecture.md) | Full system architecture (canonical reference) |
| [docs/api-reference.md](./api-reference.md) | Every server action and API route |
| [docs/database-schema.md](./database-schema.md) | Every table, column, constraint, RLS policy |
| [docs/release-notes.md](./release-notes.md) | Full release history |
| [docs/development-log.md](./development-log.md) | Session-by-session build log (PantryPal → ShelfLife v1) |
| [docs/developer-onboarding.md](./developer-onboarding.md) | This document |
| [docs/product-roadmap.md](./product-roadmap.md) | Strategic evolution and planned features |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Engineering standards and contribution process |
| [docs/adr/](./adr/) | Architecture Decision Records |
| [docs/community-food-intelligence.md](./community-food-intelligence.md) | Community Food Intelligence deep-dive |

---

## 18. Best Practices

### Always

- Authenticate before every database operation: `const { supabase, user } = await getAuthenticatedUser()`
- Scope every query with `eq("user_id", user.id)`
- Return typed error responses — never throw to the client
- Run `npm test && npm run lint && npm run build` before pushing
- Use `revalidatePath()` after all mutations that affect page data
- Use `insertOrStackPantryItem()` for every pantry insert — never insert directly
- Use `insertShoppingListRows()` for every shopping list insert — never insert directly
- Use `addMissingIngredientsToShoppingList()` via `MissingIngredientsSection` — never build custom Add Missing implementations
- Add `IF NOT EXISTS` to every migration statement
- Keep community learning non-blocking: wrap in try/catch, return empty cache on failure

### Never

- Connect local development to the Production Supabase project
- Edit a migration that has already been applied to any environment
- Duplicate "Add Missing Ingredients" logic — route everything through `addMissingIngredientsToShoppingList()`
- Duplicate pantry insertion logic — use `insertOrStackPantryItem()`
- Duplicate shopping insertion logic — use `insertShoppingListRows()`
- Generate shopping list content with AI (the shopping list is deterministic math, not AI)
- Call `regenerateShoppingList()` from a read path
- Store sensitive credentials in anything other than `.env.local` (local) or Vercel environment variables (deployed)

---

## 19. Common Mistakes to Avoid

| Mistake | Consequence | Correct Approach |
|---|---|---|
| Inserting directly into `pantry` | Bypasses stacking logic; creates duplicate rows | Always use `insertOrStackPantryItem()` |
| Inserting directly into `shopping_list_items` | Bypasses type safety and quantity fields | Always use `insertShoppingListRows()` |
| Building a custom "Add Missing" implementation | Inconsistent behaviour across pages; bugs difficult to trace | Route through `addMissingIngredientsToShoppingList()` via `MissingIngredientsSection` |
| Calling `regenerateShoppingList()` on page load | Forces full planner recomputation on every read; defeats persistence | `getShoppingList()` for reads; regen only on mutations |
| String comparison for ingredient matching | "Macaroni" does not match "Pasta"; recipe matching breaks | Use `foodsMatch()` with a `FoodResolver` built by `buildFoodResolver()` |
| Editing an applied migration | Creates chain inconsistency; `supabase db push` will fail | Create a new migration instead |
| Setting `NEXT_PUBLIC_SITE_URL` to production URL locally | Auth redirects in local testing go to production | Use `http://localhost:3000` locally |
| Forgetting `revalidatePath` after a mutation | Stale UI data; page does not refresh after action | Add `revalidatePath()` to all mutation actions |
| Using `day_index` for sort order | Planner reorder corrupts day assignments | `day_index` is immutable post-creation; use `sort_order` for ordering only |
| Hardcoding food synonym lists | Brittle; misses variants; breaks with new foods | Use the Community Food Intelligence Knowledge Graph and `buildFoodResolver()` |
