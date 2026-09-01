# ANTIGRAVITY AI AGENT MASTER OPERATING HANDBOOK

**Project:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Better Auth 1.6 + Prisma 6 + Supabase PostgreSQL 15 + Tailwind CSS v4  
**Date:** September 2026

---

## 1. Active Documents (Current Single Source of Truth)

Before implementing ANY task or code change, you **MUST CONSULT** the active authoritative documents located directly under `docs/`:

1. [`docs/PRD.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PRD.md) — Product requirements, personas, features, and acceptance criteria.
2. [`docs/CLIENT-REVISION.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/CLIENT-REVISION.md) — Client requests and terminology (`REV-001` through `REV-018`).
3. [`docs/ARCHITECTURE.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/ARCHITECTURE.md) — End-to-end 6-layer architecture, boundaries, and subsystem matrix.
4. [`docs/TECHNICAL-SPEC.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/TECHNICAL-SPEC.md) — Frontend, backend, database schema, CTE batching, and API contracts.
5. [`docs/SECURITY.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/SECURITY.md) — Multi-tenant scoping, RBAC, IDOR defense, and CSP.
6. [`docs/PERFORMANCE.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PERFORMANCE.md) — Measured baselines, target constraints, and experiment specs (`EXP-01` to `EXP-05`).
7. [`docs/TESTING.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/TESTING.md) — 472 passing unit tests baseline and Definition of Done (DoD).
8. [`docs/IMPLEMENTATION-PLAN.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/IMPLEMENTATION-PLAN.md) — Approved vs. Proposed implementation roadmap for Phase 2.
9. [`docs/TRACEABILITY.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/TRACEABILITY.md) — End-to-end traceability mapping (`REV` → `REQ` → `TASK` → `TEST`).
10. [`docs/DECISIONS.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/DECISIONS.md) — Architectural Decision Records (`ADR`).

---

## 2. Archive Rule & Restrictions

> [!WARNING]
> **ARCHIVE RULE:** `docs/ARCHIVE/**` is historical reference only.  
> **DO NOT** use archived files as current requirements, architecture, implementation instructions, or performance targets unless explicitly instructed to investigate historical information.

---

## 3. Mandatory AI Workflow Discipline

```
[1. READ .ai/AGENTS.md & CONTEXT]
          │
          ▼
[2. CONSULT AUTHORITATIVE DOCS (PRD, TECHNICAL-SPEC, ARCHITECTURE)]
          │
          ▼
[3. IDENTIFY AFFECTED ARCHITECTURE & RELEVANT REV-ID / REQ-ID]
          │
          ▼
[4. INSPECT ACTUAL EXISTING CODEBASE IMPLEMENTATION]
          │
          ▼
[5. CREATE STEP-BY-STEP IMPLEMENTATION PLAN]
          │
          ▼
[6. IMPLEMENT SMALLEST SAFE SURGICAL CHANGE]
          │
          ▼
[7. RUN TESTS (`npm test`) -> 472/472 PASS]
          │
          ▼
[8. RUN TYPECHECK (`npm run typecheck`) & LINT (`npm run lint`)]
          │
          ▼
[9. RUN BENCHMARK HARNESS (IF QUERY/UI CHANGED)]
          │
          ▼
[10. VALIDATE DEFINITION OF DONE & UPDATE DOCUMENTATION]
          │
          ▼
[11. REPORT MODIFIED FILES & RESIDUAL RISKS]
```

---

## 4. Core Architectural, Security & Coding Guardrails

1. **Strict Multi-Tenant Scoping:** 100% of queries accessing tenant data must include `where: { organizationId }` derived from `requireOrgContext()`.
2. **Server/Client Boundaries:** Server Components handle all DB access and auth. Client Components (`"use client"`) are strictly reserved for interactive leaf nodes, DOM events, and client-only charts.
3. **No Direct UI Database Access:** Never call `prisma.*` inside UI components (`*.tsx`). All database calls must be imported from `src/features/[feature]/queries.ts` or dispatched via `actions.ts`.
4. **Dynamic Chart Splitting:** Never import `echarts` or `echarts-for-react` statically. Always use `next/dynamic` with `{ ssr: false }`.
5. **Consolidated CTE Batching:** Never write N+1 query loops. Use `Promise.all` or consolidated raw SQL CTE queries (`prisma.$queryRaw`) for multi-statistic pages.
6. **Decimal Type Serialization:** Convert Prisma `Decimal` instances to native numbers in query mappers before returning data to Client Components.
7. **Preserve 472 Unit Tests:** Never delete, skip (`.skip`), or weaken tests. Run `npm test` after any business logic change.
8. **No Secrets in Client Code:** Environment variables with server secrets must only be imported in files guarded by `import "server-only"`.

---

## 5. Mandatory Completion Gateway (Definition of Done)

A task is strictly **NOT COMPLETE** until:
- Requirements & acceptance criteria are satisfied.
- All 472 unit tests pass (`npm test`).
- Typecheck passes with 0 errors (`npm run typecheck`).
- Lint passes with 0 violations (`npm run lint`).
- Performance target verified via benchmark when applicable.
- All modified and created files reported with file links.
