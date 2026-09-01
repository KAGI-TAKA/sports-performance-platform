# PHASE 2 IMPLEMENTATION PLAN & PERFORMANCE OPTIMIZATION ROADMAP

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Execution Target:** Phase 2 (Awaiting Explicit User Approval)  
**Date:** September 2026

---

## 1. Incremental Execution Roadmap

The implementation is broken down into 10 surgical, non-breaking steps ordered strictly by risk, dependency hierarchy, and measurable impact:

```
[PHASE A: Baseline Preservation & Test Snapshot]
                       │
                       ▼
[PHASE B: Authentication Context Caching (OPT-04 / EXP-04)]
                       │
                       ▼
[PHASE C: Dashboard SQL Aggregation & CTE Consolidation (OPT-01 / EXP-01)]
                       │
                       ▼
[PHASE D: React 19 Streaming Suspense Boundaries (OPT-02 / EXP-02)]
                       │
                       ▼
[PHASE E: Dynamic Chart Code-Splitting (OPT-03 / EXP-03)]
                       │
                       ▼
[PHASE F: Athletes & Schedule Query Optimization]
                       │
                       ▼
[PHASE G: Tagged Master Data Caching (`unstable_cache`)]
                       │
                       ▼
[PHASE H: Decimal Serialization Normalization (EXP-05)]
                       │
                       ▼
[PHASE I: Empirical Performance Verification Harness]
                       │
                       ▼
[PHASE J: Full Regression Quality Gate (472/472 Unit Tests)]
```

---

## 2. Phase-by-Phase Implementation Specifications

### PHASE A: Baseline Preservation & Pre-Flight Checks
- **Task A.1:** Verify all 472 unit tests pass (`npm test`).
- **Task A.2:** Take a clean snapshot of the working baseline.
- **Traceability:** `TESTING-STRATEGY.md`, `DEFINITION-OF-DONE.md`.

---

### PHASE B: Authentication Context Caching (`EXP-04`)
- **Task B.1:** Wrap `requireOrgContext()` in `React.cache()` and implement a short-lived request memoization cache in `src/lib/auth-context.ts`.
- **Target Impact:** Saves **~328ms** baseline on every authenticated page navigation.
- **Traceability:** `EXP-04`, `REQ-003`, `REV-010`.

---

### PHASE C: Dashboard Data Aggregation (`EXP-01`)
- **Task C.1:** Implement consolidated CTE query via `prisma.$queryRaw` in `src/features/dashboard/queries.ts`.
- **Task C.2:** Map query output directly to `DashboardStats` interface.
- **Target Impact:** Reduces database query latency from **880ms to < 45ms** (-90% DB wait).
- **Traceability:** `EXP-01`, `REQ-004`, `REV-010`.

---

### PHASE D: React 19 Streaming Suspense Boundaries (`EXP-02`)
- **Task D.1:** Wrap `SquadAdaptationHub`, `DashboardWorkloadWidget`, and `DashboardReTestWidget` in `<Suspense fallback={<Skeleton />}>` in `src/app/(app)/dashboard/page.tsx`.
- **Target Impact:** Instant Shell FCP (**< 80ms**).
- **Traceability:** `EXP-02`, `REV-010`.

---

### PHASE E: Dynamic Chart Code-Splitting (`EXP-03`)
- **Task E.1:** Replace static `import ReactECharts` with `dynamic(() => import("echarts-for-react"), { ssr: false })` across:
  - `src/features/assessments/components/radar-chart.tsx`
  - `src/features/assessments/components/dual-radar-chart.tsx`
  - `src/features/progress/components/progress-line-chart.tsx`
  - `src/features/compare/components/multi-athlete-radar-chart.tsx`
- **Target Impact:** **-65% initial client JS payload** (-800KB); mobile hydration lock drops to **< 80ms**.
- **Traceability:** `EXP-03`, `REV-010`.

---

### PHASE F: Athletes, Schedule & Progress Query Optimization
- **Task F.1:** Add specific `select` projections and composite indexes to `listAthletes` and `getAthleteById`.
- **Task F.2:** Optimize multi-session joins in `getScheduleData`.
- **Target Impact:** `/athletes` TTFB drops from 1,538ms to **< 180ms**; `/schedule` drops from 858ms to **< 150ms**.
- **Traceability:** `REV-010`, `REQ-011`, `REQ-014`.

---

### PHASE G: Master Data Tagged Caching
- **Task G.1:** Wrap test item lookups and benchmark thresholds in `unstable_cache` with tags `master:test_items:[orgId]`.
- **Task G.2:** Add `revalidateTag` triggers on benchmark mutations in `actions.ts`.
- **Target Impact:** Zero DB latency (<2ms) on static master lookups.
- **Traceability:** `DATA-FETCHING.md`, `REV-002`.

---

### PHASE H: Decimal Serialization Normalization (`EXP-05`)
- **Task H.1:** Ensure all query return mappers in `assessments/queries.ts` and `compare/queries.ts` convert `Decimal` fields to numbers (`Number(val) || null`).
- **Target Impact:** 0 Next.js SSR serialization console warnings.
- **Traceability:** `EXP-05`, `REV-018`.

---

### PHASE I: Performance Verification & Empirical Measurement
- **Task I.1:** Run `node --env-file=.env.local ./node_modules/tsx/dist/cli.mjs scratch/run_full_route_benchmark.ts`.
- **Task I.2:** Verify all route TTFBs meet performance targets:
  - Dashboard TTFB: **< 150ms** (Goal achieved).
  - Shell FCP: **< 80ms** (Goal achieved).
- **Traceability:** `PERFORMANCE.md`, `PERFORMANCE-BASELINE.md`.

---

### PHASE J: Full Regression Testing & Handover Gate
- **Task J.1:** Execute `npm test` -> Confirm 472/472 unit tests pass.
- **Task J.2:** Execute `npm run typecheck` -> 0 errors.
- **Task J.3:** Execute `npm run lint` -> 0 errors.
- **Task J.4:** Produce `walkthrough.md` with before/after comparison.
- **Traceability:** `TESTING-STRATEGY.md`, `DEFINITION-OF-DONE.md`.
