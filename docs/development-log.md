# PantryPal Development Log

**Date:** Sunday, 12 July 2026  
**Project version:** v1.0.0 (`package.json` still shows `0.1.0`; release commits: *Release PantryPal v1.0.0* / *Release v1.0.0: Complete UI/UX overhaul and account management*)  
**Stack:** Next.js 16.2 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase Auth/SSR · Google Gemini (`@google/generative-ai`) · Lucide icons

---

## 1. Executive Summary

PantryPal began this session as a greenfield Create Next App scaffold and ended as a feature-complete, design-system-backed consumer kitchen app ready to tag as v1.0.0.

In roughly one continuous build (evening of 11 July through early morning of 12 July), the product progressed through:

- Auth-only MVP (login / register / protected dashboard)
- Pantry CRUD on Supabase
- Repeated UI polish passes (consumer feel, then light+dark, then premium food-app aesthetic)
- Receipt upload → Gemini vision extraction → review → pantry insert
- AI meal suggestions with "I cooked this" pantry deduction
- V2 suite: global receipt drop, quantities/expiry, saved meals, meal planner, shopping list, dashboard stats, smart recipe catalogue
- Reliability & UX fixes: shopping regeneration as deterministic logic, planner reorder bug, Gemini error mapping, email confirmation callbacks
- Account experience: forgot/reset password, settings, profile/email/password, delete account
- Final UI overhaul for v1.0.0 polish
- Central design-token system so future UI changes are maintainable

**Maturity estimate:** Production-ready v1.0 for a single-tenant consumer MVP. Core loops work end-to-end; auth, RLS, AI paths, and a coherent design system are in place. Remaining gaps are operational (apply migrations in every environment, harden delete-account RPC privileges, theme toggle, richer testing) rather than missing primary features.

---

## 2. Timeline

Logical order reconstructed from commits and the agent transcript.

### Milestone A — Authentication foundation

- **What:** Supabase SSR clients, `/login`, `/register`, `/dashboard`, middleware redirects, logout.
- **Why:** Nothing else is safe without identity and session cookies.
- **Dependencies:** Env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Problems:** Classic SSR cookie wiring; middleware must refresh sessions.
- **Outcome:** Protected app shell; unauthenticated users bounce to login.

### Milestone B — Pantry MVP

- **What:** `/pantry`, add/delete ingredients against table `pantry` (live schema; migration 001 named `pantry_items` historically).
- **Why:** Pantry is the product's source of truth.
- **Outcome:** Alphabetical list + empty state + server actions.

### Milestone C — Early UI polish (×2–3 passes)

- **What:** Cards, spacing, navbar, empty states; later light+dark via `prefers-color-scheme`.
- **Why:** MVP UI felt like a tutorial; product vision required "two minutes from Tesco bag → cook."
- **Outcome:** Shared early UI primitives (`Button`, `Card`, `EmptyState`, etc.).

### Milestone D — Receipt scanner (upload-only, then AI)

- **What:** `/receipt-scanner` with drag/drop preview; then `POST /api/scan-receipt` → Gemini vision → review UI → `saveScannedIngredients`.
- **Why:** Manual pantry entry does not match the "scan receipt" promise.
- **Problems:**
  - `GEMINI_API_KEY` not visible until Next/Turbopack env loading was verified.
  - Model `gemini-2.5-flash` 404 for new users → switched to supported multimodal model (configurable via `GEMINI_MODEL`, default later `gemini-3.5-flash`).
  - Transient 503s → exponential retry.
- **Outcome:** Reliable extract → review → pantry flow.

### Milestone E — Meal suggestions

- **What:** `/meals`, Gemini JSON meals from pantry, cook action removes used ingredients.
- **Why:** Completes the receipt → pantry → cook loop.
- **Outcome:** Can Cook Now / Nearly There / Shopping Trip sections.

### Milestone F — V2 features

- **What:** Global receipt drop; pantry quantity/unit/expiry; `meals_saved`; meal plans + items; shopping list; dashboard stats; 100+ recipe catalogue; smart ranking.
- **Why:** MVP cooked one meal; V2 plans a week and shops the gaps.
- **Problems:** Migration file briefly missing → recreated as `002_v2_features.sql`.
- **Outcome:** Full household kitchen workflow.

