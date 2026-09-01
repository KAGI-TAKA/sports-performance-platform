# PERFORMANCE OPTIMIZATION ROADMAP & EXPERIMENT SPECIFICATION

**Document Version:** 1.0.0 (Phase 0.5 Implementation Plan)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Prioritized Optimization Roadmap

Optimizations are ranked strictly by **Impact vs. Confidence vs. Risk vs. Effort**:

| Priority | Optimization Area | Impact | Confidence | Risk | Effort | Target Latency Reduction |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **OPT-01** | **Consolidate Dashboard Multi-Query Waterfalls into Aggregated CTE / SQL Batch** | **HIGH** | **HIGH** | Low | Low–Medium | **-600ms to -800ms Server TTFB** |
| **OPT-02** | **Implement React 19 `<Suspense>` Streaming for Heavy Operational Widgets** | **HIGH** | **HIGH** | Very Low | Low | **Instant Shell FCP (< 80ms)** |
| **OPT-03** | **Dynamic Code-Splitting of ECharts (`next/dynamic` with `ssr: false`)** | **HIGH** | **HIGH** | Very Low | Very Low | **-65% Initial Client Bundle (-800KB)** |
| **OPT-04** | **Cache User Session & Member Lookup in Request / Short-Lived In-Memory Cache** | **MEDIUM–HIGH** | **HIGH** | Low | Low | **-300ms Baseline on Every Request** |
| **OPT-05** | **Tag-Based Server Caching (`unstable_cache`) for Static Master Master Data** | **MEDIUM** | **HIGH** | Very Low | Low | **-150ms on Static Master Lookups** |
| **OPT-06** | **Serialize Prisma `Decimal` to Plain Numbers before Passing to Client Components** | **LOW** | **HIGH** | Zero | Very Low | **Eliminates React SSR Serialization Warnings** |

---

## 2. Formal Experiment Specifications

---

### EXPERIMENT EXP-01: Dashboard Query Consolidation (CTE Batching)

- **Experiment ID:** `EXP-01`
- **Hypothesis:** Replacing 12 separate Prisma query calls (`count`, `findMany`, `groupBy`) in `getDashboardStats` with a single consolidated SQL aggregation query (CTE / `json_build_object`) will reduce database round-trips from 12 down to 1, lowering query latency from ~550ms to < 40ms.
- **Baseline Metric:** `getDashboardStats` parallel query execution duration = **350ms – 580ms**; Dashboard route TTFB = **1,067ms**.
- **Proposed Change:** Implement a single parameterized PostgreSQL query via `prisma.$queryRaw` returning a single structured JSON object matching the `DashboardStats` interface.
- **Primary Metric:** `getDashboardStats` execution time (ms) and Dashboard Server TTFB (ms).
- **Success Criteria:**
  - `getDashboardStats` execution time drops to **< 50ms** (at least an 85% drop).
  - Dashboard TTFB drops to **< 500ms** (pre-auth cache) or **< 200ms** (post-auth cache).
  - All existing dashboard tests in `dashboard.test.ts` and `dashboard-resilience.test.ts` pass with 100% accuracy.
- **Regression Criteria:** Any discrepancy in counts (athletes, assessments, sessions) or type shape errors.
- **Rollback Strategy:** Revert `src/features/dashboard/queries.ts` to the original `Promise.all` Prisma implementation.

---

### EXPERIMENT EXP-02: React 19 Streaming Suspense Boundaries

- **Experiment ID:** `EXP-02`
- **Hypothesis:** Wrapping secondary widgets (`SquadAdaptationHub`, `DashboardWorkloadWidget`, `DashboardReTestWidget`) in `<Suspense fallback={<WidgetSkeleton />}>` will allow Next.js to immediately stream the page shell, sidebar, and Level 1 Attention items in < 80ms, eliminating the 1.1s blank screen.
- **Baseline Metric:** First Contentful Paint (FCP) and initial HTML stream delivery = **1,067ms**.
- **Proposed Change:** Decouple secondary async queries from `DashboardPage` top-level `await` and stream them as independent async Server Components.
- **Primary Metric:** Time to First Streamed Chunk / FCP (ms).
- **Success Criteria:**
  - Initial HTML chunk containing `CoachShell` and skeletons received in **< 80ms**.
  - Secondary widgets stream into their respective skeleton slots without layout shifts (CLS < 0.05).
- **Regression Criteria:** Visual layout flickering or cumulative layout shift (CLS) > 0.1.
- **Rollback Strategy:** Remove `<Suspense>` boundaries and restore parent `await`.

---

### EXPERIMENT EXP-03: Dynamic Lazy Loading of Chart Modules (`echarts`)

- **Experiment ID:** `EXP-03`
- **Hypothesis:** Dynamically loading `echarts-for-react` via `dynamic(() => import(...), { ssr: false })` will remove ~1MB of uncompressed JavaScript from the initial route bundles of `/progress`, `/compare`, `/assessments`, and `/dashboard`.
- **Baseline Metric:** Initial client JS chunk containing `echarts` = **~1.1MB**; mobile hydration time = **320ms – 480ms**.
- **Proposed Change:** Refactor `radar-chart.tsx`, `dual-radar-chart.tsx`, `multi-athlete-radar-chart.tsx`, and `progress-line-chart.tsx` to dynamically import `ReactECharts` with a lightweight SVG placeholder fallback.
- **Primary Metric:** Route client JS bundle size (KB) and Total Blocking Time (TBT).
- **Success Criteria:**
  - Initial JS bundle size reduced by **> 60%** on dashboard and compare routes.
  - Mobile main-thread hydration lock reduced to **< 80ms**.
  - Charts render cleanly once dynamic chunk loads.
- **Regression Criteria:** Chart fails to render or throws SSR window mismatch error.
- **Rollback Strategy:** Restore static `import ReactECharts from "echarts-for-react"`.

---

### EXPERIMENT EXP-04: Session & Auth Context Caching

- **Experiment ID:** `EXP-04`
- **Hypothesis:** Caching session and member verification in a request-scoped / short-lived in-memory cache will eliminate 2 sequential database roundtrips (328ms) on every page load.
- **Baseline Metric:** `requireOrgContext()` database duration = **327.83ms** on every single request.
- **Proposed Change:** Use `unstable_cache` or a short-lived LRU session cache (e.g. 30s TTL) for active session token to organization/member mappings.
- **Primary Metric:** `requireOrgContext()` execution time (ms).
- **Success Criteria:**
  - `requireOrgContext()` execution time drops to **< 5ms** on warm requests.
  - Overall server TTFB drops by **~300ms** across ALL routes.
- **Regression Criteria:** User role change or organization switch is not reflected within the cache window.
- **Rollback Strategy:** Clear cache helper and restore direct `auth.api.getSession` call.

---

### EXPERIMENT EXP-05: Decimal Serialization Normalization

- **Experiment ID:** `EXP-05`
- **Hypothesis:** Converting Prisma `Decimal` instances to native JavaScript numbers (`Number(val)`) in server query return mappers will eliminate RSC serialization errors and avoid repeated runtime warnings.
- **Baseline Metric:** Next.js runtime warning: *"Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported."* logged on `/compare` and `/reports`.
- **Proposed Change:** Ensure all query return mappers convert `Decimal` fields to `number` or `null` before passing props to client components.
- **Primary Metric:** Number of console serialization warnings (target: 0).
- **Success Criteria:**
  - 0 Decimal serialization warnings during SSR.
  - Radar and comparison charts receive strict primitive numbers.
- **Regression Criteria:** Precision loss on decimal measurements.
- **Rollback Strategy:** Revert mapper fields.
