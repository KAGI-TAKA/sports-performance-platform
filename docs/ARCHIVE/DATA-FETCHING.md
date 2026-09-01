# DATA FETCHING & QUERY OPTIMIZATION ARCHITECTURE

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Date:** September 2026

---

## 1. Core Principles of Data Fetching

1. **Optimize for Critical Path Latency (NOT Just Query Count):** Minimize total time spent waiting on network roundtrips before the first UI chunk is rendered.
2. **Server-Side Query Ownership:** All database interactions are confined to `src/features/[feature]/queries.ts` or `src/features/[feature]/actions.ts`. Direct database access from UI component files is strictly prohibited.
3. **Consolidated Batch Queries (CTE Aggregation):** Replace high-frequency micro-queries with single parameterized SQL statements returning structured JSON objects.
4. **Granular Streaming Boundaries:** Wrap data-heavy widgets in React `<Suspense>` boundaries to allow fast initial shell rendering (<80ms).
5. **Strict Multi-Tenant Scoping:** Every query must enforce `where: { organizationId }` derived from `requireOrgContext()`.

---

## 2. Query Patterns & Strategies

### 2.1 The Dashboard Batching Pattern (CTE Optimization)
Instead of dispatching 12 separate Prisma queries (6 count queries, 1 groupBy, 5 findMany) resulting in multiple sequential network roundtrips (~550ms–880ms wait), data is fetched using a single consolidated query:

```sql
WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM athlete WHERE "organizationId" = $1 AND "isActive" = true) AS active_athletes,
    (SELECT COUNT(*) FROM assessment WHERE "organizationId" = $1 AND "assessmentDate" >= $2) AS month_assessments,
    (SELECT COUNT(*) FROM schedule_session WHERE "organizationId" = $1 AND "startTime" >= $3 AND "startTime" <= $4) AS today_sessions,
    (SELECT COUNT(*) FROM assessment WHERE "organizationId" = $1 AND "status" = 'DRAFT') AS draft_assessments,
    (SELECT COUNT(*) FROM athlete_injury_history h JOIN athlete a ON h."athleteId" = a.id WHERE a."organizationId" = $1 AND a."isActive" = true AND h."recoveredAt" IS NULL) AS active_injuries,
    (SELECT COUNT(*) FROM schedule_session WHERE "organizationId" = $1 AND "startTime" < $5 AND "status" = 'COMPLETED' AND NOT EXISTS (SELECT 1 FROM session_log WHERE "sessionId" = schedule_session.id)) AS unlogged_sessions,
    (SELECT AVG("overallScore") FROM assessment WHERE "organizationId" = $1 AND "status" = 'COMPLETED' AND "overallScore" IS NOT NULL) AS avg_score
)
SELECT json_build_object(
  'totalAthletes', active_athletes,
  'assessmentsThisMonth', month_assessments,
  'todaySessionsCount', today_sessions,
  'draftAssessmentsCount', draft_assessments,
  'activeInjuriesCount', active_injuries,
  'unloggedPastSessionsCount', unlogged_sessions,
  'squadAverageScore', ROUND(avg_score, 0)
) AS result FROM stats;
```
**Measured Latency Impact:** Reduces critical-path database latency from **880ms to < 40ms**.

---

### 2.2 Pagination, Sorting & Filtering Standards
All list queries (Athletes, Sessions, Logs, Training Plans) must implement standardized cursor/offset pagination:
- **Default Page Size:** 20 items per page (Athletes), 50 items (Schedule matrix).
- **Indexed Filter Clauses:** Search queries use case-insensitive matching (`mode: "insensitive"`) indexed via trigram or B-tree prefix indexes.
- **Selective Field Fetching:** Explicitly define `select` fields; avoid `select: *` or unrestricted nested `include: { ... }` that pull redundant columns.

---

### 2.3 Caching & Invalidation Architecture
- **Request-Level Deduplication:** `React.cache()` used for `requireOrgContext()` and active organization metadata.
- **Tagged Master Data Caching:** Use `unstable_cache` with tags for low-frequency write data:
  - `master:test_items:[orgId]`
  - `master:benchmarks:[orgId]`
  - `master:org_profile:[orgId]`
- **Cache Invalidation:** Server Actions trigger granular revalidation via:
  - `revalidatePath("/dashboard")`
  - `revalidatePath("/athletes")`
  - `revalidateTag("master:benchmarks:" + orgId)`
