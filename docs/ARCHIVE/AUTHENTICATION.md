# AUTHENTICATION & MULTI-TENANT AUTHORIZATION SPECIFICATION

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**Authentication Engine:** Better Auth 1.6.25 (Prisma PostgreSQL Adapter + Organization Plugin)  
**Date:** September 2026

---

## 1. Authentication Architecture & Flow

```
[Client Browser]
       │
       ▼ (Sends HTTP Request with Cookie: better-auth.session_token=<token>.<hmac>)
[Proxy / Middleware (src/proxy.ts)]
       │
       ├─► Is Public Route? (/, /login, /register, /forgot-password, /api/auth/*) -> Next()
       │
       └─► Is Private Route? (/(app)/*, /dashboard, /athletes, /schedule, etc.)
             ├── Check getSessionCookie() -> If missing -> Redirect to /login
             └── Forward request with header `x-pathname`
                   │
                   ▼
[Server Component / Server Action (`requireOrgContext()` in `src/lib/auth-context.ts`)]
       ├── 1. auth.api.getSession({ headers }) -> Verifies HMAC & DB Session record
       ├── 2. Resolve activeOrganizationId (fallback to first member record)
       └── 3. Indexed lookup: prisma.member.findUnique({ organizationId_userId })
             └── Returns OrgContext: { userId, memberId, organizationId, role, name, email }
```

---

## 2. Roles & Permissions Structure

Roles are defined in `src/lib/permissions.ts` using the Better Auth Access Control (`ac`) schema:

### 2.1 Role Matrix
1. **`admin` (Organization Head / Owner):**
   - Full control over organization settings, logo, name.
   - Invite, assign, and remove members/coaches.
   - Full CRUD over athletes, assessments, benchmarks, plans, schedules, and logs.
2. **`head_coach` (Senior Strength & Conditioning Specialist):**
   - Full CRUD over athletes, physical assessments, benchmark thresholds, training plans, and schedules.
   - Generate and distribute reports to parents.
   - Issue portal access tokens.
3. **`assistant_coach` (Field Trainer):**
   - Read-only access to master data (benchmarks, organization settings).
   - Create and input physical assessment raw scores.
   - Conduct sessions, run stopwatch, and mark field attendance.
   - Fill and submit daily workout `SessionLog` entries.

---

## 3. Portal Token Authentication (`PortalAccess`)

- **Purpose:** Provide secure, passwordless access to athlete and parent portals (`/portal/[token]`).
- **Mechanism:**
  1. A random 32-byte cryptographic token is generated on the server.
  2. The SHA-256 hash of the token is stored in `portal_access.tokenHash`.
  3. When an athlete/parent visits `/portal/[token]`, the server hashes `token` and performs an O(1) indexed database query.
  4. Access is granted if:
     - `revokedAt IS NULL`
     - `expiresAt > now()`
- **Zero Overhead:** Does not require Better Auth session creation or cookies; completely isolated from the coach session database.

---

## 4. Auth Query Performance Optimization

### The Baseline Overhead (Measured in Phase 0.5):
On every page load, `requireOrgContext()` executes two sequential database queries:
1. `Session.findFirst` (152ms)
2. `Member.findUnique` (150ms)
- **Total Auth DB Latency:** **~302ms–328ms baseline** before any page query starts.

### Target Optimization:
1. Wrap `requireOrgContext()` in `React.cache()` for intra-request memoization (eliminating duplicate calls between `layout.tsx` and `page.tsx`).
2. Add a lightweight request/short-lived in-memory session cache (TTL: 30s) keyed by session token hash to eliminate the 300ms DB hop on repeat navigations.
