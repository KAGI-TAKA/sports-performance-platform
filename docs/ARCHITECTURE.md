# END-TO-END SYSTEM ARCHITECTURE SPECIFICATION

**Document Version:** 2.0.0 (Consolidated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Better Auth + Prisma + Supabase PostgreSQL  
**Date:** September 2026

---

## 1. Complete End-to-End System Layers

```
[USER] (Coach / Athlete / Parent)
  │
  ▼ (HTTPS: TLS 1.3 / HTTP/2)
[BROWSER LAYER] (Mobile PWA / Desktop)
  ├── UI Design System: Tailwind CSS v4 + Base-UI / Radix Primitives + Lucide Icons
  └── Data Visualizations: ECharts (Dynamically code-split via next/dynamic)
  │
  ▼
[NEXT.JS 16 ENGINE] (App Router, Turbopack, Edge/Serverless Runtime)
  ├── 1. Proxy Middleware (`src/proxy.ts`): Pathname injection & session cookie presence check
  ├── 2. Root Layout & Security Headers (`next.config.ts`: CSP, HSTS, X-Frame-Options)
  └── 3. Streaming Server Components (<Suspense>) for Instant Shell FCP (<80ms)
        │
        ├──► [AUTHENTICATION LAYER] (Better Auth + requireOrgContext)
        │      └── Validates HMAC Session Cookie -> Injects { userId, memberId, organizationId, role }
        │
        ├──► [APPLICATION DOMAIN ENGINES] (Pure Deterministic TypeScript)
        │      ├── Physical Assessment Engine (`src/features/assessments/engine.ts`)
        │      ├── Schedule Collision & Recurrence Engine (`src/features/schedule/*-engine.ts`)
        │      ├── Coaching Intelligence & Workload Aggregator (`src/features/coaching-intelligence/`)
        │      ├── Portal Achievements & Gamification (`src/features/portal/achievements.ts`)
        │      └── Streamed PDF Report Engine (`@react-pdf/renderer`)
        │
        └──► [DATA ACCESS LAYER] (Prisma 6 Client + SQL CTE Batching)
               │
               ▼ (TCP / TLS Connection Pooler, Port 6543)
[SUPABASE POSTGRESQL] (PostgreSQL 15 on AWS Singapore `ap-southeast-1`)
  ├── Multi-tenant organization scoping `[organizationId]`
  ├── Compound unique indexes (e.g. `member(organizationId, userId)`)
  └── Foreign key cascade deletions on parent organization/athlete
        │
        ▼ (Asynchronous Outbound Triggers)
[EXTERNAL INTEGRATIONS]
  ├── Resend (Transactional Password Reset & Team Invites)
  ├── WhatsApp Protocol (`wa.me` Preformatted Markdown Links)
  └── Supabase Storage (Athlete Avatars & Media Assets)
```

---

## 2. Layer Responsibilities & Boundaries

| Layer | Primary Responsibility | Key Inputs | Key Outputs | Performance Constraint |
| :--- | :--- | :--- | :--- | :---: |
| **1. Browser** | Render UI, capture touch/key events (`Ctrl+K`), run interactive charts | User interactions | DOM events, Server Action dispatches | Initial JS < 500KB; Hydration < 80ms |
| **2. Next.js Engine** | Route matching, cookie validation, Server Component streaming | HTTP Requests | Streamed HTML chunks, RSC flight data | Framework overhead < 15ms |
| **3. Auth & Context** | Verify user session, resolve tenant ID, enforce RBAC permissions | Session Cookie | `OrgContext` object | Cached execution < 5ms |
| **4. Domain Engines** | Pure deterministic scoring, conflict detection, recurrence calculations | Zod parsed payloads | Scoring deltas, grades, validation flags | In-memory execution < 5ms |
| **5. Data Access** | Database mutations, consolidated batch queries, transaction commits | Prisma queries, CTEs | Typed JSON models, record rows | DB wait < 45ms per query |
| **6. External Services** | Transactional emails, WhatsApp deep links, media storage | Email payloads, blobs | Delivery receipts, public CDN URLs | Non-blocking async execution |

---

## 3. Subsystem Classification & Architecture Modernization Matrix

| Subsystem / Module | Current Role | Decision | Target Architecture |
| :--- | :--- | :---: | :--- |
| **Assessment Scoring Engine** (`assessments/engine.ts`) | Calculates test scores, percentiles, delta %, radar values | **KEEP** | 100% Preserved in place (validated by 24 unit tests). |
| **Schedule Conflict & Recurrence** (`schedule/*-engine.ts`) | Collision detection and recurrence expansions | **KEEP** | 100% Preserved in place (validated by 58 unit tests). |
| **Portal Achievements Engine** (`portal/achievements.ts`) | Star ratings, badges, and personal bests | **KEEP** | 100% Preserved in place (validated by 20 unit tests). |
| **Database Schema & Migrations** (`prisma/schema.prisma`) | PostgreSQL schema with 7 migrations | **KEEP** | 100% Preserved in place (100% backward compatible). |
| **Better Auth Core Adapter** (`src/lib/auth.ts`, `permissions.ts`) | Session verification, roles, rate limiting | **KEEP** | 100% Preserved in place. |
| **Dashboard Query Layer** (`dashboard/queries.ts`) | 12 separate Prisma queries in `Promise.all` | **REFACTOR** | Single consolidated CTE query (`EXP-01`) via `prisma.$queryRaw`. |
| **Dashboard Page Rendering** (`dashboard/page.tsx`) | Monolithic async Server Component | **REFACTOR** | Wrap secondary widgets in React 19 `<Suspense>` (`EXP-02`). |
| **Client Chart Components** (`radar-chart.tsx`, `progress-line-chart.tsx`) | ECharts canvas chart rendering | **REFACTOR** | Dynamically code-split via `next/dynamic` (`EXP-03`). |
| **Auth Context Lookup** (`src/lib/auth-context.ts`) | 2 sequential DB lookups per request | **REFACTOR** | Request-scoped memoization via `React.cache()` (`EXP-04`). |
| **Decimal Type Serialization** (`queries.ts`) | Passes Prisma Decimal instances to client | **REFACTOR** | Convert to JavaScript `number` in query mappers (`EXP-05`). |
| **Legacy Basketball Position Constraints** | Required basketball positions | **REMOVE** | Replaced with neutral `sportCategory` string (REV-003). |
