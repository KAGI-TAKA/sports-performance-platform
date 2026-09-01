# PHASE 4B-06 — EMAIL VERIFICATION & TRANSACTIONAL EMAIL REPORT

**Sprint:** Phase 4B-06  
**Date:** September 2026  
**Status:** COMPLETE  

---

## 1. Email Architecture
- **Provider Abstraction:** Single, robust transactional email abstraction in `src/lib/email.ts` utilizing Resend SDK as the primary provider with a safe development console fallback.
- **Transactional Helpers:**
  - `sendAssistantCoachInvitationEmail`
  - `sendParentInvitationEmail`
  - `sendAthleteActivationEmail`
  - `sendEmailVerificationEmail`
  - `sendPasswordResetEmail`
- **Template System (`src/features/auth/templates/`):**
  - Brand-aligned HTML & Plain Text templates with dark glassmorphic styling, responsive layout, escaping helpers (`escapeHtml`), clear action buttons, and expiration notices.

---

## 2. Provider
- **Primary Provider:** Resend (`resend` SDK).
- **Environment Handling:**
  - In production (`NODE_ENV === "production"`): Requires valid `RESEND_API_KEY`. Never leaks tokens or private information to stdout.
  - In development (`NODE_ENV !== "production"`): If `RESEND_API_KEY` is not present, logs formatted simulation info (`[DEV_AUTH]`) for immediate developer testing without external email dispatch.

---

## 3. Sender Identity
- **Configurable Sender:** Configured via `EMAIL_FROM` environment variable.
  - Default: `Coach Zulfi Athletic Performance <onboarding@resend.dev>` (development) / verified client domain (production).
- **Admin Isolation:** Production admin identity (`zulfikarnegrosa@gmail.com`) is strictly isolated from SMTP/API sender credentials.

---

## 4. Assistant Coach Invitation
- **Workflow:**
  - Admin issues invitation from `/settings`.
  - System creates `Invitation` record (7-day TTL) and sends transactional invitation email via `sendAssistantCoachInvitationEmail`.
  - Invitee opens `/invitations/accept?id=...`, enters full name and password (min 8 chars).
  - On acceptance: `User` created/updated, `Account` credential stored (bcrypt hash), `Member` record created with `assistant_coach` role, `Invitation` marked as `accepted`.
  - Email verified automatically upon invitation acceptance (Option A Policy).

---

## 5. Parent Invitation
- **Workflow:**
  - Admin provisions Parent in `/settings` with full name, email, and linked children.
  - System provisions `User` + `Member` (role: `parent`), saves identity-based child links in `Verification`, and dispatches parent portal invitation email via `sendParentInvitationEmail`.
  - Quick Access remains completely separate and is **not** automatically activated.

---

## 6. Athlete Email Activation
- **Workflow (With Email):**
  - Admin creates athlete profile and username.
  - When activation token is generated, `sendAthleteActivationEmail` delivers the 48-hour single-use activation link `/activate?token=...&u=...` to the athlete's email.
- **Workflow (Without Email):**
  - Athlete accounts without personal email are created with internal identity (`{username}@athlete.internal`).
  - No fake external email is created or sent.
  - Admin shares activation link manually via the copyable activation management UI.

---

## 7. Email Verification
- **Token Generation:** 32-byte cryptographic token (`crypto.randomBytes(32)`).
- **Storage:** SHA-256 hash stored in `Verification` table (`email-verify:{normalizedEmail}`).
- **TTL:** 24 Hours.
- **Single-Use Consumption:**
  - When user opens `/verify-email?token=...&email=...`, token is verified using `crypto.timingSafeEqual`.
  - `User.emailVerified` updated to `true`.
  - Single-use `Verification` record deleted.

---

## 8. Critical Policy Decision: Invitation != Verification (Option A Approved)
- **Policy Decision (`DECISION-04-21`):**
  - Accepting an email invitation sent directly to a recipient mailbox establishes proven control of that mailbox.
  - Therefore, invitation acceptance sets `User.emailVerified = true` for invitation-created accounts.
  - Direct signups or accounts created without an email invitation must complete the standard verification flow (`/verify-email`).
  - Athlete accounts without email do not require email verification.

---

## 9. Token Lifecycle

| Token Type | Identifier Format | Storage | TTL | Single-Use? | Action on Success |
|---|---|---|---|:---:|---|
| **Invitation** | `Invitation.id` (cuid) | `Invitation` table | 7 Days | **YES** | `status: "accepted"`, `emailVerified = true` |
| **Email Verification** | `email-verify:{email}` | `Verification` (SHA-256) | 24 Hours | **YES** | `User.emailVerified = true`, token deleted |
| **Athlete Activation** | `athlete-activate:{username}` | `Verification` (SHA-256) | 48 Hours | **YES** | `passwordHash` stored, token deleted |
| **Quick Access** | `PortalAccess.tokenHash` | `PortalAccess` table | 24h default | Multi-session | Governed by `revokedAt` |

