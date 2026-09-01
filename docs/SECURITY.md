# SYSTEM SECURITY SPECIFICATION & GUARDRAILS

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Multi-Tenant Isolation & IDOR Defense

### 1.1 Tenant Scoping Rules
Every single database query or mutation that reads or modifies tenant data **MUST** filter by `organizationId`:
```typescript
// SECURE PATTERN
const athlete = await prisma.athlete.findFirst({
  where: {
    id: athleteId,
    organizationId: ctx.organizationId, // Mandatory tenant guard
  },
});
if (!athlete) throw new Error("Akses ditolak atau data tidak ditemukan.");
```
- **Insecure (Prohibited) Pattern:** `prisma.athlete.findUnique({ where: { id } })` without checking `organizationId` is strictly forbidden because it allows Insecure Direct Object References (IDOR).

---

## 2. Input Validation & Injection Defenses

### 2.1 100% Zod Payload Validation
- Every Next.js Server Action and API Route Handler must parse all incoming data through a strict Zod schema before processing:
  ```typescript
  const parsed = createAthleteSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  ```
- Strips unwhitelisted fields, rejects malformed types, and validates boundary constraints (e.g. `heightCm > 50 && heightCm < 250`).

### 2.2 SQL Injection Defense
- Primary queries use Prisma ORM with parameterized queries.
- Raw SQL aggregations (e.g. in `EXP-01` CTE batching) **MUST ALWAYS** use Prisma's tagged template literal `prisma.$queryRaw` with positional parameters `$1, $2, ...` to ensure 100% parameter sanitization. String concatenation in SQL statements is strictly forbidden.

---

## 3. Session & Cookie Security

- **Session Signing:** Cookies are signed with HMAC-SHA256 using `BETTER_AUTH_SECRET`. Tampered cookies are instantly rejected.
- **Cookie Attributes:**
  - `HttpOnly: true` (Prevents client-side script access).
  - `SameSite: Lax` (Defends against Cross-Site Request Forgery / CSRF).
  - `Secure: true` in production (Transmitted strictly over HTTPS).
- **CSRF Defense on Server Actions:** Next.js Server Actions automatically verify the `Origin` and `Host` request headers on all POST submissions.

---

## 4. HTTP Security Headers & CSP

Implemented in `next.config.ts`:
- **Content-Security-Policy (CSP):**
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: blob: https://*.supabase.co`
  - `connect-src 'self' https://*.supabase.co`
  - `worker-src 'self' blob:` (Whitelisted for `@react-pdf/renderer` worker engine)
  - `frame-ancestors 'none'` (Prevents clickjacking attacks)
- **X-Frame-Options:** `DENY`
- **X-Content-Type-Options:** `nosniff`
- **Strict-Transport-Security (HSTS):** `max-age=31536000; includeSubDomains` in production.
- **Referrer-Policy:** `origin-when-cross-origin`.

---

## 5. Rate Limiting & Abuse Prevention

Better Auth rate limiter is enforced on sensitive endpoints:
- Global limit: 100 requests / 60 seconds.
- `/sign-in/email`: 5 failed attempts / 5 minutes window.
- `/forget-password` & `/request-password-reset`: 3 requests / 15 minutes window.
- `/reset-password`: 5 attempts / 15 minutes window.

---

## 6. Secrets & Environment Variables Management

- Secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are managed exclusively in `.env.local` / Vercel Secrets.
- Secrets are imported strictly via `src/lib/env.server.ts` with `server-only` guards.
- Client-exposed variables are limited to `NEXT_PUBLIC_*` (e.g. `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`).