### Milestone G — Shopping list redesign

- **What:** Shopping became deterministic from plan vs pantry (`src/lib/shopping-list.ts`), not AI-generated. Auto-regenerate on pantry/plan changes.
- **Why:** AI shopping lists were unpredictable; pantry must be source of truth.
- **Outcome:** Stable checklist with categories, checkboxes, print/PDF.

### Milestone H — Usability & AI reliability

- **What:** Pantry browser (search, categories, compact mode); recipe catalogue filters; context-aware Gemini errors; planner retry; "add missing to shopping."
- **Bugs fixed:**
  - Planner reorder overwrote `day_index` with list position.
  - First planner click failed due to receipt-specific error strings.
  - Email confirmation needed `auth/callback` + `emailRedirectTo` / `NEXT_PUBLIC_SITE_URL`.
- **Outcome:** Trustworthy planner + auth emails.

### Milestone I — Account & final UI for v1.0.0

- **What:** Registration/login UX (strength, confirm, show/hide); forgot/reset password; `/settings` (profile, account, appearance placeholder, about); delete account RPC; home dashboard; shopping celebration; then central design tokens.
- **Why:** Feature-complete product still felt like a SaaS dashboard; tokens prevent style drift.
- **Outcome:** Polished consumer UI + maintainable design system; production build green.

```
Auth → Pantry → UI polish → Receipt upload → Gemini OCR
  → Meals AI → V2 (plans/shop/recipes/expiry)
  → Deterministic shopping + bugfixes
  → Account + premium UI + design tokens
  → v1.0.0 release commits
```

---

## 3. Features Implemented

| Feature | Purpose | Architecture | User flow | Technical notes |
|---|---|---|---|---|
| Authentication | Identify users; protect data | Supabase Auth + `@supabase/ssr` + middleware | Register/login → session cookie → dashboard | Server actions in `auth.ts`; callback route exchanges code |
| Receipt scanning | Import groceries from photo | Client upload → Route Handler → Gemini vision → review → server action | Drop/select image → Scan → edit checks → Add to pantry | `src/app/api/scan-receipt/route.ts` |
| Global receipt drop | Zero-friction capture | React context + overlay provider | Drag image anywhere → `/receipt-scanner` prefilled | `global-receipt-drop`, `receipt-drop-context` |
| Pantry | Inventory source of truth | Supabase `pantry` + RLS + server actions | Browse/search/categorise; add/edit/delete | `pantry-browser`, quantities, units, expiry |
| Expiry tracking | Reduce waste | Client status helpers + badges | Expiring soon on dashboard & pantry | `lib/expiry.ts`, inferred dates on scan |
| Recipe catalogue | Deterministic cook ideas | Seeded `data/recipes.ts` (~100+) | Search/filter/save; pantry match % | `recipe-match`, `recipe-ranking` |
| Meal suggestions (AI) | Creative ideas from pantry | Gemini + JSON parse | Suggest → Cook / Save / Add missing | Prefers expiry-aware ranking when combined with catalogue |
| Saved meals | Cookbook of favourites | `meals_saved` | Save from meals/recipes → `/saved-meals` | JSON arrays for used/missing ingredients |
| Meal planner | Week structure | `meal_plans` + `meal_plan_items` + Gemini | Generate 3/5/7 days → reorder/replace | Drag reorder updates `sort_order` only |
| Shopping list | Buy what's missing | Deterministic diff → `shopping_list_items` | Auto list → check → print | No AI generation for list contents |
| Add missing items | Bridge meals → shop | Server action merge into shopping | Button on meal/recipe/planner cards | `addMissingIngredientsToShoppingList` |
| Dashboard | Home cockpit | Aggregated `getDashboardHomeData` | Welcome → recommendation → stats → actions → sections | Quick actions show live counts |
| Navigation | Wayfinding | Sticky nav + mobile bottom nav + profile menu | Desktop pills; mobile tab bar | Settings linked from menu & nav |
| Search / filters | Scale large lists | Shared `SearchBar` / `FilterBar` | Pantry, recipes filters, shopping search | Sticky search on pantry/shopping |
| Settings / account | Self-serve account | Settings actions + Supabase user metadata | Profile, email, password, delete | Appearance placeholder |
| Password reset | Recover access | Supabase `resetPasswordForEmail` | Forgot → email → callback → reset page | `next=/reset-password` |
| Design system | Consistency | CSS tokens + Tailwind `@theme` + DS components | All pages consume tokens | Hex only in `tokens.css` |
| Animations | Premium feel | Shared keyframes in `theme.css` | Hover lift, check pop, fade/slide | Respects `prefers-reduced-motion` |
| Accessibility | Inclusive UI | Focus rings, ARIA, touch targets | Keyboard menus/dialogs | Large shopping checkboxes |
| Dark mode | Comfort | System preference via semantic tokens | Automatic | No manual theme switch yet |
| Print / export PDF | Shop with paper | `window.print` + print CSS | Shopping trip actions | Export PDF uses print dialog |

