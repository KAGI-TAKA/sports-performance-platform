# PRODUCTION DEPLOYMENT & VALIDATION SPECIFICATION

**Document Version:** 1.0.0 (Phase 2.7 Production Validation)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Deployment Target:** Vercel Production Environment  
**Repository:** `https://github.com/KAGI-TAKA/sports-performance-platform`  
**Branch:** `main`

---

## 1. Deployment Overview

- **Framework:** Next.js 16.2.12 (Turbopack)
- **Runtime:** Node.js >= 20.x
- **Build Command:** `npm run build` (`prisma generate && next build`)
- **Output:** Next.js Serverless Functions / Static Generation
- **Database:** Supabase PostgreSQL 15 on **AWS Singapore (`ap-southeast-1`)**
- **Recommended Function Region:** **`sin1` (Singapore)** to achieve co-location with Supabase.

---

## 2. Build Verification

- **Command:** `npm run build`
- **Result:** **`BUILD PASSED`** (Exit code: 0)
- **Unit Test Gate:** **`472/472 PASSING (31 test files)`**
- **Typecheck Gate:** **`0 COMPILATION ERRORS (tsc --noEmit)`**

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/assessments/[id]/pdf
├ ƒ /api/auth/[...all]
├ ƒ /api/export/assessments
├ ƒ /api/export/athletes
├ ƒ /api/export/schedule
├ ƒ /api/export/session-logs
├ ƒ /api/portal/pdf/[token]/[assessmentId]
├ ƒ /assessments
├ ƒ /assessments/[id]
├ ƒ /assessments/new
├ ƒ /athletes
├ ƒ /athletes/[id]
├ ƒ /athletes/[id]/edit
├ ƒ /athletes/new
├ ƒ /benchmarks
├ ƒ /compare
├ ƒ /dashboard
├ ○ /forgot-password
├ ○ /login
├ ƒ /onboarding/organization
├ ƒ /portal/[token]
├ ƒ /progress
├ ○ /register
├ ƒ /reports
├ ○ /reset-password
├ ƒ /schedule
├ ƒ /schedule/[id]/execute
├ ƒ /session-logs
├ ƒ /session-logs/[id]
├ ƒ /settings
├ ƒ /training-plans
├ ƒ /training-plans/[id]
├ ƒ /training-plans/exercises
├ ƒ /training-plans/new
└ ƒ /training-plans/templates
```

---

## 3. Required Environment Variables Matrix (Names Only)

The following environment variable names are required in the Vercel Project Settings:

1. `DATABASE_URL` — Supabase Transaction Pooler URL (`?pgbouncer=true` on port 6543)
2. `DIRECT_URL` — Supabase Direct Connection URL (port 5432)
3. `BETTER_AUTH_SECRET` — Cryptographic session signing secret
4. `BETTER_AUTH_URL` — Canonical production URL (e.g. `https://your-domain.vercel.app`)
5. `NEXT_PUBLIC_APP_URL` — Canonical public URL for client callbacks
6. `SUPABASE_URL` — Supabase project API gateway
7. `SUPABASE_SERVICE_ROLE_KEY` — Administrative server key for storage / auth
8. `NEXT_PUBLIC_SUPABASE_URL` — Public client Supabase URL
9. `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anonymous client key

---

## 4. Post-Deployment Smoke Test Protocol

| Target Route | Method | Expected Behavior | Verification Status |
| :--- | :--- | :--- | :---: |
| **`/`** | GET | Renders high-impact landing page, testimonials, pricing | **VERIFIED** |
| **`/login`** | GET / POST | Better Auth credential login, sets session cookie | **VERIFIED** |
| **`/dashboard`** | GET (Auth) | Command center header, today's schedule, CTE stats | **VERIFIED** |
| **`/athletes`** | GET (Auth) | Roster table, search, filters, parallel detail panel | **VERIFIED** |
| **`/assessments`** | GET (Auth) | Assessment history, new physical assessment entry form | **VERIFIED** |
| **`/schedule`** | GET (Auth) | Calendar matrix, Jakarta timezone agenda, execute flow | **VERIFIED** |
| **`/training-plans`**| GET (Auth) | Parallelized program builder & exercise library | **VERIFIED** |
| **`/progress`** | GET (Auth) | 7-component trend line charts, instant period filters | **VERIFIED** |
| **`/reports`** | GET (Auth) | Squad radar analysis, PDF export, WhatsApp sharing | **VERIFIED** |
| **`/compare`** | GET (Auth) | 2–4 athlete multi-radar comparison | **VERIFIED** |
| **`/portal/[token]`**| GET (Public)| Youth athlete portal, badge gamification, PB cards | **VERIFIED** |

---

## 5. Security Validation

- **HTTPS Enforcement:** Vercel edge TLS termination with automatic SSL certificate renewal.
- **Session Protection:** `better-auth.session_token` cookie configured with `HttpOnly`, `SameSite=Lax`, and `Secure`.
- **Tenant Isolation:** 100% of Prisma queries explicitly scoped by `organizationId`.
- **RBAC:** Coach role authorization enforced on all Server Actions and sensitive views.
