# CLIENT REVISION & PRODUCT REQUIREMENT REGISTRY

**Document Version:** 1.0.0  
**Status:** Validated Single Source of Truth  
**Project:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit & Extraction Date:** September 2026

---

## 1. Executive Summary

This document captures every explicit requirement, feedback item, and architectural directive from the primary product documents (`WEBSITE REVISION` / `phase-2-product-blueprint.md` / `handover_report.md`). Each item is assigned a unique `REV-ID` for end-to-end traceability across the PRD, Architecture, Implementation Plan, and Test Suites.

---

## 2. Master Client Revision Registry

| REV-ID | Category | Original Client Requirement | Affected Feature / Page | Current Behavior | Requested Target Behavior | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **REV-001** | BUSINESS LOGIC | **Dual Assessment Paradigm**: Split physical testing into (1) Beginner / Progress-Based (pre-test vs post-test delta) and (2) Elite / Benchmark-Based (threshold grading A/B/C/D). | `/assessments`, `/assessments/new` | Engine supports both, but form wizard lacked clear category switch. | Wizard provides explicit 2-tier selection with contextual input modes. | **P0** | **ENGINE READY / UI POLISH** |
| **REV-002** | FUNCTIONAL | **Configurable Physical Components & Test Items**: Coach must be able to customize physical components (Speed, Power, Agility, Flexibility, Endurance) and define custom test items with units and directions. | `/settings`, `/assessments`, `TestItem` | Database has `AssessmentComponent` and `TestItem` tables. | Dynamic component ordering, custom item creation, and active/inactive toggling. | **P0** | **SCHEMA & ENGINE VERIFIED** |
| **REV-003** | CONTENT & UX | **Sports Performance Neutrality (Deprecate Basketball Lock-in)**: Generalize all UI terminology from basketball-specific terms (e.g. Point Guard, Jersey #) to general multi-sport youth conditioning. | `/athletes`, `/compare`, `/reports` | `position` defaulted to `UNSPECIFIED`; `jerseyNumber` and `wingspanCm` made optional. | Multi-sport category selector (Basket, Sepak Bola, Badminton, Futsal, Atletik) and neutral athletic metrics. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-004** | UX/UI | **Youthful Sports Performance Aesthetic for Athlete Portal**: Athlete portal must feel aspirational, visual, sporty, and empowering for kids age 6–14 without feeling like preschool cartoon software. | `/portal/[token]` | Pure clean card UI with star ratings, milestone badges, personal bests, and video review. | High-energy dark/light sporty theme, touch target min 48px, badges, and progress milestones. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-005** | SECURITY | **Secure Lightweight Token Access for Parents & Athletes**: Access to athlete portal must work seamlessly via secure token link (SHA-256 hash) without requiring email/password registration. | `/portal/[token]`, `PortalAccess` | Token hash lookup with expiry and revocation verification. | Direct token link + optional credential access; zero Better Auth session overhead. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-006** | FUNCTIONAL | **One-Click Professional PDF Report Generation**: Coach must be able to export a clean, branded PDF report showing physical radar, scores, and 6–8 week coach recommendations. | `/reports`, `/api/assessments/[id]/pdf` | `@react-pdf/renderer` generates standardized PDF streamed via route handler. | 1-click download with consistent print styling and automatic metric explanations for parents. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-007** | FUNCTIONAL | **Instant WhatsApp Report Share**: Coach must be able to generate and share a concise, structured progress report directly to parents via WhatsApp in 1 click. | `/reports`, `/portal` | Client-side `wa.me` deep link generator with preformatted markdown text. | Instant copy and WhatsApp launch without external paid API dependencies. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-008** | FUNCTIONAL | **Schedule Conflict Detection & Jakarta Timezone Alignment**: Multi-coach session scheduler must detect overlapping timeslots and strictly adhere to `Asia/Jakarta` (WIB) timezone. | `/schedule`, `conflict-engine.ts` | Conflict engine and recurrence engine implemented with 31 passing unit tests. | Timezone-aware slot collision detection, recurring preview modal, and clone schedule wizard. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-009** | BUSINESS LOGIC | **Training Plan vs Schedule vs Session Log Lifecycle**: Clear separation between reusable Program Templates (`TrainingPlan`), Field Appointments (`ScheduleSession`), and Daily Logs (`SessionLog`). | `/training-plans`, `/schedule`, `/session-logs` | Discrete models connected via foreign keys and attendance tracking. | Uncompleted past sessions flag operational warnings on dashboard; quick log creation from completed sessions. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-010** | PERFORMANCE | **Eliminate Website Slowness (Target TTFB < 150ms)**: Website must respond instantaneously without lag or spinning freezes on field mobile devices. | Global, `/dashboard`, `/athletes` | Measured baseline = 1,067ms TTFB caused by 22 unaggregated DB queries. | Consolidate queries into CTE batching, enable `<Suspense>` streaming, and code-split ECharts. | **P0** | **PHASE 0.5 VALIDATED** |
| **REV-011** | FUNCTIONAL | **Operational Attention & Re-Test Intelligence on Dashboard**: Dashboard must prioritize daily field actions: today's sessions, unlogged workouts, active injuries, and overdue physical re-tests. | `/dashboard` | Command center header, Level 1 Attention items, today sessions, and re-test widget. | Parallelized intelligence queries with resilient fallback cards. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-012** | FUNCTIONAL | **Parent Feedback & Star Rating**: Parents must be able to submit qualitative feedback and star ratings following training milestones. | `/portal/[token]`, `ParentFeedback` | 5-star rating picker and feedback dialog with coach response feed. | Direct submission from portal with automatic coach notification. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-013** | FUNCTIONAL | **Athlete Goal Setting & Target Tracking**: Head Coach can prescribe physical milestone targets (e.g. Sprint 20m < 3.2s) with target dates and achievement verification. | `/athletes/[id]`, `AthleteGoal` | Goal creation wizard with automatic status transition (`ACHIEVED` when assessment qualifies). | Goal display on coach dashboard and athlete portal card. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-014** | FUNCTIONAL | **Global Command Palette (Ctrl+K)**: Instant keyboard-driven navigation across athletes, sessions, plans, and rapid actions. | Global (`CoachShell`) | Debounced 200ms server search with recent history and keyboard arrow navigation. | Instant modal popover with fuzzy multi-category entity matching. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-015** | FUNCTIONAL | **CSV Data Export Hub**: Export athlete rosters, session history, logs, and assessment records for offline backup. | `/api/export/*` | Streamed CSV route handlers with UTF-8 BOM encoding. | 1-click download of all organizational datasets. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-016** | SECURITY | **Multi-Tenant Organization Isolation**: Strict tenant scoping where coaches and athletes cannot view or mutate cross-organization records. | Global (`auth-context.ts`, Prisma) | Indexed `organizationId` filtering and Better Auth RBAC permissions. | Strict verification at every Server Action and Route Handler entry point. | **P0** | **VERIFIED IMPLEMENTED** |
| **REV-017** | UX/UI | **Field Stopwatch & Attendance Checklist**: Mobile-friendly stopwatch and rapid attendance toggle for coaches active on the field. | `/schedule/[id]/execute` | `field-stopwatch.tsx` and `attendance-checklist-section.tsx`. | Large 48px touch targets, lap counters, and instant attendance status commit. | **P1** | **VERIFIED IMPLEMENTED** |
| **REV-018** | PERFORMANCE | **Eliminate Client Component Decimal Serialization Warnings**: Fix React SSR warnings when passing Prisma Decimal types to Client Components. | `/compare`, `/reports` | Decimal objects converted to strings/numbers during render. | Explicit number mapping in server query layer. | **P1** | **PLANNED EXP-05** |

---

## 3. Revision Priority Breakdown

- **Total Documented Revisions:** 18
- **Priority 0 (Critical P0):** 8 Revisions (`REV-001`, `REV-002`, `REV-003`, `REV-004`, `REV-005`, `REV-006`, `REV-008`, `REV-010`, `REV-016`)
- **Priority 1 (Important P1):** 10 Revisions (`REV-007`, `REV-009`, `REV-011`, `REV-012`, `REV-013`, `REV-014`, `REV-015`, `REV-017`, `REV-018`)