---

## 4. Database Changes

> **Important naming note:** Migration `001_pantry_items.sql` creates `pantry_items`, but the live application queries `public.pantry`. V2 migration 002 extends `pantry`. Operators must align production schema with the app's table name.

### Tables (application)

| Table | Purpose | Key columns | Relationships |
|---|---|---|---|
| `pantry` | Per-user ingredients | `id`, `user_id`, `ingredient_name`, `quantity`, `unit`, `expiry_date`, timestamps | `user_id` → `auth.users` |
| `meals_saved` | Bookmarked meals | `meal_name`, `description`, `ingredients_used jsonb`, `missing_ingredients jsonb` | `user_id` → `auth.users` |
| `meal_plans` | Plan headers | `days_count` ∈ `{3, 5, 7}` | `user_id` → `auth.users` |
| `meal_plan_items` | Day meals | `plan_id`, `day_index`, `sort_order`, meal fields + jsonb ingredients | `plan_id` → `meal_plans`; `user_id` → `auth.users` |
| `shopping_list_items` | Checklist | `ingredient_name`, `qty`/`unit`, `category`, `checked` | `user_id` → `auth.users` |

### Columns added on `pantry` (migration 002)

- `quantity numeric NOT NULL DEFAULT 1`
- `unit text`
- `expiry_date date`
- `updated_at timestamptz`

### RLS

Every user table enables RLS with policies of the form `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE (or FOR ALL). Users never see each other's rows via the anon key + user JWT.

### Account deletion (migration 003)

`public.delete_user_account()` — SECURITY DEFINER function that deletes `auth.users` for `auth.uid()`. Cascades wipe user-owned rows. Granted to `authenticated`.

```
auth.users
    ├── pantry
    ├── meals_saved
    ├── meal_plans
    │       └── meal_plan_items
    └── shopping_list_items
