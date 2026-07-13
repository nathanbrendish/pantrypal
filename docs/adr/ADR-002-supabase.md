# ADR-002: Supabase as the Backend Platform

**Status:** Accepted  
**Date:** July 2026  
**Deciders:** Engineering lead  
**Repository Path:** `/src/lib/supabase/`, `/supabase/migrations/`, `/src/app/actions/`

---

## Context

ShelfLife requires a backend that provides:

1. **Authentication** — email/password registration, login, email verification, password reset
2. **Relational database** — pantry items, meal plans, shopping lists, community foods, taxonomy, and more
3. **Row Level Security** — every user sees only their own data; no application-level query filtering alone
4. **Server Functions (RPCs)** — complex operations that span multiple tables (e.g., `resolve_community_foods`, `delete_user_account`)
5. **Hosted PostgreSQL** — no database infrastructure to manage
6. **JavaScript client with SSR support** — cookies-based session management in Next.js Server Components

---

## Problem

What backend platform should manage authentication, data persistence, and row-level security for ShelfLife?

The primary constraints are:
- No dedicated backend infrastructure team — Postgres management must be hosted
- Auth must be production-grade with email confirmation and password reset
- RLS must be enforced at the database level (not just application code) to prevent data leakage
- The `@supabase/ssr` package must integrate with Next.js cookie-based session management
- Complex operations (user deletion with cascading data cleanup, batch food resolution) should be expressible as database functions

---

## Decision

**Supabase** is the backend platform for authentication, database, and server-side functions.

**Client package:** `@supabase/supabase-js` + `@supabase/ssr` (see `package.json`)

### Two Project Model

ShelfLife uses two Supabase projects:

| Project | Purpose | Connected From |
|---|---|---|
| **Development** | Feature development, migration testing | Local `npm run dev`, Vercel preview |
| **Production** | Live traffic at myshelflife.co.uk | Vercel production deployment |

### Supabase Client Pattern

ShelfLife uses two client creation patterns:

**Server Components and Server Actions** (`src/lib/supabase/server.ts`):
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll, setAll } }
  );
}
```

**Client Components** (`src/lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Middleware session refresh** (`src/lib/supabase/middleware.ts`):  
The middleware creates a Supabase client on every request to refresh the session cookie. This is the pattern required by `@supabase/ssr` for App Router compatibility.

### Authentication Features Used

| Feature | Supabase Mechanism |
|---|---|
| Email/password registration | `supabase.auth.signUp()` |
| Login | `supabase.auth.signInWithPassword()` |
| Session validation | `supabase.auth.getUser()` (validates against server, not just cookie) |
| Email verification | `emailRedirectTo` → `/auth/callback` → `exchangeCodeForSession` |
| Password reset | `supabase.auth.resetPasswordForEmail()` → callback → `supabase.auth.updateUser()` |
| Session cookie refresh | Middleware `updateSession()` on every request |
| Logout | `supabase.auth.signOut()` |
| User deletion | `delete_user_account()` RPC with `SECURITY DEFINER` |
| Display name | `supabase.auth.updateUser({ data: { display_name } })` |

### Row Level Security

Every application table has RLS enabled. Policies follow consistent patterns:

```sql
-- User-owned tables
CREATE POLICY "Users can view their own items"
  ON public.pantry FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Community tables (all authenticated users can read)
CREATE POLICY "Authenticated users can view food categories"
  ON public.food_categories FOR SELECT
  TO authenticated
  USING (true);
```

All 11 migrations enforce RLS on new tables. There are no tables with RLS disabled in production.

### Server Functions (RPCs)

Complex operations are implemented as PostgreSQL functions called via `supabase.rpc()`:

| RPC | Purpose |
|---|---|
| `delete_user_account()` | Cascading user deletion (SECURITY DEFINER) |
| `record_community_food_observation()` | Anonymous learning (SECURITY DEFINER) |
| `get_community_food_classification()` | Classification lookup |
| `resolve_community_foods()` | Batch food resolution for Knowledge Graph |
| `is_super_admin()` | SUPER_ADMIN role check |
| `refresh_stale_pantry_classifications()` | Cache refresh for stale classification snapshots |

### Migration Management

All schema changes are in `supabase/migrations/` (001–011 as of v2.0). Applied via `supabase db push`. See [docs/database-schema.md](../database-schema.md) for the full migration history.

---

## Alternatives Considered

### Prisma + PlanetScale / Neon