---

## 10. Expiration
- Email Verification: **24 Hours**
- Assistant Coach Invitation: **7 Days**
- Athlete Activation: **48 Hours**
- Quick Access: **24 Hours (Default)**

---

## 11. Resend
- Resend endpoint `/api/auth` / `resendVerificationEmail` supported.
- Invalidates any prior active verification token and replaces it with a fresh 24h token.

---

## 12. Rate Limiting
- **Cooldown Enforcement:** Minimum 60 seconds between resend requests for the same email address.
- Returns clear user feedback if triggered: `"Mohon tunggu X detik sebelum meminta link verifikasi baru."`

---

## 13. Security
- [x] Timing-safe hash comparison via `crypto.timingSafeEqual`
- [x] Generic enumeration-safe error responses
- [x] HTTPS-ready URLs with token query parameters
- [x] Raw tokens never stored in database
- [x] No passwords sent via email
- [x] Complete isolation between Admin identity and transactional sender

---

## 14. Browser Tests
- Verified in Chromium:
  - `/verify-email?token=...&email=...` verification success & error screens.
  - `/invitations/accept?id=...` invitation acceptance flow.
  - `/activate?token=...&u=...` athlete activation flow.

---

## 15. Test Results
- **Vitest Full Suite:** **551 passed (551 total)** across **41 test files** (11 new tests added).
- **Test Command:** `npx vitest run`

---

## 16. Typecheck
- `npx tsc --noEmit` $\to$ **0 errors**.

---

## 17. Lint
- TypeScript strict mode verified.

---

## 18. Build
- `npx next build` $\to$ **Compiled successfully** (Turbopack, 42 routes static/dynamic).

---

## 19. Database Changes
- **NO SCHEMA CHANGE.**
- **NO MIGRATIONS RUN.**
- Reused existing `Verification`, `Invitation`, `User`, `Account`, `Member`, and `PortalAccess` tables.

---

## 20. Files Changed

| File | Type | Description |
|---|---|---|
| [`email.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/lib/email.ts) | Modified | Added transactional email senders for invitation, parent, athlete, and verification |
| [`assistant-coach-invitation.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/templates/assistant-coach-invitation.ts) | New | Brand email template for coach invitations |
| [`parent-invitation.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/templates/parent-invitation.ts) | New | Brand email template for parent portal invitations |
| [`athlete-activation.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/templates/athlete-activation.ts) | New | Brand email template for athlete activation |
| [`email-verification.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/templates/email-verification.ts) | New | Brand email template for email verification links |
| [`verification-actions.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/verification-actions.ts) | New | Server actions for creating, sending, and verifying email tokens |
| [`page.tsx`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/app/(public)/verify-email/page.tsx) | New | Public landing page for `/verify-email` |
| [`invitation-actions.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/invitation-actions.ts) | Modified | Integrated transactional email delivery on coach invitation |
| [`athlete-actions.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/athlete-actions.ts) | Modified | Integrated optional activation email delivery |
| [`actions.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/user-management/actions.ts) | Modified | Integrated coach and parent email dispatches on user provisioning |
| [`email-verification.test.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/email-verification.test.ts) | New | 11 unit tests for verification and transactional email flows |

---

## 21. Production Configuration Required
1. Set `RESEND_API_KEY` in production environment (e.g. Vercel environment settings).
2. Set `EMAIL_FROM` with verified custom sender domain (e.g. `Coach Zulfi Athletic Performance <noreply@coachzulfi.com>`).
3. Set `BETTER_AUTH_URL` with production base domain (`https://sports-performance-platform-steel.vercel.app`).

---

## 22. Decisions
- **`DECISION-04-21` (Email Verification on Invitation Acceptance):** Accepting an invitation token delivered to a verified email address satisfies email verification (Option A). `User.emailVerified` is marked `true`.
- **`DECISION-04-22` (Email Verification Token TTL):** Verification tokens expire in **24 Hours** and are single-use.
- **`DECISION-04-23` (Resend Cooldown Rate Limit):** 60-second cooldown enforced per email address.

---

## 23. Deviations
- None.

---

## 24. Remaining Issues
- None.

---

## 25. Ready For

# **`PHASE 4B-07 — PASSWORD RESET & ACCOUNT RECOVERY`**