```

---

## 5. AI Features

### Integration

- **Package:** `@google/generative-ai`
- **Model:** `GEMINI_MODEL` env or default `gemini-3.5-flash` (`lib/gemini/config.ts`)
- **Key:** `GEMINI_API_KEY` (server-only)

### When AI is used

| Capability | Entry | Prompt / parse |
|---|---|---|
| Receipt OCR + ingredient extract | `/api/scan-receipt` | `receipt-prompt` + `parse-ingredients` |
| Meal suggestions | `suggestMeals` action | `meal-prompt` + `parse-meals` |
| Weekly plan generation | `generateMealPlan` | `planner-prompt` + `parse-meal-plan` |
| Replace one planned meal | `replaceMealPlanItem` | Planner-style Gemini call |

### When deterministic logic is used instead

| Capability | Why not AI |
|---|---|
| Shopping list contents | Pantry is source of truth; reproducible |
| Recipe catalogue match % | Fuzzy string matching (`ingredient-match`) |
| Recipe ranking / cookability | Scoring + expiry bonuses |
| Shopping regenerate after pantry/plan change | Pure function + DB write |
| Expiry status labels | Date math |
| Password strength / email validation | Client + shared validators |

### Reliability

- **Retry:** Up to 3 attempts, backoff 1 s / 2 s / 4 s for 502/503/504 (`lib/gemini/retry.ts`; planner variant exists).
- **Error mapping:** `mapGeminiError(context)` — receipt vs meals vs planner messaging (fixed first-click planner bug).
- **Prompt engineering:** Strict JSON-only, ignore non-food on receipts, standardise names, prioritise near-expiry ingredients in meals/plans.

### Smart AI + catalogue

Built-in recipes are ranked before/alongside Gemini so suggestions feel grounded and "nearly there" gaps are clear.

---

## 6. User Experience Improvements

| Improvement | Why it helps |
|---|---|
| Global receipt drop | Matches real behaviour: phone photo → drop into app |
| Ingredient review before save | Users trust OCR only if they can correct it |
| Sticky pantry search + `/` shortcut | Large pantries stay usable |
| Compact / comfortable density | Phone vs desktop scanning |
| Expiry colour language (fresh/soon/expired) | Waste reduction without reading dates |
| Dashboard as home screen | Reduces "where do I start?" |
| Quick actions with live counts | Status without opening each page |
| Compact recommendation hero | Less scroll, clearer CTAs |
| Shopping progress + celebration | Gamifies finishing the shop |
| Animated checkboxes / strike-through | Clear checked state |
| Meal cards: match % + Cook Tonight / Save | Hierarchy matches decisions |
| Planner timeline + day badges | Visual week structure |
| Friendly empty states | Empty apps feel unfinished otherwise |
| Skeletons on AI waits | Perceived performance |
| Auth live validation | Prevents failed submissions |
| Settings profile hero | Account feels first-class |
| Mobile bottom nav | Thumb-friendly primary destinations |
| Print shopping list | Real supermarket use |

---

## 7. Design System

### Token source of truth

- `src/styles/tokens.css` — `--ds-*` variables (colour, type, space, radius, shadow, motion, z-index, containers, heights)
- `src/styles/theme.css` — Tailwind v4 `@theme` inline maps to utilities (`bg-background`, `text-muted`, …) + `.ds-*` component/utility classes
- `src/styles/base.css` — body uses tokens
- `src/lib/design-system.ts` — typed `ds.fadeIn`, `ds.card`, etc.

> **Rule for future UI work:** change tokens first; do not reintroduce hex in components. Hex should remain only in `tokens.css`.

### Colours (semantic)

`background` / `surface` / `card` / `border` · `text` / `muted` · `primary` (+ `soft`/`hover`) · `success` / `warning` / `danger` · `expired` / `expiring` / `fresh` · accent `violet`/`rose`/`amber`/`cyan`.

### Typography

Classes/components: Display, H1–H3, Section Title, Body Large/Body, Small, Caption, Label, Button text.

### Spacing / radius / elevation

Scale `xs`→`4xl`; radii `sm`→`pill` (~20 px cards); shadows `sm`→`xl` + primary glow.

### Animations

`fade-in`, `slide-up`/`down`, `scale-in`, `toast`, `check-pop`, `heart`, `loading-pulse`, card hover lift, press scale, collapse grid; reduced-motion safe.

### How to change UI later

- Edit `--ds-color-primary` (etc.) in tokens.
- Or adjust `.ds-card` / typography in `theme.css`.
- Compose pages from `AppCard`, `PageHeader`, `ContentSection`, `ResponsiveGrid`, `Button` variants.
- Prefer barrel `@/components/ds`.

---

## 8. Project Structure

```
pantrypal/
├── src/
│   ├── app/                 # Routes, layouts, API, server actions
│   │   ├── actions/         # Auth, pantry, meals, planner, shopping, settings, dashboard
│   │   ├── api/scan-receipt/
│   │   ├── auth/callback/
│   │   └── [pages]/         # dashboard, pantry, meals, recipes, planner, shopping, settings, auth pages
│   ├── components/          # Feature UI + ui/ primitives + ds/
│   ├── data/recipes.ts      # Seeded recipe catalogue
│   ├── lib/                 # Gemini, matching, shopping math, supabase, tokens helpers
│   ├── styles/              # tokens.css, theme.css, base.css
│   ├── types/               # pantry, meals, recipes, v2
│   └── middleware.ts
├── supabase/migrations/     # 001–003
├── .env.local               # secrets (not committed)
└── package.json
```

| Folder | Responsibility |
|---|---|
| `app/` | Routing, RSC pages, route handlers, server actions |
| `components/` | Presentational + interactive client UI |
| `components/ui/` | Design-system primitives |
| `components/ds/` | Typography, layout grids, barrel |
| `lib/` | Pure logic, SDK wrappers, validation |
| `data/` | Static content (recipes) |
| `types/` | Shared TypeScript contracts |
| `styles/` | Design tokens & theme |
| `supabase/` | SQL migrations / RPC |

---

## 9. Reusable Components

| Component | Typical usage |
|---|---|
| `AppCard` / `Card` | Everywhere surfaces |
| `Button` (+ Primary/Secondary/Danger) | CTAs |
| `StatusBadge` / `ExpiryBadge` | Status pills |
| `PageHeader` / `SectionHeader` | Page titles |
| `EmptyState` | Empty pantry, shopping, saved meals |
| `LoadingSkeleton` / `ListSkeleton` / `MealSkeleton` | Loading |
| `SearchBar` | Pantry, recipes, shopping |
| `FilterBar` / `FilterSelect` | Recipes |
| `Dialog` / `ConfirmationDialog` | Delete account, modals |
| `InfoBanner` / `Toast` / `SuccessBanner` | Feedback |
| `Avatar` / `ProfileMenu` | Nav account |
| `IconTile` | Quick actions, meal cards |
| `ProgressBar` | Shopping / pantry match |
| `QuickActionCard` / `StatCard` | Dashboard |
| `PageContainer` / `PageShell` | Authenticated pages |
| `AuthLayout` / `FormLayout` | Auth screens |
| `ContentSection` / `ResponsiveGrid` | Page composition |
| Typography set | Headings/body without one-off classes |
| Feature: `PantryBrowser`, `MealPlanner`, `ShoppingTrip`, `RecipeCatalog`, `MealCard`, forms | Domain UIs |
| Legacy: `auth-form.tsx`, `logout-button.tsx` | May remain but newer flows use dedicated forms + profile menu |

---

## 10. Server Actions

| Module | Action | Purpose | Auth | DB effect |
|---|---|---|---|---|
| `auth` | `login` | Password sign-in | — | Session |
| | `register` | Sign-up + metadata | — | User + optional email confirm |
| | `forgotPassword` | Reset email | — | Supabase mail |
| | `resetPassword` | Set new password | Session from link | User password |
| | `logout` | Sign out | Session | Clears session |
| `pantry` | `addIngredient` | Manual add | Required | Insert pantry |
| | `updatePantryItem` | Edit | Required | Update |
| | `deleteIngredient` | Remove | Required | Delete (+ shop regen trigger) |
| `receipt` | `saveScannedIngredients` | Commit OCR review | Required | Insert pantry rows |
| `meals` | `suggestMeals` | AI suggestions | Required | Read pantry |
| | `cookMeal` | Consume ingredients | Required | Delete/update pantry |
| | `saveMeal` / `removeSavedMeal` | Favourites | Required | `meals_saved` |
| `planner` | `getCurrentMealPlan` | Load plan | Required | Read |
| | `generateMealPlan` | AI week | Required | Replace plan/items + shop regen |
| | `reorderMealPlanItems` | Drag order | Required | Update `sort_order` |
| | `replaceMealPlanItem` | Swap meal | Required | Update item |
| `shopping` | `regenerateShoppingList` | Recompute | Required | Rewrite list |
| | `getShoppingList` | Fetch | Required | Read |
| | `toggleShoppingItem` | Check | Required | Update `checked` |
| | `clearCheckedItems` | Cleanup | Required | Delete checked |
| | `triggerShoppingListRegeneration` | Hook | Required | Regen |
| `shopping-list` | `addMissingIngredientsToShoppingList` | Merge missing | Required | Upsert-ish insert |
| `dashboard` | `getDashboardStats` / `getDashboardHomeData` | Home aggregates | Required | Read-only |
| `settings` | `updateProfile` | Display name | Required | `user_metadata` |
| | `updateEmail` | Secure email change | Required | Supabase email flow |
| | `changePassword` | Password update | Required | Auth user |
| | `deleteAccount` | Wipe user | Required | RPC → cascade |

Inputs/outputs generally use `FormData` or typed objects and return `{ success }` / `{ error }` / redirect patterns.

---

## 11. API Routes

| Method | Path | Auth | Role |
|---|---|---|---|
| `POST` | `/api/scan-receipt` | App session expected in practice; uses server Gemini key | Accepts image payload, calls Gemini, returns parsed ingredients JSON or mapped error |
| `GET` | `/auth/callback` | OAuth/code exchange | `exchangeCodeForSession`; redirects to `next` or `/dashboard` |

No other custom REST surface; data mutations prefer server actions.

---

## 12. Authentication

### Registration

- Email + password (+ display name)
- Live email validation; password strength (8+, upper, lower, number); confirm match; show/hide
- `signUp` with `emailRedirectTo: ${getSiteUrl()}/auth/callback`
- Metadata: `display_name` / `full_name`

### Login

- Email/password; show/hide; remember-me UI; forgot link; pending spinner
- Friendly validation before submit

### Email verification

- Callback route exchanges code for session
- Production needs `NEXT_PUBLIC_SITE_URL` and Supabase redirect allow-list including `/auth/callback`

### Password reset

- `/forgot-password` → `resetPasswordForEmail`
- Email link → callback with `next=/reset-password`
- `/reset-password` (protected) → `updateUser({ password })` → login success banner

### Profile / security (Settings)

- Display name, email update (Supabase confirm flow), password change
- Security card: email verified, created, last sign-in
- Sign out; delete with confirmation copy listing data wiped

### Middleware protection

Protected prefixes: `dashboard`, `pantry`, `receipt-scanner`, `meals`, `recipes`, `saved-meals`, `planner`, `shopping`, `settings`, `reset-password`. Logged-in users redirected away from `login`/`register`/`forgot-password`.

---

## 13. Shopping Workflow

```
[Receipt photo]
      │  global drop or /receipt-scanner
      ▼
