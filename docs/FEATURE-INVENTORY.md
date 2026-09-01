# COMPREHENSIVE FEATURE INVENTORY

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Feature Inventory Table

| Feature Name | Description | Primary Route | Component / Module | User Roles | Data Source | Database Dependency | Current Status | Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **Public Landing Page** | High-conversion marketing showcase for private conditioning | `/` | `features/public-brand` | Public, Prospective Clients | Static + Config | None | Complete | **KEEP** |
| **Authentication & Session** | Email/Password login, registration, session management | `/login`, `/register`, `/api/auth/*` | `features/auth`, Better Auth | All Roles | Better Auth API | `User`, `Session`, `Account` | Complete | **KEEP** |
| **Password Reset Flow** | Forgot password request, email token dispatch, reset form | `/forgot-password`, `/reset-password` | `features/auth`, Resend / SMTP | All Roles | Token verification | `Verification` | Implemented (Needs SMTP setup) | **KEEP** |
| **Organization Onboarding** | Organization creation & slug generation for new academies | `/onboarding/organization` | `features/onboarding` | Admin | Server Action | `Organization`, `Member` | Complete | **KEEP** |
| **Coach Command Center (Dashboard)** | Operational hub with attention queue, today's schedule, stats | `/dashboard` | `features/dashboard` | Admin, Head Coach, Assistant | Consolidated SQL CTE | `ScheduleSession`, `Athlete`, `Assessment` | Complete | **KEEP** |
| **Athlete Roster Management** | Athlete list, filters, search, sports category, CRUD | `/athletes`, `/athletes/new`, `/athletes/[id]` | `features/athletes` | Admin, Head Coach, Assistant | Server Queries | `Athlete`, `Assessment`, `Goal` | Complete | **KEEP** |
| **Dual Physical Assessment Entry** | Beginner delta vs Elite benchmark assessment capture | `/assessments/new`, `/assessments/[id]` | `features/assessments` | Admin, Head Coach | Server Action / Wizard | `Assessment`, `TestScore`, `TestItem` | Complete (UI Polish needed) | **REWORK** |
| **Assessment Squad Matrix** | High-density grid view of all athlete scores across tests | `/assessments` | `features/assessments` | Admin, Head Coach | Server Query | `Assessment`, `Athlete`, `TestItem` | Complete | **KEEP** |
| **Interactive Calendar Scheduler** | Drag/click session booking with conflict collision warning | `/schedule` | `features/schedule` | Admin, Head Coach, Assistant | Conflict Engine | `ScheduleSession`, `Coach`, `Athlete` | Complete | **KEEP** |
| **Session Field Execution** | Live stopwatch, lap recording, attendance toggling on field | `/schedule/[id]/execute` | `features/session-execution` | Head Coach, Assistant Coach | Local State + Server Action | `ScheduleSession`, `Attendance`, `SessionLog` | Complete | **KEEP** |
| **Training Plan & Workout Builder** | Reusable multi-week workout programs with exercise library | `/training-plans`, `/training-plans/new` | `features/training-plans` | Admin, Head Coach | Server Queries | `TrainingPlan`, `Exercise`, `PlanItem` | Complete | **KEEP** |
| **Exercise Master Library** | Categorized conditioning drills, video links, movement cues | `/training-plans/exercises` | `features/training-plans` | Admin, Head Coach, Assistant | Server Queries | `Exercise` | Complete | **KEEP** |
| **Physical Progress Analytics** | 7-component historical progression charts, period filters | `/progress` | `features/progress` | Admin, Head Coach | ECharts Dynamic Chunk | `Assessment`, `TestScore`, `Athlete` | Complete | **KEEP** |
| **Squad Benchmark Radar** | Multi-athlete spider charts, percentiles, squad distribution | `/reports` | `features/reports` | Admin, Head Coach | ECharts Dynamic Chunk | `Assessment`, `BenchmarkScore` | Complete | **KEEP** |
| **Head-to-Head Athlete Compare** | 2–4 athlete side-by-side radar overlay with metrics | `/compare` | `features/compare` | Admin, Head Coach | ECharts Multi-Radar | `Athlete`, `Assessment`, `TestScore` | Complete | **KEEP** |
| **PDF Assessment Report** | Branded downloadable PDF report for parent consultations | `/api/assessments/[id]/pdf` | `@react-pdf/renderer` | Admin, Head Coach | Route Handler | `Assessment`, `TestScore`, `Athlete` | Complete | **KEEP** |
| **CSV Data Export Hub** | Export full roster, assessments, schedules, session logs | `/api/export/*` | Streamed CSV Generator | Admin, Head Coach | Route Handlers | All Core Tables | Complete | **KEEP** |
| **Youth Athlete & Parent Portal** | Gamified token-based portal with badges, star ratings, PBs | `/portal/[token]` | `features/portal` | Athlete, Parent | Token Hash Query | `PortalAccess`, `Athlete`, `Feedback` | Complete | **KEEP** |
| **Parent Qualitative Feedback** | Parent star ratings and qualitative notes submission | `/portal/[token]`, `/athletes/[id]` | `features/parent-feedback` | Parent, Head Coach | Server Action | `ParentFeedback`, `PortalAccess` | Complete | **KEEP** |
| **Athlete Goal Tracking** | Physical target setting with automated achievement verify | `/athletes/[id]` | `features/athlete-goals` | Head Coach, Athlete | Goal Engine | `AthleteGoal`, `Assessment` | Complete | **KEEP** |
| **Global Command Palette** | Instant keyboard modal search (Ctrl+K) | Global (`CoachShell`) | `features/command-palette` | Admin, Head Coach, Assistant | Debounced Query | All Entities | Complete | **KEEP** |
| **Settings & Component Config** | Club profile, test items, benchmark tables, coach roster | `/settings` | `features/settings` | Admin, Head Coach | Server Action | `Organization`, `TestItem`, `Member` | Functional (Add Test Item Modal needed) | **REWORK** |

---

## 2. Summary Statistics

- **Total Registered Features:** 22 Major Modules
- **Features to KEEP:** 20 (90.9%)
- **Features to REWORK (UI Refinement):** 2 (9.1%)
  - Dual Assessment Form Wizard (`/assessments/new`)
  - Settings Custom Component / Test Item Management Modal (`/settings`)
- **Features to REMOVE / DEPRECATE:** 0 (0%)
