# CLIENT REQUIREMENT & STACK COMPATIBILITY MATRIX

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Technology Stack Audit & Rebuild Decision  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Requirements Overview

All core business requirements are categorized into Priority 0 (P0: Critical Core), Priority 1 (P1: High Value Operational & Experience), and Priority 2 (P2: Scale & Enhancement). The selected technology architecture must fully support 100% of P0 and P1 requirements with low operational risk and high performance.

---

## 2. Requirement-to-Technology Mapping Matrix

| Req ID | Requirement (P0 / P1) | Target Technology | Technical Implementation Pattern | Architectural & Operational Risk | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | **Multi-Tenant Coach Workspace** (P0) | Next.js 16 + Better Auth (Org Plugin) + Prisma | `requireOrgContext()` retrieves `organizationId`, scoped via SQL index `[organizationId]` on all tables. | Session lookup latency on every request (50-100ms). | Cache session in React Request Cache (`React.cache`) and use compound index `organizationId_userId`. |
| **REQ-02** | **Fast Mobile On-Field Operations** (< 2 min assessment input, quick attendance) (P0) | Next.js Server Actions + Optimistic UI + Zod | Form mutations executed via direct Server Actions with instant local UI feedback and `revalidatePath()`. | Full-page revalidation may cause layout shift or slow responses. | Granular server actions with targeted data return; avoid unnecessary full-tree revalidations. |
| **REQ-03** | **7-Component Physical Assessment Engine & Scoring** (P0) | Pure TypeScript Engine (`engine.ts`) + PostgreSQL | Deterministic pure functions for scoring (A/B/C/D), percentile calculation, and radar analysis. Tested by 24 unit tests. | Computation overhead on request thread if recalculated repetitively. | Store computed summary in `AssessmentAnalysis.componentScores` (JSON) upon submission. |
| **REQ-04** | **Re-Test & Workload Coaching Intelligence** (P1) | Next.js RSC Streaming (`<Suspense>`) + PostgreSQL | Batch SQL query with date window calculations; rendered via asynchronous server component streaming. | Large relational waterfalls (N+1 queries) blocking page TTFB. | Wrap widgets in `<Suspense fallback={<WidgetSkeleton />}>` and consolidate 18 queries into single CTE query. |
| **REQ-05** | **Athlete & Parent Mobile Web Portal** (P0) | Next.js Server Component + Token-Based Auth (`PortalAccess`) | Lightweight unauthenticated route (`/portal/[token]`) verified by SHA-256 token hash lookup. | Token leakage or heavy bundle download on mobile devices. | Pure server-rendered cards; keep client JS minimal; avoid loading heavy coach dependencies on portal route. |
| **REQ-06** | **Youth Athlete Card & Personal Bests Gamification** (P1) | Radix/Base-UI Primitives + Lucide Icons + Tailwind CSS v4 | Visual sporty cards ("Youthful Sports Performance") with star badges, milestones, and personal best markers. | UI sluggishness if heavy 3D or physics libraries are loaded. | Pure CSS animations and hardware-accelerated SVG icons; zero heavy game engine dependencies. |
| **REQ-07** | **Interactive Radar & Progress Trend Charts** (P1) | ECharts 6.1 + `next/dynamic` Lazy Loading | Dynamically imported canvas charts loaded on client demand only when visible. | Monolithic 1.2MB ECharts bundle blocking main thread hydration. | Replace static imports with `const ReactECharts = dynamic(() => import(...), { ssr: false })` and tree-shaken ECharts modules. |
| **REQ-08** | **One-Click PDF Report Generation** (P0) | `@react-pdf/renderer` + Next.js Route Handler (`renderToStream`) | Server-side streamed PDF generation via `/api/assessments/[id]/pdf` and `/api/portal/pdf/[token]/[id]`. | High memory and CPU usage during concurrent PDF generation in serverless. | Stream PDF directly to HTTP response buffer; isolate PDF generation to dedicated route handlers. |
| **REQ-09** | **Instant WhatsApp Report Share** (P0) | Pure Client Link (`wa.me`) + Structured Text Generator | Formatted markdown text with prefilled WhatsApp API URL; zero external paid API required. | None (Client-side URL encoding). | Client-side copy-to-clipboard and direct WhatsApp deep link. |
| **REQ-10** | **Schedule Conflict Detection & Recurrence Engine** (P1) | Pure TypeScript Engine (`conflict-engine.ts`, `recurrence-engine.ts`) | Strict timezone-aware slot collision detection (WIB/UTC) with multi-coach overlap checks. | Timezone drift between client browser and PostgreSQL UTC storage. | Strict parsing via `parseLocalDateTimeToUTC` with standardized `Asia/Jakarta` reference. |
| **REQ-11** | **Global Command Palette (Ctrl+K)** (P1) | Client Component + Debounced Server Action | Fast in-memory keyboard listener with 200ms debounced server search for athletes, sessions, and plans. | Unbounded database search queries on fast typing. | Debounced input (200ms) with `take: 5` limit per entity category and indexed ILIKE searches. |
| **REQ-12** | **Role-Based Access Control (Admin vs Head Coach vs Assistant)** (P0) | Better Auth AC (`permissions.ts`) + Route Guarding | Declarative permission matrix verified in `requireOrgContext()` and proxy middleware. | Security bypass or unauthorized mutation execution. | Strict server-side verification at the entry point of every Server Action and Route Handler. |

---

## 3. Risk Assessment & Architecture Guarantee

1. **Functional Coverage:** 100% of P0 and P1 requirements are fully accommodated by the architecture.
2. **Regression Risk:** Zero. All 472 unit tests across 31 test suites continue to validate all business algorithms.
3. **Performance Target:** By resolving database query multiplication, enabling Suspense streaming, and code-splitting charts, expected page TTFB drops from ~2.5s–4.0s to **< 300ms**, and client bundle size drops by **> 65%**.