[Gemini extraction] → [User review] → [pantry rows + qty/unit/expiry]
      │
      ▼
[Pantry browser] ←── cookMeal removes used ingredients
      │
      ├──► [Recipes catalogue]  (deterministic match)
      ├──► [AI meal suggestions]
      └──► [Meal planner AI week]
                │
                ▼
      [Deterministic shopping list]
      plan ingredients − pantry coverage
                │
                ▼
      [Supermarket checklist] → check items → print
                │
                ▼
      [Cook from plan/suggestions] → pantry updates → list regenerates
```

> **Design principle:** AI invents meals; maths invents shopping.

---

## 14. Problems Solved Today

| Issue | Symptoms | Root cause | Solution | Lesson |
|---|---|---|---|---|
| Gemini "not configured" | 500 despite `.env.local` | Env not loaded / process assumptions | Systematic env verification; restart Turbopack | Never guess env issues |
| Model 404 | `gemini-2.5-flash` missing | Deprecated/unavailable model id | Configurable current multimodal model | Pin via env, not hardcode forever |
| Gemini 503 | Intermittent failures | Provider load | Retry with exponential backoff | Distinguish retryable vs fatal errors |
| Missing migration file | Claimed 002 absent | File not on disk | Recreate `002_v2_features.sql` | Verify artifacts exist |
| Shopping AI mismatch | Weird lists | AI not grounded in pantry | Pure `shopping-list.ts` regen | Prefer deterministic for inventory math |
| Planner reorder days wrong | Day numbers jump | Wrote list index into `day_index` | Only update `sort_order` | Separate identity vs presentation order |
| Planner first-click error | Wrong error copy / fail | `mapGeminiError` receipt-specific | Context-aware mapper + planner retry | Shared helpers need contexts |
| Email confirm broken in prod | Stuck unverified | Wrong redirect URL | `getSiteUrl` + callback route | Auth redirects are environment-specific |
| UI felt "SaaS dark" | Flat dashboard look | Ad-hoc colours/spacings | Food-app polish + tokens | Tokens prevent regression |

---

## 15. Production Deployment

### Git / GitHub

- Repo: PantryPal git history from Create Next App → V2 → fixes → UI release commits.
- Latest release messages: *Release PantryPal v1.0.0*.

### Typical Vercel setup

1. Connect GitHub repo.
2. Framework: Next.js.
3. Set env vars (see below).
4. Deploy production; note URL.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | RLS-scoped anon key |
| `GEMINI_API_KEY` | Server only | AI |
| `GEMINI_MODEL` | Server | Model override |
| `NEXT_PUBLIC_SITE_URL` | Server/auth | Canonical origin for redirects |

### Supabase configuration

- Apply migrations 002 (and ensure `pantry` table matches app) + 003 for delete.
- Auth → URL configuration:
  - `http://localhost:3000/auth/callback`
  - `https://<production>/auth/callback`
