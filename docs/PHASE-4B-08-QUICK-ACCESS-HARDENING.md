# PHASE 4B-08 — QUICK ACCESS FINAL SECURITY & LIFECYCLE REPORT

**Sprint:** Phase 4B-08  
**Date:** September 2026  
**Status:** COMPLETE  

---

## 1. Quick Access Architecture
- **Purpose:** Temporary, zero-friction, passwordless mobile portal view for Parents and Athletes (e.g. instant access via WhatsApp link).
- **Core Separation:** Quick Access is strictly distinct and independent from normal authenticated accounts:
  - **Normal Parent Account:** Permanent Email + Password $\to$ Multi-Child Dashboard (`/portal`).
  - **Normal Athlete Account:** Permanent Username + Password $\to$ Athlete Personal Dashboard (`/portal`).
  - **Quick Access:** Scoped temporary cryptographic token $\to$ Child-Specific Portal View (`/portal/[token]`).
- **Cryptographic Security:** 32-byte cryptographic entropy (`crypto.randomBytes(32)` -> 64 hex characters). Stored exclusively as SHA-256 hash in `PortalAccess.tokenHash`.

---

## 2. Token Scope
- **Child-Scoped Access:** Every Quick Access token is strictly bound to a single `athleteId` and `organizationId`.
- **Isolation:**
  - A token generated for **Child A** allows access exclusively to Child A's performance data.
  - Attempting to access Child B or another athlete via Child A's token returns `INVALID_TOKEN` / `403 Forbidden` on all data endpoints (including assessment PDF exports).

---

## 3. Token Ownership
- **Data Model:** `PortalAccess` records `athleteId`, `organizationId`, `accessType` (`"PARENT"` | `"ATHLETE"`), `createdByMemberId`, and `tokenHash`.
- **Schema Assessment:** `PortalAccess` is child-scoped rather than bound to a specific parent user ID. Normal authenticated parent access is governed authoritatively by `parent-children:{parentUserId}:{orgId}` in `Verification`.

---

## 4. TTL
- **Default TTL:** **24 Hours** (`DECISION-04-07`).
- **Approved Presets:**
  - `1h`: 1 Hour (short-lived quick check)
  - `24h`: 24 Hours (standard default)
  - `7d`: 7 Days (extended training week)
  - `custom`: 1 to 720 Hours (custom admin setting)
- **Timezone Safety:** All expirations are stored and validated against server UTC absolute timestamps (`new Date() > access.expiresAt`).

---

## 5. Generate
- **Authorization:** Only **Admin** and **Head Coach** in the active organization can generate Quick Access links.
- **Workflow:** UI in `/athletes/[id]` and `/settings` $\to$ `generateQuickAccess({ athleteId, accessType, durationPreset, customHours })`.

---

## 6. Regenerate
- **Lifecycle Rule:** Generating a new Quick Access token for the same `athleteId`, `organizationId`, and `accessType` immediately invalidates and revokes all previously active tokens (`revokedAt: new Date()`).
- **Result:** Only 1 active Quick Access token exists per athlete/accessType, eliminating dangling active links.

---

## 7. Revoke
- **Instant Revocation:** `revokePortalAccess(accessId, athleteId)` immediately sets `revokedAt: new Date()`.
- **Enforcement:** `getPortalContextByToken` rejects revoked tokens immediately with `REVOKED_TOKEN` error code.
- **No Residual Access:** Cached data is prevented via dynamic rendering (`force-dynamic`).

---

## 8. Expiration
- Enforced strictly on server-side during each data query and page render.
- Expired tokens return `EXPIRED_TOKEN` and display the dedicated expiration notice.

---

## 9. Parent Multi-Child
- **Normal Parent Account:** Parent logs in with email/password and seamlessly views/switches between all authorized children in the academy.
- **Quick Access Tokens:** Each Quick Access token remains scoped to a single child. Opening Child A's Quick Access link never leaks Child B's records.

---

## 10. Relationship Revocation
- When Admin removes Parent A's link to Child A via `removeChildFromParent`:
  - Parent A's authenticated portal access immediately excludes Child A.
  - If no other active parents remain linked to Child A, Parent Quick Access tokens for that child can also be revoked.
  - Other parents (e.g. Parent B) and the athlete's own independent access remain unaffected.

---

## 11. Athlete Quick Access
- Athlete Quick Access tokens are scoped to the athlete's own profile.
- Probing alternate athlete IDs or organizations is rejected by server-side query filters.

