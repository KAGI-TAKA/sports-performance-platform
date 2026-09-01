# DEPLOYMENT & INFRASTRUCTURE SPECIFICATION

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**Hosting Platform:** Vercel (Edge / Serverless Node.js 20/24 Runtime)  
**Database Infrastructure:** Supabase PostgreSQL 15 (AWS Singapore `ap-southeast-1`)  
**Date:** September 2026

---

## 1. Build & Runtime Configuration

### 1.1 Scripts Configuration (`package.json`)
- **Build Command:** `npm run build` (`prisma generate && next build`)
- **Start Command:** `npm run start` (`next start`)
- **Development Command:** `npm run dev` (`next dev`)
- **Post-Install Hook:** `npm run postinstall` (`prisma generate`)

### 1.2 Database Connection Architecture
- **Runtime Connection Pooler (`DATABASE_URL`):** Connects to Supabase PgBouncer / Supavisor on **port 6543** with `?pgbouncer=true` to prevent connection exhaustion in serverless environments.
- **Direct Migration URL (`DIRECT_URL`):** Connects directly to PostgreSQL on **port 5432**; used exclusively for executing schema migrations via `npx prisma migrate deploy`.

---

## 2. Environment Variables Specification

| Variable Name | Environment | Required | Purpose |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | Server | YES | Pooled PostgreSQL connection string for Prisma Client (Port 6543). |
| `DIRECT_URL` | Server | YES | Direct PostgreSQL connection string for Prisma Migrations (Port 5432). |
| `BETTER_AUTH_SECRET` | Server | YES | 32-byte secret for signing session HMAC cookies and tokens. |
| `BETTER_AUTH_URL` | Server / Client | YES | Base application URL (e.g. `https://kinetiq.app` or `http://localhost:3000`). |
| `NEXT_PUBLIC_APP_URL` | Client | YES | Public web application URL for shareable links and redirects. |
| `SUPABASE_URL` | Server | YES | Supabase project API URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | YES | Privileged Supabase key for server-side storage and management. |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | YES | Public Supabase API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | YES | Public Supabase anonymous key for public asset CDN access. |
| `RESEND_API_KEY` | Server | OPTIONAL | Transactional email provider key for password reset & invitations. |

---

## 3. Deployment Pipeline & Rollback Strategy

1. **Continuous Deployment:** Merges to `main` trigger automated builds on Vercel:
   - `prisma generate` builds typed Prisma Client.
   - Next.js compiles static assets, server components, and route handlers.
2. **Database Migration Safety:**
   - Production migrations are executed explicitly via `npx prisma migrate deploy`.
   - Destructive migrations (dropping tables/columns) are strictly prohibited.
3. **Instant Rollback:** Vercel deployment history allows instant 1-click rollback to previous build artifacts in case of unforeseen runtime incidents.