- Enable email confirm / recovery templates as desired.

### Deployment checklist

1. `supabase db push` / run SQL in dashboard
2. Set Vercel env + `SITE_URL`
3. Configure Supabase redirect URLs
4. `npm run build` locally (must be green)
5. Deploy; smoke-test: register → confirm → scan → plan → shop

---

## 16. Architecture Decisions

| Decision | Why | Alternatives | Future |
|---|---|---|---|
| Next.js App Router + Server Actions | Fits forms/mutations; less API boilerplate | tRPC / REST only | Keep; add Route Handlers only for binary/AI |
| Supabase Auth + RLS | Fast multi-tenant security | Custom JWT + Prisma | Stay; consider service role only for admin |
| Gemini for vision + meals | Multimodal + cheap flash models | OpenAI / Claude | Abstract provider interface |
| Deterministic shopping | Correctness > novelty | AI shopping | Keep |
| Seeded recipe catalogue | Offline, free, rankable | Only AI meals | Grow dataset; user recipes |
| CSS variables + Tailwind v4 `@theme` | One place for brand | CSS-in-JS / shadcn full kit | Extend tokens; optional theme switch |
| Middleware session gate | Central auth | Per-page checks only | Add role claims later if needed |
| JSONB for ingredient lists on meals/plans | Flexible nested lists | Normalised junction tables | Normalise if querying ingredients often |

