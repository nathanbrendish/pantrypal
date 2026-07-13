# ADR-001: Next.js App Router as the Application Framework

**Status:** Accepted  
**Date:** July 2026  
**Deciders:** Engineering lead  
**Repository Path:** `/next.config.ts`, `/src/app/`, `/src/middleware.ts`

---

## Context

ShelfLife requires a full-stack web framework that can support:

1. **Server-side authentication** — sessions must be validated on the server to prevent client-side auth bypass
2. **Server-side data fetching** — pantry, recipe, shopping, and planner data must be fetched before the page renders
3. **Mutations with form-like UX** — adding ingredients, saving meals, confirming cooking, updating settings
4. **AI integrations** — calling Google Gemini for receipt OCR, meal suggestions, and meal planning (server-side only, to protect the API key)
5. **Route-level authentication guards** — unauthenticated users must be redirected before any page content is served
6. **Static assets and metadata** — PWA manifest, OG tags, sitemaps, robots.txt
7. **Deployable to Vercel** with zero configuration

The project is a consumer application with a single development team. Engineering velocity matters. The framework must reduce boilerplate for the common patterns (data fetching, forms, auth) without requiring a separate backend service.

---

## Problem

What web framework should serve as the foundation for ShelfLife?

The primary tension is between:
- **SSR correctness** — auth and data must be server-validated
- **Development speed** — forms, mutations, and page data should require minimal boilerplate
- **Deployment simplicity** — the team deploys to Vercel; a custom server is undesirable
- **AI route handling** — Gemini calls require a server-only environment to protect API keys

---

## Decision

**Next.js 16.2 with the App Router** is the application framework.

**Version:** Next.js 16.2.10 (see `package.json`)

Key capabilities used:

| Capability | Usage in ShelfLife |
|---|---|
| **App Router** | All routes under `src/app/`; layouts, pages, and nested route groups |
| **Server Components** | All page components default to Server Components; data fetched before render |
| **Server Actions** | All mutations (`src/app/actions/`) — no REST API layer for application data |
| **Route Handlers** | `src/app/api/scan-receipt/route.ts` (binary image upload), `src/app/auth/callback/route.ts` (OAuth code exchange) |
| **Middleware** | `src/middleware.ts` — session refresh and route protection on every request |
| **Dynamic metadata** | `icon.tsx`, `apple-icon.tsx`, `robots.ts`, `sitemap.ts` |
| **`next/font/google`** | Geist Sans + Geist Mono loaded at build time |

---

## Alternatives Considered

### Remix

| Factor | Assessment |
|---|---|
| Server-first mutations | Remix uses `action()` functions — similar to Server Actions |
| Deployment | Requires adapter for Vercel; less zero-config |
| Ecosystem | Smaller ecosystem; fewer community examples |
| Supabase SSR | `@supabase/ssr` has first-class Next.js examples; Remix support secondary |
| Team familiarity | Less familiarity in this team |

Rejected: Smaller ecosystem and non-trivial Vercel deployment compared to Next.js.

### SvelteKit

| Factor | Assessment |
|---|---|
| Server-first | SvelteKit form actions are similar to Server Actions |
| Language | Svelte component syntax; requires TypeScript knowledge transfer |
| Ecosystem | Smaller; fewer Supabase SSR examples |
| Deployment | Works on Vercel; less documented |

Rejected: Language difference (Svelte vs React) and smaller ecosystem for Supabase integration.

### Next.js Pages Router

| Factor | Assessment |
|---|---|
| Server mutations | Requires full REST API via Route Handlers; significantly more boilerplate |
| Data fetching | `getServerSideProps` per page; cannot share fetching logic easily |
| Server Components | Not supported |
| Future direction | Next.js team is investing in App Router; Pages Router is in maintenance mode |

Rejected: App Router reduces boilerplate for the exact patterns ShelfLife needs. Pages Router would require a REST API layer for every mutation.

### Express / Node.js + React SPA

| Factor | Assessment |
|---|---|
| Auth | Requires implementing JWT/session management from scratch |
| Mutations | Full REST API with validation, error handling, serialisation |
| Deployment | Two deployment targets (API server + static assets) |
| Complexity | Significantly higher for a single-team product |

Rejected: Unnecessary complexity; Server Actions and Server Components achieve the same result with less code.

---

## Consequences

### Positive

- Server Actions eliminate the need for a separate REST API for application mutations
- Server Components allow data fetching co-located with the component that renders it
- Middleware handles authentication for all protected routes in one place (`src/lib/supabase/middleware.ts`)
- Zero-config Vercel deployment from `main` branch
- Gemini API key is never exposed to the client — all AI calls are made in server-only contexts
- `@supabase/ssr` integrates natively with Next.js cookie handling

### Negative / Trade-offs

- Server Actions are serialised over HTTP — they cannot return non-serialisable values
- Server Component revalidation requires `revalidatePath()` calls; stale data is possible if callers forget
- The App Router is a newer paradigm; some patterns (e.g., mixing Client and Server Components) have non-obvious constraints
- `"use client"` components cannot access Server Actions directly in all patterns — wrapping is required

### Mitigations

- All Server Actions follow the pattern: authenticate → query with `user_id` scope → return typed discriminated union → `revalidatePath()`
- Shared wrappers (`getAuthenticatedUser()`, `insertShoppingListRows()`, etc.) reduce the chance of forgetting revalidation
- TypeScript strict mode catches serialisation errors at build time

---

## Implementation

Key implementation files:

| File | Purpose |
|---|---|
| `src/middleware.ts` | Entry point: delegates to `updateSession()` |
| `src/lib/supabase/middleware.ts` | Session refresh + protected path redirect + SUPER_ADMIN enforcement |
| `src/app/layout.tsx` | Root layout — `AppProviders` wraps all pages |
| `src/app/actions/*.ts` | All Server Actions — one file per domain |
| `src/app/api/scan-receipt/route.ts` | The only Route Handler used for application mutations (binary upload) |
| `next.config.ts` | Minimal — no custom server-side configuration required |
| `tsconfig.json` | `paths: {"@/*": ["./src/*"]}` — all imports use the `@/` alias |

---

## Future Implications

- Server Actions are the investment path for Next.js; this decision aligns with the framework's direction
- If ShelfLife were to offer a public API (see [docs/product-roadmap.md](../product-roadmap.md#8-commercial-roadmap)), Route Handlers would be added for external consumers without changing the internal Server Action architecture
- React Server Components enable future incremental streaming; individual page sections can be streamed independently

---

## Cross References

- [docs/architecture.md — System Architecture](../architecture.md)
- [docs/api-reference.md — Server Actions](../api-reference.md)
- [ADR-003: Server Actions instead of REST APIs](./ADR-003-server-actions.md)
- [ADR-002: Supabase](./ADR-002-supabase.md)
