# TECHNICAL SPECIFICATION (SINGLE SOURCE OF TRUTH)

**Document Version:** 1.0.0 (Consolidated Architecture & Engineering Spec)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Stack:** Next.js 16.2.12 (Turbopack) + React 19.2.4 + TypeScript + Better Auth 1.6.25 + Prisma 6.19.3 + Supabase PostgreSQL 15 + Tailwind CSS v4  
**Date:** September 2026

---

## 1. Frontend Engineering & Component Boundaries

### 1.1 Architecture & Routing
- **Framework:** Next.js 16.2.12 App Router with React Server Components (RSC).
- **Styling & Design Tokens:** Tailwind CSS v4 with `@tailwindcss/postcss` and CSS variables in `globals.css`.
- **Component Primitives:** Custom Base-UI / Radix primitives with Lucide React icons.
- **Route Groups:**
  - `src/app/(public)/`: Public marketing & authentication (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`).
  - `src/app/(app)/`: Private Coach & Admin operations protected by proxy middleware and `requireOrgContext()`.
  - `src/app/portal/[token]/`: Token-guarded lightweight athlete and parent portal (zero coach session overhead).
  - `src/app/api/`: REST handlers for PDF streaming and CSV export.

### 1.2 Strict Server vs. Client Boundary Rules
- **Server Components (Default):** All page roots (`page.tsx`) and layouts (`layout.tsx`) are Server Components. Direct database queries (`prisma.*`), auth context retrieval (`requireOrgContext()`), and business engines run on the server.
- **Client Components (`"use client"`):** Strictly confined to interactive leaf components:
  - User controls: `FieldStopwatch`, `AthleteFilters`, `DialogForm`, `CommandPalette`.
  - Event listeners: Global keyboard listener (`Ctrl+K`), touch gestures.
  - Client-only canvas rendering: `ECharts` (dynamically loaded).
- **Serialization Rule:** Never pass Prisma `Decimal` instances directly to Client Components. Convert `Decimal` to `number` or `null` in query return mappers.

### 1.3 Dynamic Chart Code-Splitting
- `echarts-for-react` and `echarts` **MUST NEVER** be imported statically in client bundles.
- Always import dynamically:
  ```typescript
  import dynamic from "next/dynamic";
  const ReactECharts = dynamic(() => import("echarts-for-react"), {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-surface-2" />,
  });
  ```
- **Impact:** Shaves ~1.1MB uncompressed JS from initial route chunks, reducing mobile hydration lock to < 80ms.

---

## 2. Backend & Mutation Architecture

### 2.1 Server Action Contracts
All state mutations in `src/features/[feature]/actions.ts` follow a standard typed contract:
```typescript
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### 2.2 Standard Mutation Workflow
Every Server Action must strictly execute:
1. **Authentication & Authorization:** Verify member role via `requireOrgContext()`.
2. **Payload Validation:** Validate 100% of input fields via Zod schemas (`schema.safeParse()`).
3. **Database Mutation:** Scoped by `organizationId`, executed within atomic `prisma.$transaction` if multi-row.
4. **Cache Invalidation:** Call `revalidatePath()` or `revalidateTag()`.
5. **Return:** Uniform `ActionResult<T>`.

### 2.3 REST Route Handlers
- `/api/auth/[...all]`: Better Auth handler (login, session, password reset).
- `/api/assessments/[id]/pdf`: Streams coach assessment report PDF (`@react-pdf/renderer`).
- `/api/portal/pdf/[token]/[assessmentId]`: Streams athlete portal assessment report PDF.
- `/api/export/[entity]`: Streams UTF-8 BOM CSV exports (`athletes`, `schedule`, `session-logs`, `assessments`).

---

## 3. Data Access & Query Architecture

### 3.1 Principles of Data Fetching
- **Query Ownership:** Confined to `src/features/[feature]/queries.ts`. Direct `prisma.*` in UI component files is prohibited.
- **Critical Path Latency Optimization:** Avoid sequential query waterfalls over remote WAN. Use `Promise.all` or single consolidated raw SQL CTE queries (`prisma.$queryRaw`) for multi-statistic pages.
- **Selective Projection:** Always specify explicit `select` fields; avoid open `select: *`.

### 3.2 Dashboard CTE Aggregation Pattern
Consolidates 12 separate Prisma queries into 1 single database roundtrip:
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
**Impact:** Drops DB wait from **880ms to < 45ms**.

### 3.3 Caching Architecture
- **Request-Level Deduplication:** `requireOrgContext()` wrapped in `React.cache()`.
- **Tagged Master Data Caching:** `unstable_cache` with tags for low-frequency write data:
  - `master:test_items:[orgId]`
  - `master:benchmarks:[orgId]`
  - `master:org_profile:[orgId]`

---

## 4. Database Architecture & Schema Specification

### 4.1 Connection Architecture
- **Runtime App Pooler (`DATABASE_URL`):** Connects to Supabase Transaction Pooler (PgBouncer, Port 6543) with `?pgbouncer=true`.
- **Direct Migration URL (`DIRECT_URL`):** Connects to PostgreSQL on Port 5432 for running `npx prisma migrate deploy`.

### 4.2 Entity Models Summary
- `organization`: Tenant root.
- `user`, `session`, `account`, `verification`: Better Auth core authentication.
- `member`: User-to-organization association with role (`admin`, `head_coach`, `assistant_coach`).
- `athlete`: Athlete biometrics, training level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ELITE`), sport category, parent contact.
- `athlete_injury_history`: Injury records and active recovery tracking.
- `assessment_component` & `test_item`: Configurable physical test items with units and directions (`HIGHER_IS_BETTER` / `LOWER_IS_BETTER`).
- `benchmark`: Age/gender threshold standards (`thresholdA` to `thresholdD`).
- `assessment` & `assessment_result_item` & `assessment_analysis`: Header, items, and radar analytics.
- `schedule_session` & `schedule_session_athlete`: Field appointments and athlete rosters.
- `training_plan` & `exercise` & `training_exercise`: Reusable exercise library and workout templates.
- `session_log`: Completed workout records, presensi, and video reference URLs.
- `portal_access`: Token-based lightweight access credentials for athletes/parents.
- `attendance`: Granular attendance marking (`PRESENT`, `ABSENT`, `SICK`, `EXCUSED`).
- `parent_feedback`: 5-star parent ratings and coach response threads.
- `athlete_goal`: Physical milestone target tracking.

### 4.3 Key Indexes
- `athlete(organizationId)`, `assessment(organizationId)`, `schedule_session(organizationId)`
- `member(organizationId, userId)` [UNIQUE compound key]
- `assessment(athleteId, assessmentDate)` [Index for progress timelines]
- `portal_access(tokenHash)` [UNIQUE index for O(1) unauthenticated access]
- `assessment_result_item(assessmentId, testItemId)` [UNIQUE constraint]

---

## 5. Authentication Architecture

- **Engine:** Better Auth 1.6.25 with Prisma Adapter & Organization plugin.
- **Session Verification:** Signed cookies (`better-auth.session_token=<token>.<hmac>`) verified against the `session` table.
- **Tenant Context (`requireOrgContext()`):** Retrieves and memoizes active tenant context for the request lifecycle.
- **Portal Token Verification:** SHA-256 token hash verified against `portal_access` table with `expiresAt > now()` and `revokedAt IS NULL`.

---

## 6. Technical Deployment Specification

- **Platform:** Vercel (Serverless Node.js 20/24).
- **Build Command:** `npm run build` (`prisma generate && next build`).
- **Runtime Environment Variables:**
  - `DATABASE_URL` (Port 6543 pooled connection)
  - `DIRECT_URL` (Port 5432 direct connection)
  - `BETTER_AUTH_SECRET` (32-byte session HMAC key)
  - `BETTER_AUTH_URL` (Base application URL)
  - `NEXT_PUBLIC_APP_URL` (Public application URL)
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (Supabase storage & admin)
  - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` (CDN assets)
  - `RESEND_API_KEY` (Transactional email delivery)