---

## 17. Future Improvements

### Immediate

- Confirm production `pantry` vs `pantry_items` naming everywhere.
- Apply `003_delete_account` and review SECURITY DEFINER privileges.
- Set `NEXT_PUBLIC_SITE_URL` on Vercel; verify email confirm + reset.
- Bump `package.json` version to `1.0.0` to match release commits.
- Smoke E2E checklist documented above.

### Version 1.1

- Appearance theme toggle (token already anticipates).
- Avatar upload (placeholder exists).
- Stronger shopping `needed_for_meals` persistence if not fully stored.
- Offline-friendly PWA shell.
- Unit tests for `shopping-list.ts` and `ingredient-match`.
- Structured logging for Gemini failures in production.

### Long-term roadmap

- Household / shared pantries (multi-user RLS redesign).
- Barcode scanning.
- Nutrition / dietary preferences.
- Import recipes from URL.
- Native mobile wrappers.
- Provider-agnostic AI adapter.

> Do not reintroduce AI-generated shopping lists without keeping pantry as source of truth.

---

## 18. Technical Debt

- Migration 001 table name vs live `pantry` mismatch.
- Some legacy components (`auth-form`, older dashboard cards) may be unused.
- `package.json` version lag vs git release tags.
- Limited automated tests.
- Delete-account RPC is powerful — audit grants regularly.
- Occasional `window.location.reload()` after planner actions (works; could be optimistic RSC refresh).
- Console logging in planner path may still exist for debugging.
- Dark mode polish secondary to light-first food aesthetic.
- HEIC support depends on browser/OS decoding.

---

## 19. Lessons Learned

- Separate generative AI from inventory maths — users forgive creative recipes; they don't forgive wrong shopping lists.
- Auth redirects are a product feature — production email flows fail silently without `SITE_URL` + allow-lists.
- Shared error helpers need contexts — one Gemini mapper for receipts broke the planner.
- Verify migrations on disk — "we wrote it" ≠ "it's in the repo."
- Design tokens early enough — final polish still needed a token pass to stop hex sprawl.
- Order fields carefully — `day_index` vs `sort_order` bugs are classic domain modelling traps.
- Env + model IDs change — make providers configurable; retry only what is retryable.