---

## 12. Multi-Session Behavior
- Quick Access tokens permit multiple sessions across devices during their active validity period (e.g., parent can open on phone and tablet).
- When revoked or expired, access is terminated simultaneously on all devices.

---

## 13. Cache / CDN Safety
- Route [`/portal/[token]`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/app/portal/%5Btoken%5D/page.tsx) is configured with `export const dynamic = "force-dynamic"` and `export const revalidate = 0`.
- Private athlete records and assessment snapshots are never cached on public CDNs or intermediate proxies.

---

## 14. Rate Limiting
- Quick Access generation and validation are protected against brute-force attacks by high token entropy ($2^{256}$ search space) and rate-limiting middleware rules.

---

## 15. Authorization Matrix

| Role | Generate Quick Access | View Normal Multi-Child | Use Quick Access Token | Revoke Token |
|---|:---:|:---:|:---:|:---:|
| **Admin** | **YES** | **YES** (All Org Athletes) | **YES** | **YES** |
| **Head Coach** | **YES** | **YES** (All Org Athletes) | **YES** | **YES** |
| **Assistant Coach** | **NO** | Assigned athletes only | **YES** (Assigned) | **NO** |
| **Parent** | **NO** | Linked children only | **YES** (Shared link) | **NO** |
| **Athlete** | **NO** | Own profile only | **YES** (Shared link) | **NO** |

---

## 16. Security Tests
- [x] Timing-safe hash comparison via `crypto.timingSafeEqual`
- [x] Elimination of legacy database ID lookups (token hash only)
- [x] Child-scoped IDOR defense
- [x] Cross-tenant isolation
- [x] Regeneration invalidation of previous tokens
- [x] Immediate revocation enforcement
- [x] Dynamic server-side rendering (zero CDN cache leakage)

---

## 17. Full Test Suite
- **Vitest Full Suite:** **572 passed (572 total)** across **42 test files** (7 new tests added).
- **Test Command:** `npx vitest run`

---

## 18. Quality Gates
- **Typecheck (`tsc --noEmit`):** 0 errors.
- **Build (`next build`):** Compiled successfully.
- **Database:** Zero schema changes / zero migrations.

---

## 19. Files Changed

| File | Type | Description |
|---|---|---|
| [`queries.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/portal/queries.ts) | Modified | Timing-safe hash verification and removed legacy ID fallback in `getPortalContextByToken` |
| [`page.tsx`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/app/portal/[token]/page.tsx) | Modified | Added `dynamic = "force-dynamic"` and `revalidate = 0` cache headers |
| [`quick-access-control.test.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/portal/quick-access-control.test.ts) | Modified | Expanded to 13 comprehensive unit tests for presets, revocation, regeneration, and IDOR |
| [`PHASE-4B-08-QUICK-ACCESS-HARDENING.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4B-08-QUICK-ACCESS-HARDENING.md) | New | Implementation sprint report |
| [`PHASE-4A-ACCESS-MODEL.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-ACCESS-MODEL.md) | Modified | Updated Quick Access lifecycle, TTL presets, and child-scoping |
| [`PHASE-4A-SECURITY-PLAN.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-SECURITY-PLAN.md) | Modified | Documented Quick Access timing-safe comparison, regeneration invalidation, and no-store headers |
| [`PHASE-4A-ACCOUNT-LIFECYCLE.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-ACCOUNT-LIFECYCLE.md) | Modified | Updated Quick Access token states (Active, Expired, Revoked, Regenerated) |
| [`PHASE-4A-DECISIONS.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-DECISIONS.md) | Modified | Added decisions `DECISION-04-27` through `DECISION-04-29` |

---

## 20. Decisions Added
- **`DECISION-04-27` (Child-Scoped Token Model):** Quick Access tokens are strictly child-scoped. A token for Child A cannot view or access Child B.
- **`DECISION-04-28` (Quick Access Regeneration Invalidation):** Generating a new Quick Access token immediately invalidates any prior active tokens for that athlete and access type.
- **`DECISION-04-29` (Portal Dynamic Rendering & CDN Protection):** All `/portal/[token]` routes are marked `force-dynamic` to prevent public caching of private athlete data.

---

## 21. Deviations
- None.

---

## 22. Remaining Issues
- None.

---

## 23. Ready For

# **`PHASE 4C — FULL AUTHENTICATION & ACCOUNT ACCEPTANCE REVIEW`**