| Factor | Assessment |
|---|---|
| Auth | None built-in; requires NextAuth or custom JWT implementation |
| RLS | Not native; row filtering must be done at application level |
| Migrations | Prisma has its own migration system; mature |
| Hosting | PlanetScale (MySQL) or Neon (PostgreSQL); separate auth service needed |
| DX | Good for relational data; poor for auth integration |

Rejected: No built-in auth. Row-level filtering in application code is less secure than database-enforced RLS. Two separate services (auth + database) increases operational complexity.

### Firebase / Firestore

| Factor | Assessment |
|---|---|
| Auth | Firebase Auth is mature and excellent |
| Database | Firestore is NoSQL — relational queries (JOINs, foreign keys) are awkward |
| RLS equivalent | Firestore security rules — different paradigm |
| SQL | No SQL; ShelfLife's shopping computation and community intelligence require relational queries |
| Migrations | No concept of schema migrations |

Rejected: NoSQL is a poor fit for ShelfLife's relational data model (pantry joins taxonomy, shopping references planner, community voting aggregates). The deterministic shopping computation (`computeShoppingList()`) depends on relational queries.

### Custom PostgreSQL + Auth0 / Clerk

| Factor | Assessment |
|---|---|
| Auth | Auth0/Clerk are mature; separate billing and vendor |
| Database | Self-managed PostgreSQL requires infrastructure |
| RLS | Requires custom implementation or `SET LOCAL` tricks |
| Migration | Standard Postgres tooling |
| Complexity | Three vendors (PG host + auth + application) vs one (Supabase) |

Rejected: Unnecessary operational complexity for a single-team product. Supabase provides all three (auth, database, RLS) as a single managed service.

### MongoDB Atlas

| Factor | Assessment |
|---|---|
| Auth | No built-in auth |
| Schema | Document model; relational queries via `$lookup` are verbose and slow |
| Migrations | No formal migration system |

Rejected: Same reasons as Firestore — relational model is fundamental to ShelfLife.

---

## Consequences

### Positive

- RLS enforced at the database level — impossible to expose another user's data via a missing application filter
- `@supabase/ssr` handles cookie-based session management with minimal boilerplate
- `supabase.auth.getUser()` validates the JWT server-side on every Server Action — no stale session exploitation
- PostgreSQL's full SQL feature set available for complex queries and aggregations
- RPCs allow complex multi-table operations in a single network round trip
- Platform dashboard (Supabase Studio) provides direct database access for debugging and migration verification
- Supabase hosts two environments (Development and Production) under one dashboard

### Negative / Trade-offs

- Environment variable discipline is critical — the wrong `NEXT_PUBLIC_SUPABASE_ANON_KEY` silently causes `"Invalid API key"` errors (see [docs/development-log.md](../development-log.md) for the investigation history)
- `@supabase/ssr` requires the middleware cookie pattern — missing it breaks session refresh
- No `supabase/config.toml` in the repository — local `supabase start` is not supported; all development is against the hosted Development project
- SECURITY DEFINER functions require careful privilege management; `delete_user_account()` must be audited regularly

### Mitigations

- The two Supabase clients (`createClient()` in `server.ts` and `client.ts`) are wrappers with consistent cookie configuration
- `src/lib/supabase/middleware.ts` is the single place session refresh is configured
- All Server Actions call `getAuthenticatedUser()` which calls `supabase.auth.getUser()` (not `getSession()`) to validate against the server
- `REVOKE ALL ON FUNCTION ... FROM PUBLIC` is applied to SECURITY DEFINER functions in migrations

---

## Implementation

| File | Purpose |
|---|---|
| `src/lib/supabase/server.ts` | Server-side Supabase client factory |
| `src/lib/supabase/client.ts` | Browser-side Supabase client factory |
| `src/lib/supabase/middleware.ts` | Session refresh middleware |
| `src/app/auth/callback/route.ts` | Auth code exchange endpoint |
| `supabase/migrations/` | All schema migrations (001–011) |

---

## Future Implications

- If ShelfLife moves to household sharing, RLS policies will need significant extension (household_id instead of user_id for shared tables)
- The Supabase real-time feature has not been adopted; if collaborative pantry editing is added, Supabase Realtime is the natural path
- The SUPER_ADMIN role (`is_super_admin()` RPC) could be extended for additional administrative tiers without changing the auth provider

---

## Cross References

- [docs/architecture.md — Authentication](../architecture.md)
- [docs/database-schema.md](../database-schema.md)
- [docs/developer-onboarding.md — Supabase Setup](../developer-onboarding.md#7-supabase-setup)
- [ADR-001: Next.js](./ADR-001-nextjs.md)
- [ADR-003: Server Actions](./ADR-003-server-actions.md)
