# TECHNICAL PRODUCT REQUIREMENTS DOCUMENT (TECHNICAL PRD)

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit & Release Date:** September 2026

---

## 1. System & Technology Architecture

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|  - Web Browser / Mobile Responsive PWA                                                |
|  - Tailwind CSS v4 + Base-UI / Radix Primitives + Lucide Icons                        |
|  - ECharts (Dynamically Code-Split via next/dynamic)                                  |
+-------------------------------------------┬-------------------------------------------+
                                            │ HTTPS / JSON / Server Action Payloads
                                            ▼
+---------------------------------------------------------------------------------------+
|                                   NEXT.JS 16 ENGINE                                   |
|  - Edge / Serverless Node.js 24 Runtime                                               |
|  - App Router with Streaming Server Components (<Suspense>)                           |
|  - Server Actions for Data Mutations (Zod Validated)                                  |
|  - Proxy Middleware: Request Header Injection (x-pathname) & Cookie Guard             |
+-------------------------------------------┬-------------------------------------------+
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
+-------------------------------------------+ +-----------------------------------------+
|           BETTER AUTH 1.6.25              | |        APPLICATION FEATURE SERVICES     |
|  - Multi-Tenant Organization Plugin       | |  - Assessment Engine (Deterministic)    |
|  - RBAC (Admin / Head / Assistant)        | |  - Schedule Conflict & Recurrence Engine|
|  - Session Verification via Prisma Adapter| |  - Coaching Intelligence Aggregator     |
|  - Request-Scoped Cache (React.cache)     | |  - Portal Achievements & Star Calculator|
+-------------------------------------------+ +-----------------------------------------+
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │ Prisma 6 Client
                                            ▼
+---------------------------------------------------------------------------------------+
|                          DATABASE & CONNECTION LAYER                                  |
|  - Supabase Transaction Pooler (PgBouncer / Supavisor, Port 6543)                     |
|  - PostgreSQL 15 Engine (ap-southeast-1, AWS Singapore)                               |
|  - 7 Synchronized Prisma Migrations                                                   |
|  - Composite Tenant Indexes [organizationId, ...]                                     |
+---------------------------------------------------------------------------------------+
```

---

## 2. Architectural Decisions, Tradeoffs & Risk Matrix

### Decision 1: Next.js App Router (RSC) vs. Decoupled Single-Page App (SPA)
- **DECISION:** Keep Next.js 16 App Router with React Server Components.
- **REASON:** Measured framework overhead is only **7ms–18ms**. Server Components keep business algorithms, database credentials, and PDF engines on the server, sending zero SQL/ORM logic to client browsers.
- **TRADEOFF:** Requires strict discipline regarding `"use client"` vs Server Components and proper use of React `<Suspense>`.
- **RISK:** Misusing `await headers()` can accidentally opt routes out of static caching if not properly isolated.

### Decision 2: Single CTE Aggregation vs. Multiple Prisma Micro-Queries
- **DECISION:** Consolidate multi-query waterfalls (such as the 12 dashboard queries) into parameterized PostgreSQL batch queries (CTE / `json_build_object`).
- **REASON:** Reduces remote WAN network roundtrips from 12–22 down to 1, cutting server database wait from **~880ms to < 50ms** (-90% TTFB drop).
- **TRADEOFF:** Slightly more complex SQL query definitions compared to standard Prisma `.findMany()` syntax.
- **RISK:** Must maintain strict TypeScript mapping contracts to prevent schema drift.

### Decision 3: Better Auth with Request-Scoped React Cache
- **DECISION:** Maintain Better Auth 1.6.25 with Organization plugin, wrapping `requireOrgContext()` inside `React.cache()` and short-lived session memoization.
- **REASON:** Eliminates duplicate session database lookups across layout and child page renders, saving **~328ms** on every page switch.
- **TRADEOFF:** Role changes take up to the cache TTL (30s) to propagate if not explicitly invalidated.
- **RISK:** Minimal; mutations already call `revalidatePath()`.

### Decision 4: Dynamic Code-Splitting of Chart Components (`echarts`)
- **DECISION:** Dynamically load `echarts-for-react` via `next/dynamic(..., { ssr: false })` with SVG placeholder skeletons.
- **REASON:** Removes **~1.1MB uncompressed JavaScript** from initial client route chunks, dropping mobile hydration lock from 350ms to **< 80ms**.
- **TRADEOFF:** Brief visual transition (<50ms) as canvas engine mounts after chunk download.
- **RISK:** Zero regression risk; charts render client-side only.

---

## 3. Frontend Architecture & Client/Server Boundaries

### 3.1 Strict Server Component Rules
- All page entries (`page.tsx`) and layouts (`layout.tsx`) **MUST BE SERVER COMPONENTS**.
- Direct database queries, auth context verification, and heavy business aggregations **MUST REMAIN SERVER-SIDE**.
- Client Components **ARE STRICTLY PROHIBITED** from importing `@prisma/client`, `better-auth/node`, or `env.server`.

### 3.2 Strict Client Component Rules (`"use client"`)
Client components are strictly reserved for:
1. Interactive stateful UI controls (e.g. `FieldStopwatch`, `AthleteFilters`, `DialogForm`, `CommandPalette`).
2. DOM event listeners (keyboard shortcuts `Ctrl+K`, window resize, touch events).
3. Dynamic client-only libraries (e.g. `ECharts` canvas rendering, `Sonner` toasts).
4. Form inputs bound to Server Actions via `useTransition` or `useActionState`.

---

## 4. API & Mutation Architecture

- **Data Mutations:** Handled primarily via Next.js **Server Actions** located in `src/features/[feature]/actions.ts`.
- **Validation:** 100% of mutation payloads must be parsed via Zod schemas before database execution.
- **Cache Revalidation:** Every mutation must invoke `revalidatePath()` or `revalidateTag()` on affected paths upon successful transaction commit.
- **REST Route Handlers:** Reserved strictly for file streaming (`/api/assessments/[id]/pdf`, `/api/portal/pdf/*`) and batch data exports (`/api/export/*`).

---

## 5. Security & Multi-Tenancy Architecture

- **Tenant Scoping:** Every Prisma query accessing tenant data must include `where: { organizationId }`.
- **RBAC Guarding:** Server Actions verify member permissions via `requireOrgContext()`:
  - `admin`: All organization operations.
  - `head_coach`: Assessments, benchmarks, training plans, athletes, schedules.
  - `assistant_coach`: Field attendance, workout logging, session execution.
- **Portal Access Token Guard:** Token hashes (`PortalAccess.tokenHash`) are generated using cryptographic random bytes and verified via SHA-256 hash comparison with expiry timestamps (`expiresAt > now`).

---

## 6. Observability, Logging & Error Handling

- **Error Boundaries:** Private app route segment protected by `src/app/(app)/error.tsx` providing user-friendly fallback and error recovery.
- **Structured Error Logging:** Application errors logged with request context (`organizationId`, `userId`, `actionName`) in development and production log streams.
- **Prisma Error Interception:** Database constraint violations (unique collisions, foreign key violations) translated into localized Indonesian user messages.
