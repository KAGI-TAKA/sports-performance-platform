# COMPREHENSIVE ROUTE & PAGE AUDIT

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Route Audit Matrix

| Route Pattern | Purpose | User Roles | Required by Client? | Current Status | Reachable? | Nav Entry? | Protected? | Action |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`/`** | Public landing page, program showcase, pricing | Public | YES | Operational | YES | Direct | Public | **KEEP** |
| **`/login`** | Email/Password login entry point | Public | YES | Operational | YES | Header Link | Public | **KEEP** |
| **`/register`** | Coach registration & academy creation | Public | YES | Operational | YES | Header CTA | Public | **KEEP** |
| **`/forgot-password`**| Password reset request initiation | Public | YES | Operational | YES | Login Link | Public | **KEEP** |
| **`/reset-password`** | Set new password with secure token | Public | YES | Operational | YES | Email Link | Token Verify | **KEEP** |
| **`/onboarding/organization`** | Initial organization profile setup | Admin | YES | Operational | YES | Post-Register| Authenticated | **KEEP** |
| **`/dashboard`** | Command center operational overview | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/athletes`** | Athlete directory, search, sport filters | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/athletes/new`** | Register new youth athlete profile | Admin, Coaches | YES | Operational | YES | Action Button| Authenticated | **KEEP** |
| **`/athletes/[id]`** | Athlete 360 profile, goals, feedback | Admin, Coaches | YES | Operational | YES | Table Click | Authenticated | **KEEP** |
| **`/athletes/[id]/edit`**| Modify athlete biodata and sport details | Admin, Coaches | YES | Operational | YES | Profile Button| Authenticated | **KEEP** |
| **`/assessments`** | Historical physical assessments list | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/assessments/new`**| Enter new physical test scores (Dual) | Admin, Coaches | YES | Operational | YES | Action Button| Authenticated | **REWORK** |
| **`/assessments/[id]`** | Detailed assessment score breakdown | Admin, Coaches | YES | Operational | YES | Table Click | Authenticated | **KEEP** |
| **`/schedule`** | Visual weekly/monthly session calendar | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/schedule/[id]/execute`**| Live session stopwatch & attendance | Coaches | YES | Operational | YES | Schedule Card| Authenticated | **KEEP** |
| **`/training-plans`** | Multi-week training program templates | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/training-plans/new`**| Create custom workout plan | Admin, Coaches | YES | Operational | YES | Action Button| Authenticated | **KEEP** |
| **`/training-plans/[id]`**| Detailed workout program view | Admin, Coaches | YES | Operational | YES | Card Click | Authenticated | **KEEP** |
| **`/training-plans/exercises`**| Master exercise catalog & cues | Admin, Coaches | YES | Operational | YES | Tab Link | Authenticated | **KEEP** |
| **`/training-plans/templates`**| Academy standard workout templates | Admin, Coaches | YES | Operational | YES | Tab Link | Authenticated | **KEEP** |
| **`/progress`** | 7-component physical analytics charts | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/reports`** | Squad benchmark radar, PDF export | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/compare`** | 2–4 athlete physical comparison | Admin, Coaches | YES | Operational | YES | Sidebar | Authenticated | **KEEP** |
| **`/benchmarks`** | Normative benchmark reference tables | Admin, Coaches | YES | Operational | YES | Sidebar Link | Authenticated | **KEEP** |
| **`/session-logs`** | Field workout history & attendance log | Admin, Coaches | YES | Operational | YES | Sidebar Link | Authenticated | **KEEP** |
| **`/session-logs/[id]`**| Detailed field log notes & records | Admin, Coaches | YES | Operational | YES | Table Click | Authenticated | **KEEP** |
| **`/settings`** | Academy profile, test items, members | Admin | YES | Operational | YES | Sidebar Footer| Authenticated (Admin) | **REWORK** |
| **`/portal/[token]`** | Youth athlete gamified portal | Athlete, Parent | YES | Operational | YES | Direct Token | Token Guarded | **KEEP** |
| **`/api/assessments/[id]/pdf`** | Streamed PDF assessment report | Admin, Coaches | YES | Operational | YES | Direct Download| Authenticated | **KEEP** |
| **`/api/portal/pdf/[token]/[assessmentId]`**| Streamed PDF for parents | Parent, Athlete | YES | Operational | YES | Direct Download| Token Guarded | **KEEP** |
| **`/api/export/*`** | CSV export endpoints for all data | Admin, Coaches | YES | Operational | YES | Direct Download| Authenticated | **KEEP** |
| **`/api/auth/[...all]`**| Better Auth authentication handler | All | YES | Operational | YES | API Call | Public / Internal | **KEEP** |

---

## 2. Route Categorization & Summary

- **Total Active Application Routes:** 33 Routes
- **Public Routes:** 5 (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`)
- **Portal & Shared Routes:** 2 (`/portal/[token]`, `/api/portal/pdf/*`)
- **Authenticated Coach / Admin Routes:** 22
- **API & Export Stream Routes:** 4 (`/api/export/*`, `/api/assessments/[id]/pdf`, `/api/auth/[...all]`)
- **Routes to Keep:** 31 (93.9%)
- **Routes to Rework (Enhance UI):** 2 (6.1% — `/assessments/new`, `/settings`)
- **Unreachable / Orphan Routes Detected:** 0 (0%)
