# SYSTEM REFACTOR & MODERNIZATION MATRIX

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Date:** September 2026

---

## 1. Subsystem Classification Matrix

| Subsystem / Module | Current Role | Decision | Target Implementation | Technical Reason | Dependency | Risk |
| :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **Physical Assessment Scoring Engine** (`src/features/assessments/engine.ts`) | Calculates test percentiles, delta %, radar values | **KEEP** | Preserved in place | Pure deterministic TypeScript logic with 100% test coverage (24 unit tests). Zero defect. | None | Zero |
| **Schedule Conflict & Recurrence Engine** (`src/features/schedule/*-engine.ts`) | Conflict collision & weekly recurrence expansions | **KEEP** | Preserved in place | Timezone-aware engine with 58 passing unit tests. Zero defect. | Date utils | Zero |
| **Portal Achievements & Gamification** (`src/features/portal/achievements.ts`) | Calculates star badges & personal bests | **KEEP** | Preserved in place | Validated youth gamification engine with 20 passing unit tests. | Pure TS | Zero |
| **Database Schema & Migrations** (`prisma/schema.prisma`) | PostgreSQL database schema (7 migrations) | **KEEP** | Preserved in place | Normalized schema with foreign keys, indexes, and cascades. Zero schema rewrite needed. | Supabase PG | Zero |
| **Better Auth Adapter & Roles** (`src/lib/auth.ts`, `permissions.ts`) | User authentication & RBAC matrix | **KEEP** | Preserved in place | Secure, multi-tenant session adapter with rate limiting. | Prisma | Zero |
| **Dashboard Query Layer** (`src/features/dashboard/queries.ts`) | 12 separate Prisma queries in `Promise.all` | **REFACTOR** | Single consolidated CTE query (`prisma.$queryRaw`) | Eliminates 12 remote network roundtrips, reducing DB latency from 880ms to < 40ms. | Postgres Pooler| Low |
| **Dashboard Page Rendering** (`src/app/(app)/dashboard/page.tsx`) | Monolithic async Server Component | **REFACTOR** | Streaming React 19 `<Suspense>` boundaries | Allows instant shell render (<80ms) while widgets stream asynchronously. | React 19 | Very Low |
| **Client Chart Components** (`radar-chart.tsx`, `progress-line-chart.tsx`) | Renders canvas charts via ECharts | **REFACTOR** | Lazy dynamic import via `next/dynamic(..., { ssr: false })` | Removes 1.1MB monolithic JS from initial client bundle; eliminates mobile hydration lock. | ECharts | Very Low |
| **Auth Context Lookup** (`src/lib/auth-context.ts`) | `requireOrgContext()` executes 2 DB lookups per req | **REFACTOR** | Request-scoped & short-lived session memoization | Saves ~328ms baseline latency on every dynamic page load. | React.cache | Low |
| **Query Decimal Serialization** (`queries.ts` across features) | Passes Prisma `Decimal` instances to Client Components | **REFACTOR** | Explicit number mapping in return mappers | Eliminates Next.js SSR serialization console warnings. | TypeScript | Zero |
| **Legacy Basketball Position Constraints** (`AthletePosition`) | Required basketball position fields | **REMOVE** | Replaced with neutral `sportCategory` string | Platform generalized for all sports (REV-003). | Athlete Profile| Zero |
