# ARCHITECTURE MIGRATION & REFACTORING PLAN

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Technology Stack Audit & Rebuild Decision  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Current Architecture vs. Target Architecture

```
========================================================================================
CURRENT ARCHITECTURE (Bottleneck: Waterfall Queries & Heavy Client Bundles)
========================================================================================
[Client Browser]
       │
       ▼ (Navigates to /dashboard or /athletes)
[Next.js Dynamic SSR (Uncached, headers() opt-out)]
       │
       ├─► auth.api.getSession (1 DB query)
       ├─► prisma.member.findUnique (1 DB query)
       │
       ▼ (Sequential/Concurrent Unaggregated Prisma Calls)
[PostgreSQL Database (Supabase Remote)]
       ├── Count active athletes (Query 1)
       ├── Count month assessments (Query 2)
       ├── Count today sessions (Query 3)
       ├── Count draft assessments (Query 4)
       ├── Count active injuries (Query 5)
       ├── Count unlogged sessions (Query 6)
       ├── Find completed scores (Query 7)
       ├── GroupBy active athlete (Query 8)
       ├── Find completed analyses (Query 9)
       ├── Find upcoming sessions + coach + athletes (Query 10)
       ├── Find recent assessments + athlete (Query 11)
       ├── Find athlete directory (Query 12)
       ├── Re-test intelligence findMany (Query 13)
       ├── Coaching workload findMany (Queries 14-15)
       ├── Session health findMany (Query 16)
       └── Squad adaptation findMany (Queries 17-18)
       │
       ▼ (Total 18-22 DB roundtrips over Serverless TCP: 1.5s - 3.5s latency)
[Client receives HTML + 1.2MB Synchronous ECharts JS bundle]
       │
       ▼ (Main Thread Long Task: 400-800ms Hydration Delay)
[Interactive UI Page Ready]

========================================================================================
TARGET ARCHITECTURE (High-Speed Streamed RSC + Consolidated SQL + Code-Split Client)
========================================================================================
[Client Browser]
       │
       ▼ (Instant Navigation — Layout & Shell rendered < 80ms)
[Next.js 16 App Router + Streaming Suspense Boundaries]
       │
       ├── Layout Shell Streams Immediately (CoachShell + Navigation)
       │
       ├── <Suspense fallback={<StatsSkeleton />}>
       │      │
       │      ▼ (1 Consolidated Aggregation CTE Query / Cached View)
       │   [PostgreSQL (Supabase Transaction Pooler - Port 6543)]
       │      └── Single Roundtrip (< 40ms) returns all counts & stats
       │
       ├── <Suspense fallback={<IntelligenceSkeleton />}>
       │      │
       │      ▼ (Parallel Streamed Batch Query for Intelligence & Adaptation)
       │   [PostgreSQL] -> Returns Re-Test, Workload, & Adaptation Data
       │
       └── [Client Bundle: Ultra-lightweight Core JS]
              │
              ├── Charts dynamically loaded on-demand (`next/dynamic` + tree-shaken)
              └── Zero main-thread hydration blocking (TBT < 50ms)
```

---

## 2. Components Strategy

### 2.1 Components to Keep (100% Preserved)
- **All Core Business Logic & Engines (31 test files, 472 unit tests)**:
  - Assessment calculation engine (`src/features/assessments/engine.ts`)
  - Re-test intelligence engine (`src/features/coaching-intelligence/engine.ts`)
  - Schedule conflict & recurrence engines (`src/features/schedule/*-engine.ts`)
  - Portal gamification & achievement system (`src/features/portal/achievements.ts`)
  - Athlete progress timeline & radar calculations (`src/features/analytics/engine.ts`)
- **Database Schema & Migrations**: All 7 existing Prisma migrations and relational integrity constraints.
- **Authentication System**: Better Auth 1.6.25 with Organization plugin and Prisma adapter.
- **UI Design System**: Tailwind CSS v4 styling, custom design tokens in `globals.css`, and custom Radix/Base-UI primitives.