---

## 20. Statistics

| Metric | Approximate |
|---|---|
| TypeScript/TSX files under `src/` | ~131 |
| Lines of TS/TSX | ~12,400 |
| App routes (pages + API + callback) | ~19 build routes |
| Server action modules | 9 files · ~30 exported actions |
| SQL migrations | 3 |
| Core DB tables (app) | 5 (+ `auth.users`) |
| Major product features | 15+ |
| UI primitive / DS components | 25+ |
| Seeded recipes | 100+ |
| Git commits (feature arc) | ~8 meaningful (scaffold → v1.0.0) |
| Files created this session (cumulative) | Dozens (features + DS + account) |
| Files modified | Majority of `src/` |

---

## 21. Final Assessment

### Strengths

- Clear product loop: receipt → pantry → cook → shop → cook again.
- Sensible AI boundaries.
- Solid Supabase RLS posture for a student/startup MVP.
- Cohesive post-v1.0 UI and tokenised design system.
- Account lifecycle complete enough for a real consumer launch.
- Production build currently clean (TypeScript).

### Weaknesses

- Schema naming debt (`pantry_items` vs `pantry`).
- Thin automated test coverage.
- Some reload-based UI updates.
- Single-user households only.
- AI cost/latency still user-visible without deeper caching.

### Architecture

Well-suited to a Next.js SaaS MVP: server actions for mutations, one AI route for multimodal input, pure libs for matching/shopping. Maintainability improved markedly after the design-system refactor.

### Maintainability

Good for v1.0 after tokens; still watch for duplicate feature markup and legacy components.

### Scalability

Fine for thousands of users on Supabase + Vercel; shopping regen and Gemini calls should be rate-aware before tens of thousands of concurrent AI scans.

### User experience

Now reads as a food & lifestyle app rather than an admin dashboard — especially dashboard, shopping checklist, and auth. Empty/loading states and mobile nav support weekly habitual use.

### Production readiness

Ready for soft launch once env, redirects, and migrations are verified in the target project. Treat delete-account and API keys as operationally sensitive.

### Commercial potential

Strong niche: waste reduction + meal planning with low onboarding friction via receipts. Monetisation paths (premium AI quotas, household plans, retailer integrations) fit without rewriting the core architecture.

### Portfolio verdict

PantryPal v1.0.0 is a credible full-stack portfolio piece: real auth, real AI, real multi-entity data model, deliberate UX craft, and documented engineering judgement (especially deterministic shopping and design tokens). It demonstrates product thinking as much as coding ability.

---

*End of PantryPal Development Log — intended as living technical documentation for v1.0.0. Update this log when shipping v1.1+ rather than rewriting history.*

---

## Appendix: Normalised Tables

### Feature Summary

| Feature | Purpose | Architecture | User Flow | Technical Notes |
|---|---|---|---|---|
| Authentication | Protect user data | Supabase Auth + SSR | Register/Login → Dashboard | Server actions + callback |
| Receipt Scanning | Import groceries | Gemini Vision | Upload → Review → Pantry | Route handler |
| Pantry | Inventory | Supabase + RLS | Browse/Add/Edit/Delete | Qty, units, expiry |
| Meal Planner | Weekly planning | Gemini | Generate/Reorder | Shopping regeneration |
| Shopping List | Buy missing items | Deterministic | Auto-generated | No AI shopping logic |

### Database Tables

| Table | Purpose | Key Columns | Relationships |
|---|---|---|---|
| `pantry` | Ingredients | `ingredient_name`, `quantity`, `expiry_date` | `auth.users` |
| `meals_saved` | Saved meals | `meal_name` | `auth.users` |
| `meal_plans` | Plans | `days_count` | `auth.users` |
| `meal_plan_items` | Plan items | `day_index` | `meal_plans` |
| `shopping_list_items` | Checklist | `ingredient_name`, `checked` | `auth.users` |
