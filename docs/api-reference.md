# ShelfLife v2 API Reference

**Classification:** Internal Engineering Reference  
**Version:** 2.0  
**Status:** Current  
**Audience:** Engineers, AI assistants, technical reviewers  
**Last Updated:** July 2026  
**See Also:** [docs/architecture.md](./architecture.md) — system design, data flow, and component interaction

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication Model](#2-authentication-model)
3. [Server Action Architecture](#3-server-action-architecture)
4. [REST API Routes](#4-rest-api-routes)
5. [Server Actions — Authentication](#5-server-actions--authentication)
6. [Server Actions — Pantry](#6-server-actions--pantry)
7. [Server Actions — Shopping](#7-server-actions--shopping)
8. [Server Actions — Shopping List (Recipe-Level)](#8-server-actions--shopping-list-recipe-level)
9. [Server Actions — Meals](#9-server-actions--meals)
10. [Server Actions — Planner](#10-server-actions--planner)
11. [Server Actions — Receipt](#11-server-actions--receipt)
12. [Server Actions — Dashboard](#12-server-actions--dashboard)
13. [Server Actions — Settings](#13-server-actions--settings)
14. [Server Actions — Community Intelligence](#14-server-actions--community-intelligence)
15. [Shared Libraries](#15-shared-libraries)
16. [Error Handling](#16-error-handling)
17. [Appendix — Server Action Dependency Graph](#17-appendix--server-action-dependency-graph)

---

## 1. Overview

ShelfLife uses Next.js 16 Server Actions as the primary mutation layer. There is one REST API endpoint (`/api/scan-receipt`) and one OAuth callback handler (`/auth/callback`). All other data mutations occur through Server Actions.

**Architecture principles:**
- All Server Actions re-authenticate via `supabase.auth.getUser()` before any operation
- Mutations call `revalidatePath()` to invalidate the Next.js route cache
- Pantry and planner mutations trigger `triggerShoppingListRegeneration()` to keep the shopping list current
- Community learning is non-blocking — failures resolve to an empty cache snapshot, never blocking the primary write
- Shopping list reads (`getShoppingList`) are explicitly non-regenerating; the `/shopping` page never rebuilds the list on page load

**File locations:**
```
src/app/actions/auth.ts
src/app/actions/pantry.ts
src/app/actions/shopping.ts
src/app/actions/shopping-list.ts
src/app/actions/meals.ts
src/app/actions/planner.ts
src/app/actions/receipt.ts
src/app/actions/dashboard.ts
src/app/actions/settings.ts
src/app/actions/community-intelligence.ts
src/app/api/scan-receipt/route.ts
src/app/auth/callback/route.ts
```

---

## 2. Authentication Model

All Server Actions require authentication unless otherwise stated. The common internal helper:

```typescript
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect("/login"); }
  return { supabase, user };
}
```

This pattern appears in every action module. It:
1. Creates a server-side Supabase client with cookie access
2. Calls `supabase.auth.getUser()` (validates the session, refreshes if needed)
3. Redirects to `/login` if not authenticated (Next.js redirect — does not return)
4. Returns `{ supabase, user }` for use in the action body

**SUPER_ADMIN actions** use `requireSuperAdmin()` from `src/lib/platform-auth.ts`:

```typescript
async function requireSuperAdmin(): Promise<AuthenticatedPlatformContext>
```

This calls `getAuthenticatedPlatformContext()` which additionally loads `user_roles` and redirects to `/dashboard` if the user does not have the `SUPER_ADMIN` role.

**Never trust client-provided user IDs.** All mutations scope by `user.id` from the verified session.

---

## 3. Server Action Architecture

### 3.1 Result Types

Server Actions return typed discriminated unions. Common patterns:

```typescript
// Pantry mutations
type PantryActionResult = { success: true } | { success: false; error: string };
type PantryFormState = { error: string } | null;

// Shopping mutations
type ShoppingActionResult = { success: true } | { success: false; error: string };
type ShoppingListResult = { items: ShoppingListItem[]; summary: ShoppingListSummary };

// Meals
type SuggestMealsResult =
  | { status: "empty" }
  | { status: "success"; suggestions: MealSuggestions }
  | { status: "error"; message: string };
type CookMealResult = { success: true } | { success: false; error: string };

// Auth and Settings
type AuthState = { error?: string; success?: string } | null;
type SettingsState = { error?: string; success?: string } | null;
```

### 3.2 Form Actions vs Direct Call Actions

**Form actions** use the signature `(prevState: T, formData: FormData) => Promise<T>` and are used with React's `useActionState`. Examples: `login`, `register`, `addIngredient`.

**Direct call actions** accept typed parameters and return results directly. Examples: `updatePantryItem(id, data)`, `toggleShoppingItem(id, checked)`, `completeCookedMeal(input)`.

### 3.3 Shopping List Cascade

Every pantry or planner mutation ends with:

```typescript
await triggerShoppingListRegeneration();
revalidatePath("/shopping");
revalidatePath("/dashboard");
```

`triggerShoppingListRegeneration()` is defined in `shopping.ts` and internally calls `regenerateShoppingList()`, then revalidates `/shopping` and `/dashboard`. This means all pantry and planner mutating actions revalidate the shopping list as a side effect.

---

## 4. REST API Routes

### 4.1 `POST /api/scan-receipt`

**File:** `src/app/api/scan-receipt/route.ts`  
**Runtime:** `nodejs`  
**Max Duration:** 60 seconds (Vercel)  
**Authentication:** Required (HTTP 401 if not authenticated)

#### Request

```
Content-Type: multipart/form-data

Fields:
  image   File   Required. Receipt image (JPEG, PNG, WebP, HEIC). Max size: ~3.5 MB (validated by validateReceiptUpload).
```

#### Response — Success (200)

```json
{
  "ingredients": [
    { "ingredient_name": "Whole Milk", "quantity": 2, "unit": "l" },
    { "ingredient_name": "Cheddar Cheese", "quantity": 250, "unit": "g" }
  ],
  "requestId": "scan_1720825200000_abc123"
}
```

Headers: `X-Scan-Request-Id: <requestId>`

#### Response — Error

```json
{
  "error": "Human-readable message",
  "code": "FILE_TOO_LARGE",
  "retryable": false,
  "requestId": "scan_1720825200000_abc123",
  "details": "Optional technical detail"
}
```

#### Error Codes

| Code | HTTP | Retryable | Cause |
|---|---|---|---|
| `UNAUTHORIZED` | 401 | false | No authenticated session |
| `NOT_CONFIGURED` | 500 | false | `GEMINI_API_KEY` not set |
| `FILE_TOO_LARGE` | 413 | false | Upload exceeds size limit |
| `VALIDATION` | 400 | false | Missing or invalid `image` field |
| `UPLOAD_FAILED` | 400 | false | FormData parse failed |
| `EMPTY_RESULT` | 502 | true | Gemini returned no text |
| `PARSE_FAILED` | 502 | true | Gemini response was not valid JSON |
| `AI_BUSY` | 429/503 | true | Gemini rate limit or overload |
| `AI_UNAVAILABLE` | 502 | true | Gemini upstream failure |
| `INTERNAL` | 500 | false | Unexpected server error |

#### Processing Pipeline

```
1. Resolve/create requestId (from X-Scan-Request-Id header or generate new)
2. Authenticate (getUser)
3. Check GEMINI_API_KEY
4. Parse FormData
5. Validate image (type + size via validateReceiptUpload)
6. Convert to base64 (fileToBase64)
7. Determine MIME type (getReceiptMimeType)
8. Call Gemini Vision with RECEIPT_EXTRACTION_PROMPT + image + instruction
9. Parse JSON response (parseIngredientsResponse)
10. Return { ingredients, requestId }
```

#### Retry Logic

The Gemini call is wrapped in `withGeminiRetry()` (up to 3 attempts, exponential backoff: 1s, 2s, 4s) for transient failures (502, 503, 429).

#### Logging

Structured events are emitted via `scan-receipt-logger.ts` at key stages: `request_received`, `auth_ok`/`auth_missing`, `file_received`, `validation_result`, `gemini_request_start`, `gemini_response_received`, `parse_success`, `request_complete`.

---

### 4.2 `GET /api/scan-receipt`

Returns HTTP 405 with structured error (`{ error: "Method not allowed.", code: "VALIDATION", retryable: false }`). Ensures unexpected method hits return JSON rather than an HTML Next.js error page.

---

### 4.3 `GET /auth/callback`

**File:** `src/app/auth/callback/route.ts`  
**Authentication:** None required (this is the authentication completion route)

#### Query Parameters

| Parameter | Required | Purpose |
|---|---|---|
| `code` | Yes | Supabase Auth code to exchange for session |
| `next` | No | Redirect path after successful auth. Must start with `/`. Defaults to `/dashboard`. |

#### Behavior

1. Extracts `code` from query string
2. Calls `supabase.auth.exchangeCodeForSession(code)`
3. On success: redirects to `${origin}${next}` or `${origin}/dashboard`
4. On failure or missing code: redirects to `${origin}/login`

**Used by:**
- Email confirmation links (registration)
- Password reset email links (`?next=/reset-password`)
- Any future OAuth provider flows

---

## 5. Server Actions — Authentication

**File:** `src/app/actions/auth.ts`

All auth actions use `createClient()` (server Supabase client) without requiring an existing session.

---

### `login`

```typescript
async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState>
```

**Type:** Form Action (for `useActionState`)  
**Authentication:** Not required (establishes session)

| FormData Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | `isValidEmail()` |
| `password` | string | Yes | Non-empty |

**Success:** `revalidatePath("/", "layout")` → `redirect("/dashboard")`  
**Failure:** Returns `{ error: message }` — surfaces Supabase auth error messages directly  
**DB Operations:** None (Supabase Auth only via `signInWithPassword`)  
**Side Effects:** Sets session cookie

---

### `register`

```typescript
async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState>
```

**Type:** Form Action  
**Authentication:** Not required

| FormData Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | `isValidEmail()` |
| `password` | string | Yes | `isPasswordStrong()` |
| `confirmPassword` | string | Yes | Must equal `password` |
| `displayName` | string | No | Stored in auth user metadata |

**Success:** `revalidatePath("/", "layout")` → `redirect("/dashboard")`  
**Failure:** Returns `{ error: message }`  
**DB Operations:** None (Supabase Auth only via `signUp`)  
**Side Effects:** Creates auth user; sends confirmation email if enabled in Supabase project; stores `display_name`/`full_name` in user metadata; `emailRedirectTo` set to `${getSiteUrl()}/auth/callback`

---

### `forgotPassword`

```typescript
async function forgotPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState>
```

**Type:** Form Action  
**Authentication:** Not required

| FormData Field | Type | Required |
|---|---|---|
| `email` | string | Yes |

**Success:** Returns `{ success: "If an account exists..." }` (intentionally vague to prevent user enumeration)  
**DB Operations:** None (Supabase Auth `resetPasswordForEmail`)  
**Side Effects:** Sends password reset email; `redirectTo` set to `${getSiteUrl()}/auth/callback?next=/reset-password`

---

### `resetPassword`

```typescript
async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState>
```

**Type:** Form Action  
**Authentication:** Required (session from reset email link)

| FormData Field | Type | Required | Validation |
|---|---|---|---|
| `password` | string | Yes | `isPasswordStrong()` |
| `confirmPassword` | string | Yes | Must equal `password` |

**Success:** `revalidatePath("/", "layout")` → `redirect("/login?reset=success")`  
**DB Operations:** None (Supabase Auth `updateUser({ password })`)

---

### `logout`

```typescript
async function logout(): Promise<void>
```

**Authentication:** Not strictly required (signOut is safe even without session)  
**Side Effects:** `supabase.auth.signOut()`, `revalidatePath("/", "layout")`, `redirect("/login")`

---

## 6. Server Actions — Pantry

**File:** `src/app/actions/pantry.ts`

### Internal Helper: `learnAndSnapshot`

```typescript
async function learnAndSnapshot(
  supabase,
  { ingredientName, unit, expiryDate, storageLocationId }
): Promise<PantryCacheSnapshot>
```

Not exported. Called before every pantry write. Responsibilities:

1. Calls `recordCommunityFoodObservation()` — contributes anonymous vote
2. Calls `resolveCommunityFood()` — gets canonical food ID and classification
3. Returns `{ canonical_food_id, cached_category_id, cached_subcategory_id, classification_version, classification_updated_at }`
4. **Any failure returns `EMPTY_CACHE` (all nulls) — never throws**

Community learning is always non-blocking.

---

### `getCommunityFoodDefaults`

```typescript
async function getCommunityFoodDefaults(
  ingredientName: string
): Promise<(ResolvedCommunityFood & { default_expiry_date: string | null }) | null>
```

**Authentication:** Required  
**Side Effects:** None (read-only)  
**DB Operations (read):** RPC `resolve_community_food`  
**Used By:** `IngredientFields` component (on ingredient name `onBlur`)

Returns community-learned defaults for the ingredient: suggested `unit`, `default_shelf_life_days`, `suggested_storage_location_id`, classification tier. Also computes `default_expiry_date` from `default_shelf_life_days` via `getExpiryDateFromDefault()`.

Returns `null` if the ingredient has no community record or on error.

---

### `addIngredient`

```typescript
async function addIngredient(
  _prevState: PantryFormState,
  formData: FormData
): Promise<PantryFormState>
```

**Type:** Form Action  
**Authentication:** Required

| FormData Field | Type | Required | Notes |
|---|---|---|---|
| `ingredient_name` | string | Yes | Trimmed; error if empty |
| `quantity` | numeric string | No | Defaults to 1; must be > 0 |
| `unit` | string | No | Trimmed or null |
| `storage_location_id` | UUID string | No | FK → storage_locations |
| `expiry_date` | date string (YYYY-MM-DD) | No | |

**Processing:**
1. Validates `ingredient_name`
2. Calls `learnAndSnapshot()` — community observation + cache snapshot
3. Calls `insertOrStackPantryItem()` — stack or insert
4. Calls `triggerShoppingListRegeneration()`
5. `revalidatePath("/pantry")`, `revalidatePath("/dashboard")`
6. Returns `null` on success, `{ error }` on failure

**Tables Written:** `pantry`, `community_foods`, `community_food_aliases`, `community_food_votes` (via RPC)  
**Tables Read:** None directly  
**Revalidation:** `/pantry`, `/dashboard`  
**Shared Components Using It:** `AddIngredientForm`

---

### `updatePantryItem`

```typescript
async function updatePantryItem(
  id: string,
  data: {
    ingredient_name: string;
    quantity: number;
    unit: string | null;
    expiry_date: string | null;
    storage_location_id: string | null;
  }
): Promise<PantryActionResult>
```

**Authentication:** Required  
**Validation:** `ingredient_name` non-empty; `quantity` > 0 and finite  
**Processing:**
1. Validates inputs
2. Calls `learnAndSnapshot()` — re-learns if ingredient name changed
3. Updates the row (scoped by `id` AND `user_id`)
4. Calls `triggerShoppingListRegeneration()`
5. Revalidates `/pantry`, `/dashboard`, `/meals`

**Tables Written:** `pantry`, community tables (via RPC)  
**Revalidation:** `/pantry`, `/dashboard`, `/meals`  
**Shared Components Using It:** `PantryEditModal`

---

### `classifyPantryFood`

```typescript
async function classifyPantryFood(
  id: string,
  foodCategoryId: string,
  foodSubcategoryId: string | null
): Promise<PantryActionResult>
```

**Authentication:** Required  
**Purpose:** User-initiated food classification. Records a community category vote and refreshes the pantry's cached classification.

**Processing:**
1. Validates `foodCategoryId`
2. Fetches the pantry item's `ingredient_name` (verifying user ownership)
3. Calls `classifyCommunityFood()` — records an observation with the explicit category IDs
4. Clears `classification_version` on the pantry row (forces a stale cache refresh)
5. Calls `refreshStalePantryClassifications()` — heals the cache immediately
6. Revalidates `/pantry`, `/dashboard`

**Tables Written:** `pantry`, `community_food_votes`, `community_foods` (via RPC)  
**Revalidation:** `/pantry`, `/dashboard`  
**Shared Components Using It:** `PantryBrowser` (classification badge prompt)

---

### `deleteIngredient`

```typescript
async function deleteIngredient(formData: FormData): Promise<void>
```

**Type:** Form Action  
**Authentication:** Required  
**FormData:** `id` (UUID)

Deletes the pantry row scoped to `user_id`. Triggers shopping list regeneration. Revalidates `/pantry`, `/dashboard`, `/meals`.

**Tables Written:** `pantry` (DELETE)  
**Revalidation:** `/pantry`, `/dashboard`, `/meals`  
**Shared Components Using It:** `PantryBrowser`, `PantryEditModal`

---

## 7. Server Actions — Shopping

**File:** `src/app/actions/shopping.ts`

### `regenerateShoppingList`

```typescript
async function regenerateShoppingList(): Promise<ShoppingListResult>
```

**Authentication:** Required  
**Not called directly by UI.** Called by `triggerShoppingListRegeneration()` which is called by pantry and planner mutations.

**Processing:**
1. Parallel fetch: active meal plan items, pantry stock, existing shopping rows
2. Build `FoodResolver` from all ingredient names in play
3. `computeShoppingList()` — semantic demand aggregation minus pantry supply
4. `collectManualItemsToPreserve()` — keep manual items not in pantry and not in computed set
5. Preserve `checked` state from existing rows
6. **DELETE all user shopping rows**
7. `insertShoppingListRows()` — reinsert computed (source: `meal_plan`) + preserved manual (source: `manual`)
8. Return `{ items, summary }`

**Tables Written:** `shopping_list_items` (DELETE then INSERT)  
**Tables Read:** `meal_plans`, `meal_plan_items`, `pantry`, `shopping_list_items`, `food_subcategories`, RPC `resolve_community_foods`  
**Note:** Delete-and-reinsert is not atomic. A concurrent Add Missing action during regeneration could lose its rows. Accepted at current scale.

---

### `getShoppingList`

```typescript
async function getShoppingList(): Promise<ShoppingListResult>
```

**Authentication:** Required  
**Side Effects:** None  
**Tables Read:** `shopping_list_items`

**Read-only.** Does not compute or regenerate. Selects persisted rows ordered by `created_at`. Used by `/shopping` page on load.

**Important:** This function intentionally does NOT call `regenerateShoppingList`, `computeShoppingList`, `fetchActivePlanItems`, or any planner data. Its only operation is a SELECT on `shopping_list_items`. Verified by regression test.

---

### `toggleShoppingItem`

```typescript
async function toggleShoppingItem(
  id: string,
  checked: boolean
): Promise<ShoppingActionResult>
```

**Authentication:** Required  
**Tables Written:** `shopping_list_items` (UPDATE `checked`)  
**Revalidation:** `/shopping`, `/dashboard`

---

### `clearCheckedItems`

```typescript
async function clearCheckedItems(): Promise<ShoppingActionResult>
```

**Authentication:** Required  
**Tables Written:** `shopping_list_items` (DELETE WHERE `checked = true`)  
**Revalidation:** `/shopping`, `/dashboard`

---

### `clearShoppingList`

```typescript
async function clearShoppingList(): Promise<ShoppingActionResult>
```

**Authentication:** Required  
**Tables Written:** `shopping_list_items` (DELETE all user rows)  
**Revalidation:** `/shopping`, `/dashboard`  
**Does NOT touch:** `pantry`, `meal_plans`, `meal_plan_items`  
**Shared Components Using It:** `ShoppingTrip` (Clear list button with `window.confirm` dialog)

---

### `triggerShoppingListRegeneration`

```typescript
async function triggerShoppingListRegeneration(): Promise<void>
```

**Authentication:** Inherits from `regenerateShoppingList()`  
**Calls:** `regenerateShoppingList()`, `revalidatePath("/shopping")`, `revalidatePath("/dashboard")`

Internal orchestration function. Called at the end of: `addIngredient`, `updatePantryItem`, `deleteIngredient`, `saveScannedIngredients`, `generateMealPlan`, `reorderMealPlanItems`, `replaceMealPlanItem`, `completeCookedMeal`.

---

## 8. Server Actions — Shopping List (Recipe-Level)

**File:** `src/app/actions/shopping-list.ts`

### `addMissingIngredientsToShoppingList`

```typescript
async function addMissingIngredientsToShoppingList(
  ingredients: string[]
): Promise<AddMissingIngredientsResult>

type AddMissingIngredientsResult = {
  added: number;
  skippedExisting: number;
  skippedPantry: number;
};
```

**Authentication:** Required  
**Key Distinction:** Does NOT call `regenerateShoppingList()`. Appends rows only.

**Parameters:**  
`ingredients`: array of raw ingredient strings (may include quantities: `"400g Spaghetti"`, `"2 cloves Garlic"`, `"Milk"`)

**Processing:**
1. Deduplicate by normalized name
2. Parse each via `parseIngredientRequirement()` — extracts name, quantity, unit
3. Validate ingredient names via `isValidIngredientName()`
4. Parallel fetch: pantry names, existing shopping item names
5. `buildFoodResolver()` — single batch RPC for semantic matching
6. `planMissingIngredientsForShoppingList()` — pure planning function determines which to insert
7. `insertShoppingListRows()` — inserts with `source: "manual"`
8. Revalidates `/shopping`, `/dashboard`, `/planner`, `/meals`, `/saved-meals`, `/recipes`

**Tables Written:** `shopping_list_items` (INSERT only, never DELETE)  
**Tables Read:** `pantry`, `shopping_list_items`, `food_subcategories`, RPC `resolve_community_foods`  
**Shared Components Using It:** `AddMissingToShoppingButton` (only — all UI goes through `MissingIngredientsSection` → `AddMissingToShoppingButton` → this action)

**Verified Callers (regression test confirms):**
- `MealPlanner` → `MissingIngredientsSection` → `AddMissingToShoppingButton`
- `RecipeCatalog` → `MissingIngredientsSection` → `AddMissingToShoppingButton`
- `RecipeDetailModal` → `MissingIngredientsSection` → `AddMissingToShoppingButton`
- `MealCard` → `MissingIngredientsSection` → `AddMissingToShoppingButton`
- `SavedMealsList` → `MissingIngredientsSection` → `AddMissingToShoppingButton`

**Isolation guarantee:** This module does not import from `@/app/actions/shopping`. Regression test verifies this.

---

## 9. Server Actions — Meals

**File:** `src/app/actions/meals.ts`

### `getCatalogueMealSuggestions`

```typescript
async function getCatalogueMealSuggestions(): Promise<SuggestMealsResult>
```

**Authentication:** Required  
**AI:** None — deterministic catalogue ranking only  
**Side Effects:** None

**Processing:**
1. Fetches pantry (`ingredient_name`, `expiry_date`) ordered by expiry ascending
2. Builds `FoodResolver` from all catalogue ingredient names + pantry names
3. `rankRecipes()` against all 100 built-in recipes with semantic matching
4. `groupRankedRecipes()` → `canCookNow`, `nearlyThere`, `shoppingTrip`
5. Limits each group to 8 results

**Returns:** `{ status: "empty" }` if pantry is empty; `{ status: "success", suggestions }` otherwise; `{ status: "error", message }` on exception  
**Tables Read:** `pantry`  
**Shared Components Using It:** `MealsSuggestions`, `DashboardHome` (indirectly via `getDashboardHomeData`)

---

### `suggestMeals`

```typescript
async function suggestMeals(): Promise<SuggestMealsResult>
```

**Authentication:** Required  
**AI:** Gemini generative (model from `getGeminiModelName()`)  
**Requires:** `GEMINI_API_KEY` environment variable

**Processing:**
1. Fetches pantry
2. Builds `FoodResolver` and ranks catalogue recipes
3. Builds expiry summary string for Gemini context
4. Calls Gemini with `MEAL_SUGGESTION_PROMPT` + pantry + top 30 catalogue matches + expiry info
5. Parses response via `parseMealSuggestionsResponse()`
6. Filters out any AI suggestions whose names match built-in catalogue recipe names
7. Returns combined suggestions

**Retry:** `withGeminiRetry()` — 3 attempts, 1s/2s/4s backoff  
**Error handling:** `mapGeminiError(error, "meals")` for provider errors  
**Tables Read:** `pantry`

---

### `completeCookedMeal`

```typescript
async function completeCookedMeal(
  input: CompleteCookedMealInput
): Promise<CookMealResult>

type CompleteCookedMealInput = {
  recipeId?: string | null;
  recipeName: string;
  ingredients: CookingUsageInput[];
};

type CookingUsageInput = {
  expectedIngredient: string | null;
  actualIngredient: string;
  expectedQuantity: number | null;
  expectedUnit: string | null;
  actualQuantity: number;
  actualUnit: string | null;
};
```

**Authentication:** Required  
**Side Effects:** Deducts from pantry; records anonymous observations; regenerates shopping list

**Processing:**
1. Normalises and filters ingredient inputs
2. Calls `consumePantryForCookedMeal()` — FIFO quantity deduction + observation recording
3. Calls `triggerShoppingListRegeneration()`
4. Revalidates: `/pantry`, `/dashboard`, `/meals`, `/planner`, `/shopping`, `/recipes`, `/saved-meals`

**Tables Written:** `pantry` (UPDATE quantity or DELETE rows), `cooking_behavior_observations` (INSERT)  
**Shared Components Using It:** `CookingConfirmationModal`

---

### `cookMeal`

```typescript
async function cookMeal(ingredientsUsed: string[]): Promise<CookMealResult>
```

**Backward-compatibility wrapper.** Delegates to `completeCookedMeal()` with each ingredient mapped to `{ expectedIngredient: name, actualIngredient: name, expectedQuantity: 1, expectedUnit: null, actualQuantity: 1, actualUnit: null }`.

Use `completeCookedMeal()` for new callers. `cookMeal` exists to avoid breaking any existing callers that have not yet been updated to the confirmation workflow.

---

### `saveMeal`

```typescript
async function saveMeal(meal: {
  name: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  recipeId?: string;
}): Promise<SaveMealResult>
```

**Authentication:** Required  
**Tables Written:** `meals_saved` (INSERT)  
**Revalidation:** `/saved-meals`  
**Note:** Stores a point-in-time snapshot. Does not re-evaluate against pantry.

---

### `removeSavedMeal`

```typescript
async function removeSavedMeal(id: string): Promise<SaveMealResult>
```

**Authentication:** Required  
**Tables Written:** `meals_saved` (DELETE scoped to `user_id`)  
**Revalidation:** `/saved-meals`

---

## 10. Server Actions — Planner

**File:** `src/app/actions/planner.ts`

### `getCurrentMealPlan`

```typescript
async function getCurrentMealPlan(): Promise<{
  planId: string | null;
  daysCount: number | null;
  items: MealPlanItem[];
}>
```

**Authentication:** Required  
**Side Effects:** None (read-only)  
**Tables Read:** `meal_plans` (most recent, limit 1), `meal_plan_items`

---

### `generateMealPlan`

```typescript
async function generateMealPlan(daysCount: 3 | 5 | 7): Promise<GeneratePlanResult>
```

**Authentication:** Required  
**AI:** Gemini generative  
**Requires:** `GEMINI_API_KEY`

**Processing:**
1. Fetches pantry (`ingredient_name`, `expiry_date`)
2. Calls Gemini with `MEAL_PLAN_PROMPT` + pantry list + `daysCount`
3. Parses via `parseMealPlanResponse(responseText, daysCount)`
4. Deletes all existing meal plans for the user
5. Inserts new `meal_plans` row + `meal_plan_items` rows
6. Calls `triggerShoppingListRegeneration()` (non-fatal if fails)
7. Revalidates `/planner`, `/dashboard`, `/shopping`

**Tables Written:** `meal_plans` (DELETE + INSERT), `meal_plan_items` (INSERT)  
**Retry:** `withPlannerGeminiRetry()` — retry logic specific to planner  
**Error handling:** `mapGeminiError(error, "planner")`  
**Note:** Contains `console.log` debug statements throughout (known technical debt)

---

### `reorderMealPlanItems`

```typescript
async function reorderMealPlanItems(orderedIds: string[]): Promise<PlannerActionResult>
```

**Authentication:** Required  
Updates `sort_order` (not `day_index`) for each item to reflect the user's drag-and-drop order. Calls `triggerShoppingListRegeneration()` (non-fatal if fails). Revalidates `/planner`, `/dashboard`.

**Tables Written:** `meal_plan_items` (UPDATE `sort_order` only)

---

### `replaceMealPlanItem`

```typescript
async function replaceMealPlanItem(itemId: string): Promise<PlannerActionResult>
```

**Authentication:** Required  
**AI:** Gemini generative  
**Requires:** `GEMINI_API_KEY`

Generates a single replacement meal for one day slot. Excludes existing meal names from the prompt to avoid duplicates. Updates only the specified `meal_plan_items` row. Calls `triggerShoppingListRegeneration()` (non-fatal). Revalidates `/planner`, `/shopping`, `/dashboard`.

**Tables Written:** `meal_plan_items` (UPDATE one row)

---

## 11. Server Actions — Receipt

**File:** `src/app/actions/receipt.ts`

### `saveScannedIngredients`

```typescript
async function saveScannedIngredients(
  ingredients: PantryIngredientInput[]
): Promise<SaveScannedIngredientsResult>

type PantryIngredientInput = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  storage_location_id: string | null;
};

type SaveScannedIngredientsResult =
  | { success: true; added: number; duplicates: number; scanned: number }
  | { success: false; error: string };
```

**Authentication:** Required

**Processing (sequential — not parallel):**

Sequential processing is intentional: if the same item appears twice in the batch (e.g. two Milk entries from one receipt), they must stack onto each other rather than race to insert separate rows.

For each ingredient:
1. `enrichScannedItem()` — records community observation, resolves classification, returns `PantryUpsertRow`
2. `insertOrStackPantryItem()` — stacks or inserts

After all ingredients:
3. `triggerShoppingListRegeneration()`
4. Revalidates: `/pantry`, `/dashboard`, `/meals`, `/planner`, `/shopping`

**Returns:** count of `added` (new rows), `duplicates` (stacked), `scanned` (total attempted)  
**Tables Written:** `pantry`, community tables (via RPC)  
**Shared Components Using It:** `ReceiptIngredientReview` (via `ReceiptScanner`)

---

## 12. Server Actions — Dashboard

**File:** `src/app/actions/dashboard.ts`

### `getDashboardHomeData`

```typescript
async function getDashboardHomeData(userId: string): Promise<DashboardHomeData>

type DashboardHomeData = {
  stats: DashboardStats;
  recommendation: { id, name, description, href, matchScore } | null;
  expiringItems: Array<{ id, name, expiryLabel, status }>;
  weekPlan: Array<{ id, dayLabel, mealName }>;
  shoppingSummary: { total, checked, unchecked };
};
```

**Authentication:** Assumed (called from authenticated page with `userId`)  
**Side Effects:** None (read-only)

**Processing (5 parallel queries):**
1. `pantry` COUNT
2. `pantry` SELECT (id, ingredient_name, expiry_date) — for expiry and recipe matching
3. `meals_saved` COUNT
4. `meal_plan_items` SELECT ordered by day/sort
5. `shopping_list_items` SELECT (id, checked)

Then:
- Builds `FoodResolver` from all catalogue recipe ingredients + pantry names
- `countCookableRecipes()` — how many recipes can be made right now
- `rankRecipes()` — top recommendation
- Calculates expiring items (expired/today/tomorrow/soon), limited to 5
- Calculates shopping summary

**Tables Read:** `pantry`, `meals_saved`, `meal_plan_items`, `shopping_list_items`  
**Shared Components Using It:** `DashboardHome` (via `dashboard/page.tsx`)

---

### `getDashboardStats`

```typescript
async function getDashboardStats(userId: string): Promise<DashboardStats>
```

Thin wrapper that calls `getDashboardHomeData(userId)` and returns only `.stats`. Exists for cases where only the stat counts are needed.

---

## 13. Server Actions — Settings

**File:** `src/app/actions/settings.ts`

All settings actions use `createClient()` and operate on the authenticated user's auth record.

### `updateProfile`

```typescript
async function updateProfile(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState>
```

| FormData Field | Required |
|---|---|
| `displayName` | Yes |

Calls `supabase.auth.updateUser({ data: { display_name, full_name } })`.  
Revalidates `/settings`, `/dashboard`.

---

### `updateEmail`

```typescript
async function updateEmail(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState>
```

| FormData Field | Required | Validation |
|---|---|---|
| `email` | Yes | `isValidEmail()` |

Calls `supabase.auth.updateUser({ email }, { emailRedirectTo })`. Email is NOT changed until the user verifies the new address. Returns a success message explaining this.

---

### `changePassword`

```typescript
async function changePassword(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState>
```

| FormData Field | Required | Validation |
|---|---|---|
| `newPassword` | Yes | `isPasswordStrong()` |
| `confirmPassword` | Yes | Must equal `newPassword` |

---

### `deleteAccount`

```typescript
async function deleteAccount(): Promise<SettingsState>
```

Calls `supabase.rpc("delete_user_account")` — a SECURITY DEFINER function that deletes the authenticated user from `auth.users`. All user data cascades. Then calls `supabase.auth.signOut()`, `revalidatePath("/", "layout")`, `redirect("/login?deleted=1")`.

---

## 14. Server Actions — Community Intelligence

**File:** `src/app/actions/community-intelligence.ts`  
**Authentication:** All functions require `SUPER_ADMIN` role via `requireSuperAdmin()`

### `getCommunityIntelligenceDashboardData`

```typescript
async function getCommunityIntelligenceDashboardData(): Promise<CommunityIntelligenceDashboardData>
```

Loads all data needed for the platform moderation dashboard. Runs multiple parallel queries:
- `community_foods` (up to 100, ordered by review_required DESC, usage_count DESC)
- `community_food_aliases` (top aliases)
- `community_food_moderation_history` (last 25)
- `food_categories`, `food_subcategories`, `storage_locations`
- Confidence tier breakdowns

**Tables Read:** `community_foods`, `community_food_aliases`, `community_food_moderation_history`, `food_categories`, `food_subcategories`, `storage_locations`, `user_roles`

---

### `approveCommunityFood`

```typescript
async function approveCommunityFood(foodId: string): Promise<CommunityActionResult>
```

Sets `status = 'verified'`, `review_required = false`. Records `action: 'approved'` in `community_food_moderation_history` with before/after state.  
Revalidates `/platform`.

---

### `rejectCommunityFood`

```typescript
async function rejectCommunityFood(foodId: string): Promise<CommunityActionResult>
```

Sets `status = 'locked'`. Records `action: 'rejected'` in history.

---

### `lockCommunityFoodEntry`

```typescript
async function lockCommunityFoodEntry(foodId: string): Promise<CommunityActionResult>
```

Sets `status = 'locked'`. Records `action: 'locked'` in history.

---

### `editCommunityFood`

```typescript
async function editCommunityFood(
  foodId: string,
  values: EditableCommunityFood
): Promise<CommunityActionResult>
```

Updates `canonical_name`, `food_category_id`, `food_subcategory_id`, `default_unit`, shelf life fields. Records before/after in history with `action: 'edited'`.

---

### `mergeCommunityFoods`

```typescript
async function mergeCommunityFoods(
  sourceFoodId: string,
  targetFoodId: string
): Promise<CommunityActionResult>
```

Migrates all `community_food_aliases` and `community_food_votes` from source to target. Calls `refresh_community_food_aggregate(targetFoodId)`. Sets source `status = 'locked'`. Records `action: 'merged'` in history.

---

### `createFoodCategory`

```typescript
async function createFoodCategory(name: string, icon?: string): Promise<CommunityActionResult>
```

Inserts into `food_categories`. Revalidates `/platform`.

---

### `createFoodSubcategory`

```typescript
async function createFoodSubcategory(
  foodCategoryId: string,
  name: string
): Promise<CommunityActionResult>
```

Inserts into `food_subcategories`.

---

### `createStorageLocation`

```typescript
async function createStorageLocation(name: string, icon?: string): Promise<CommunityActionResult>
```

Inserts into `storage_locations`.

---

### `setTaxonomyItemActive`

```typescript
async function setTaxonomyItemActive(
  table: "food_categories" | "food_subcategories" | "storage_locations",
  id: string,
  active: boolean
): Promise<CommunityActionResult>
```

Updates `active` on the specified taxonomy table.

---

### `setSubcategorySubstitutable`

```typescript
async function setSubcategorySubstitutable(
  id: string,
  substitutable: boolean
): Promise<CommunityActionResult>
```

Updates `food_subcategories.substitutable`. **Direct impact on semantic matching behaviour.** Enabling/disabling a subcategory here immediately changes whether foods in that subcategory satisfy each other in recipe matching and shopping demand.

---

## 15. Shared Libraries

### 15.1 `planMissingIngredientsForShoppingList` (Pure)

**File:** `src/lib/add-missing-ingredients-core.mjs`  
**Type:** Pure JavaScript function (no side effects, no DB, no imports)

```javascript
planMissingIngredientsForShoppingList({
  ingredients,       // string[] — raw ingredient strings (may contain quantities)
  pantryNames,       // string[] — pantry ingredient names
  existingShoppingNames, // string[] — existing shopping list item names
  userId,            // string
  normalizeKey,      // (name: string) => string
  parseIngredient,   // (raw: string) => { name, quantity, unit }
  isInPantry,        // (ingredient: string, pantryNames: string[]) => boolean
  categorizeIngredient, // (name: string) => string
})
// Returns: { toInsert: ShoppingRow[], added: number, skippedExisting: number, skippedPantry: number }
```

Called by: `addMissingIngredientsToShoppingList` (the only caller). The injected `isInPantry` callback carries the semantic resolver so the pure function benefits from Knowledge Graph matching without a direct DB dependency.

---

### 15.2 `insertShoppingListRows` (Shared Insertion)

**File:** `src/lib/shopping-list-persistence.ts`

```typescript
async function insertShoppingListRows(
  supabase: ShoppingPersistenceClient,
  rows: ShoppingListInsertRow[]
): Promise<ShoppingListItem[]>
```

The single point of INSERT for `shopping_list_items`. Used by both `regenerateShoppingList` and `addMissingIngredientsToShoppingList`. Regression test verifies neither action bypasses this helper.

---

### 15.3 `insertOrStackPantryItem` (Shared Pantry Write)

**File:** `src/lib/pantry-stacking.ts`

```typescript
async function insertOrStackPantryItem(
  supabase: StackingClient,
  row: PantryUpsertRow
): Promise<StackResult>
// StackResult: { status: "stacked" } | { status: "inserted" } | { status: "error"; error: string }
```

The single point of INSERT for `pantry`. Used by `addIngredient` (pantry.ts) and `saveScannedIngredients` (receipt.ts). Ensures stacking logic applies consistently regardless of how food enters the pantry.

---

### 15.4 `consumePantryForCookedMeal` (Pantry Consumption)

**File:** `src/lib/pantry-consumption.ts`  
**Type:** Server-only (`import "server-only"`)

```typescript
async function consumePantryForCookedMeal(
  supabase: ConsumptionClient,
  input: CompleteCookingInput
): Promise<void>
```

The single canonical pantry consumption implementation. FIFO deduction by `expiry_date`, semantic food matching via `foodsMatch()`, unit compatibility via `unitsAreCompatible()`, anonymous observation recording. Called only by `completeCookedMeal()`.

---

### 15.5 `buildFoodResolver` (Batch Resolver)

**File:** `src/lib/food-resolver.ts`  
**Type:** Server-only

```typescript
async function buildFoodResolver(
  supabase: ResolverRpcClient,
  names: Array<string | null | undefined>
): Promise<FoodResolver>
```

Makes one RPC call (`resolve_community_foods`) + one query (`food_subcategories WHERE substitutable = true`) to build a complete `FoodResolver`. Used wherever semantic matching is needed: `regenerateShoppingList`, `addMissingIngredientsToShoppingList`, `getCatalogueMealSuggestions`, `suggestMeals`, `completeCookedMeal`, `getDashboardHomeData`, `/recipes` page.

Returns `EMPTY_FOOD_RESOLVER` on error — matching degrades to string comparison, never throws.

---

### 15.6 `foodsMatch` / `matchesAnyPantry` (Semantic Matching)

**File:** `src/lib/semantic-match.ts`

```typescript
function foodsMatch(
  requiredName: string,
  pantryName: string,
  resolver?: FoodResolver | null
): boolean

function matchesAnyPantry(
  name: string,
  pantryNames: string[],
  resolver?: FoodResolver | null
): boolean
```

The semantic matching primitive. Three-tier resolution (canonical ID → substitutable family → string fallback). Used in: `computeShoppingList`, `pantrySupplyForRequirement`, `collectManualItemsToPreserve`, `matchRecipeToPantry`, `rankRecipes`, `expiryBonus`, `consumePantryForCookedMeal`, `addMissingIngredientsToShoppingList`.

---

### 15.7 `parseIngredientRequirement`

**File:** `src/lib/ingredient-match.ts`

```typescript
function parseIngredientRequirement(raw: string): ParsedIngredient
// ParsedIngredient: { name: string; quantity: number | null; unit: string | null }
```

Handles: leading quantity (`"400g Spaghetti"`), trailing quantity, leading multiplier (`"x3 Egg"`, `"3x Egg"`), trailing multiplier (`"Egg x2"`), bare name (`"Garlic"`). Known units include: `g`, `kg`, `ml`, `l`, `litre/liters`, `clove/cloves`, `tbsp`, `tablespoon`, `tsp`, `teaspoon`, `pcs`, `piece`, `pack`, `count`.

Used in: `addMissingIngredientsToShoppingList`, `computeShoppingList` (via `planMissingIngredientsForShoppingList`), `CookingConfirmationModal`.

---

### 15.8 `categorizeIngredient`

**File:** `src/lib/pantry-categories.ts`

```typescript
function categorizeIngredient(name: string): PantryCategory
// PantryCategory: "Produce" | "Meat" | "Dairy" | "Bakery" | "Frozen" | "Cupboard" | "Herbs & Spices" | "Drinks" | "Unclassified"
```

Keyword-based category assignment. Used in `planMissingIngredientsForShoppingList` and `computeShoppingList`. The 9 categories align with `SHOPPING_CATEGORIES` in `types/v2.ts`. Regression test verifies all categories render in the shopping UI.

---

## 16. Error Handling

### 16.1 Server Action Errors

Actions return typed error objects; they do not throw to the client. The UI reads `.error` or `.success` from the returned state.

| Condition | Behaviour |
|---|---|
| Not authenticated | `redirect("/login")` — never returns |
| Validation failure | Returns `{ error: "Human-readable message" }` |
| Database error | Returns `{ success: false, error: error.message }` |
| Gemini error | Returns `{ status: "error", message }` via `mapGeminiError()` |
| Community learning failure | Non-blocking — continues with empty cache snapshot |
| Shopping regeneration failure | Non-fatal in planner/receipt contexts — logged as warning |

### 16.2 Gemini Error Mapping

`mapGeminiError(error, context)` returns `{ status: number, message: string }` with context-specific user messages. Contexts: `"receipt"`, `"meals"`, `"planner"`.

### 16.3 Receipt Scan Errors

Structured JSON errors with `code` (machine-readable), `error` (human-readable), `retryable` (boolean), `requestId` (for correlation). See §4.1 for all error codes.

---

## 17. Appendix — Server Action Dependency Graph

```
User Interaction
  ↓
Client Component
  ↓ (Server Action call)
  ├── auth.ts ──────────────────────────────── Supabase Auth only
  │
  ├── pantry.ts
  │   ├── learnAndSnapshot() → community-foods.ts → Supabase RPC
  │   ├── insertOrStackPantryItem() → pantry-stacking.ts → pantry table
  │   └── triggerShoppingListRegeneration() → shopping.ts
  │
  ├── receipt.ts
  │   ├── enrichScannedItem() → community-foods.ts → Supabase RPC
  │   ├── insertOrStackPantryItem() → pantry-stacking.ts
  │   └── triggerShoppingListRegeneration() → shopping.ts
  │
  ├── shopping.ts
  │   ├── regenerateShoppingList()
  │   │   ├── fetchActivePlanItems() → meal_plans, meal_plan_items
  │   │   ├── pantry SELECT
  │   │   ├── shopping_list_items SELECT
  │   │   ├── buildFoodResolver() → food-resolver.ts → RPC
  │   │   ├── computeShoppingList() → shopping-list.ts (pure)
  │   │   ├── collectManualItemsToPreserve() (pure)
  │   │   ├── shopping_list_items DELETE
  │   │   └── insertShoppingListRows() → shopping-list-persistence.ts
  │   ├── getShoppingList() → shopping_list_items SELECT only
  │   ├── toggleShoppingItem() → shopping_list_items UPDATE
  │   ├── clearCheckedItems() → shopping_list_items DELETE (checked)
  │   └── clearShoppingList() → shopping_list_items DELETE (all)
  │
  ├── shopping-list.ts
  │   └── addMissingIngredientsToShoppingList()
  │       ├── pantry SELECT, shopping_list_items SELECT
  │       ├── buildFoodResolver() → food-resolver.ts → RPC
  │       ├── planMissingIngredientsForShoppingList() → add-missing-ingredients-core.mjs (pure)
  │       └── insertShoppingListRows() → shopping-list-persistence.ts
  │
  ├── meals.ts
  │   ├── getCatalogueMealSuggestions()
  │   │   ├── pantry SELECT
  │   │   └── buildFoodResolver() + rankRecipes() (pure)
  │   ├── suggestMeals()
  │   │   ├── pantry SELECT
  │   │   ├── buildFoodResolver() + rankRecipes() (pure)
  │   │   └── Gemini API call
  │   ├── completeCookedMeal()
  │   │   ├── consumePantryForCookedMeal() → pantry-consumption.ts
  │   │   │   ├── pantry SELECT + UPDATE/DELETE
  │   │   │   ├── buildFoodResolver() → RPC
  │   │   │   └── cooking_behavior_observations INSERT
  │   │   └── triggerShoppingListRegeneration() → shopping.ts
  │   ├── saveMeal() → meals_saved INSERT
  │   └── removeSavedMeal() → meals_saved DELETE
  │
  ├── planner.ts
  │   ├── generateMealPlan()
  │   │   ├── pantry SELECT
  │   │   ├── Gemini API call
  │   │   ├── meal_plans DELETE + INSERT
  │   │   ├── meal_plan_items INSERT
  │   │   └── triggerShoppingListRegeneration() → shopping.ts
  │   ├── reorderMealPlanItems()
  │   │   ├── meal_plan_items UPDATE
  │   │   └── triggerShoppingListRegeneration() → shopping.ts
  │   └── replaceMealPlanItem()
  │       ├── Gemini API call
  │       ├── meal_plan_items UPDATE
  │       └── triggerShoppingListRegeneration() → shopping.ts
  │
  ├── dashboard.ts
  │   └── getDashboardHomeData()
  │       ├── pantry + meals_saved + meal_plan_items + shopping_list_items SELECT (parallel)
  │       └── buildFoodResolver() + countCookableRecipes() + rankRecipes() (pure)
  │
  ├── settings.ts → Supabase Auth updateUser / rpc delete_user_account
  │
  └── community-intelligence.ts (SUPER_ADMIN only)
      └── community_foods, food_categories, food_subcategories,
          storage_locations, community_food_moderation_history SELECT/INSERT/UPDATE

REST API
  └── /api/scan-receipt
      ├── Supabase Auth getUser
      └── Gemini Vision API call
```