### 2.2 Components to Refactor & Optimize
- **Data Access Layer (`queries.ts` across features)**:
  - Consolidate multi-query waterfalls (`getDashboardStats`, `listAthletes`, `getScheduleData`) into optimized composite queries with specific `select` fields.
  - Implement PostgreSQL indexing optimizations (composite index for `[organizationId, assessmentDate]` and `[organizationId, startTime]`).
- **Server Component Rendering Architecture**:
  - Break monolithic pages (e.g. `DashboardPage`, `AthletesPage`, `SchedulePage`) into granular streaming sub-components wrapped in `<Suspense>`.
- **Client Chart Integration**:
  - Replace direct synchronous imports of `echarts-for-react` with lazy dynamic imports (`dynamic(() => import(...), { ssr: false })`).
- **Data Caching Layer**:
  - Introduce `unstable_cache` with tagged cache revalidation (`revalidateTag`) for static/semi-static master data (Test items, benchmark thresholds, organization profile).

### 2.3 Components to Replace / Deprecate
- Unaggregated in-memory full array aggregations (replaced by database-level aggregations / JSON builds).
- Synchronous heavy client component loads.

---

## 3. Data Migration Safety Plan

> [!IMPORTANT]
> **DEFAULT POLICY: REUSE EXISTING DATA WITH ZERO DESTRUCTIVE MIGRATIONS.**
> The current PostgreSQL database on Supabase contains 7 synchronized migrations and live production-ready schema. No data will be dropped, altered, or wiped.

### 3.1 Migration Steps
1. **Schema Integrity:** Verify `npx prisma migrate status` to confirm all 7 migrations match the database schema.
2. **Index Optimization (Non-Destructive):** Apply targeted non-destructive indexes (e.g. `CREATE INDEX CONCURRENTLY IF NOT EXISTS`) to speed up multi-tenant filters.
3. **Rollback Strategy:** All query optimizations exist at the application query level; database schema remains backward-compatible.

---

## 4. Authentication & Security Migration

- **Current Authentication:** Better Auth with Prisma adapter, SHA-256 portal tokens, and session cookies.
- **Action:** **NO MIGRATION REQUIRED**. The auth engine is already secure, supports RBAC (Admin, Head Coach, Assistant Coach), and handles multi-tenancy correctly.
- **Optimization:** Session queries are cached within the request context using `React.cache` to eliminate duplicate auth DB lookups between `layout.tsx` and child `page.tsx`.

---

## 5. Deployment & Infrastructure Optimization

- **Runtime:** Node.js serverless / edge runtime on Vercel or Node.js Docker container.
- **Database Connection Pooler:** Configure Prisma to connect to Supabase's transaction pooler (port 6543 / Supavisor) via `DATABASE_URL`, using `DIRECT_URL` (port 5432) strictly for migrations.
- **Geographic Alignment:** Ensure compute region (e.g., Singapore `sin1` or nearest edge) matches the Supabase database region (`ap-southeast-1`) to minimize round-trip latency to < 10ms per query.

---

## 6. Estimated Effort & Risk Matrix

| Task Area | Complexity | Regression Risk | Expected Performance Impact |
| :--- | :---: | :---: | :---: |
| Database Query Consolidation (Dashboard & List queries) | Low–Medium | Low (Validated by tests) | **-70% TTFB Latency** |
| Suspense Streaming & Skeleton Boundaries | Low | Very Low | **Instant Page Shell Render (< 100ms)** |
| Dynamic Chart Code-Splitting (`echarts`) | Low | Zero | **-65% Initial Client Bundle Size** |
| Tagged Server Caching (`unstable_cache`) | Low | Low | **Near-Zero Latency on Static Reads** |
| **TOTAL REFACTOR EFFORT** | **LOW–MEDIUM** | **VERY LOW** | **TRANSFORMATIVE SPEEDUP** |
