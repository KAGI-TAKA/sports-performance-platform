# PHASE 4B-07 — PASSWORD RESET & ACCOUNT RECOVERY REPORT

**Sprint:** Phase 4B-07  
**Date:** September 2026  
**Status:** COMPLETE  

---

## 1. Forgot Password
- **Route:** `/forgot-password`
- **Action:** `requestPasswordReset(email)` in `src/features/auth/password-reset-actions.ts`.
- **Response Policy:** Strict generic response (`"Jika akun dengan email tersebut tersedia, kami akan mengirimkan instruksi reset password ke kotak masuk Anda."`).
- **Enumeration Defense:** Returns identical response regardless of whether email exists, is deactivated, or belongs to an athlete with internal email.

---

## 2. Reset Password
- **Route:** `/reset-password?token=...&email=...`
- **Actions:**
  - `validatePasswordResetToken(token, email)`: Validates format, unexpired TTL, and timing-safe SHA-256 hash.
  - `performPasswordReset({ token, email, newPassword })`: Hashes password with bcrypt (10 rounds), updates credential `Account`, invalidates sessions, and consumes token.
- **Validation:** Minimum 8 characters, confirmation matching.

---

## 3. Reset Token Security
- **Entropy:** 32 cryptographically random bytes (`crypto.randomBytes(32)` -> 64 hex characters).
- **Storage:** Stored only as SHA-256 hash in `Verification` table under namespace `password-reset:{normalizedEmail}`. Raw token is never stored in database or logged.
- **Verification:** Constant-time verification using `crypto.timingSafeEqual`.

---

## 4. Token Expiration
- **TTL:** **1 Hour (60 minutes)**.
- Expired tokens return generic message: `"Link reset password tidak valid atau sudah kedaluwarsa."`

---

## 5. Single-Use Policy
- Reset token is deleted from the `Verification` table immediately upon successful password change.
- Replaying a consumed token fails immediately.
- Generating a new reset token overwrites and invalidates any previous active token for that email.

---

## 6. Session Revocation (Approved Policy)
- **Session Policy:** A successful password reset immediately deletes all active sessions for that user across all devices/browsers:
  ```typescript
  await prisma.session.deleteMany({ where: { userId: user.id } });
  ```
- **Rationale:** Ensures any previously active or potentially compromised sessions cannot remain open after credentials change. The user must re-authenticate with the new password.

---

## 7. Enumeration Defense
- Forgot password API always returns generic confirmation without revealing account presence or role.
- Token validation returns generic invalid/expired error for non-existent, tampered, or mismatched tokens.
- No role, organization, or user metadata is leaked during recovery.

---

## 8. Rate Limiting
- **Cooldown Enforcement:** Minimum 60 seconds between reset requests for the same email address.
- Returns rate limit feedback: `"Mohon tunggu X detik sebelum meminta tautan reset password baru."`

---

## 9. Role Coverage & Safety

| Role | Recovery Method | Session Revoked? | Data / Relationship Preservation |
|---|---|:---:|---|
| **Admin** | Email + Password Reset | **YES** | Preserves `admin` role and organization ownership |
| **Head Coach** | Email + Password Reset | **YES** | Preserves `head_coach` role and training plan access |
| **Assistant Coach** | Email + Password Reset | **YES** | Preserves `assistant_coach` role without privilege change |
| **Parent** | Email + Password Reset | **YES** | Preserves `parent` User ID and child relationships (`parent-children:{userId}:{orgId}`) |
| **Athlete (With Email)** | Email + Password Reset | **YES** | Synchronizes `Account.password` and `PortalAccess.passwordHash` |
| **Athlete (Without Email)** | Administrative Recovery Only | N/A | Admin / Head Coach regenerates activation link from UI |

---

## 10. Athlete Without Email Administrative Recovery
- Athlete accounts without personal email use the internal identifier namespace (`{username}@athlete.internal`).
- Public `/forgot-password` does not send email or create external tokens.
- Recovery is executed securely by authorized Coaches/Admins via the **Athlete Activation Management** modal in `/settings`, which generates a fresh 48-hour single-use activation link without compromising system security.

---

## 11. Email Delivery
- Integrates directly with `sendPasswordResetEmail` in `src/lib/email.ts`.
- Uses base URL from `BETTER_AUTH_URL` environment variable.
- Dual HTML and Plain Text templates with XSS-safe escaping (`escapeHtml`).

---

## 12. Browser Validation
- Tested and verified:
  - `/forgot-password` request flow with generic message and cooldown.
  - `/reset-password` validation, eye toggle, password validation, and submission.
  - Session termination and redirection to `/login`.
  - Replay attack rejection.

---

## 13. Test Results
- **Vitest Full Suite:** **565 passed (565 total)** across **42 test files** (14 new tests added).
- **Test Command:** `npx vitest run`

---

## 14. Quality Gates
- **Typecheck (`tsc --noEmit`):** 0 errors.
- **Build (`next build`):** Compiled successfully.
- **Database:** Zero schema changes / zero migrations.

---

## 15. Files Changed

| File | Type | Description |
|---|---|---|
| [`password-reset-actions.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/password-reset-actions.ts) | New | Server actions for request, validation, reset execution, session revocation |
| [`page.tsx`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/app/(public)/forgot-password/page.tsx) | Modified | Updated forgot-password UI with secure action and rate-limit feedback |
| [`page.tsx`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/app/(public)/reset-password/page.tsx) | Modified | Updated reset-password UI with validation, confirmation, and session revocation messaging |
| [`password-reset.test.ts`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/src/features/auth/password-reset.test.ts) | New | 14 unit tests for reset tokens, session invalidation, enumeration defense, and role matrix |
| [`PHASE-4B-07-PASSWORD-RESET-IMPLEMENTATION.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4B-07-PASSWORD-RESET-IMPLEMENTATION.md) | New | Implementation sprint report |
| [`PHASE-4A-EMAIL-ARCHITECTURE.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-EMAIL-ARCHITECTURE.md) | Modified | Updated password reset TTL (1 hour) & enumeration rules |
| [`PHASE-4A-ACCOUNT-LIFECYCLE.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-ACCOUNT-LIFECYCLE.md) | Modified | Updated password recovery state transitions and session revocation |
| [`PHASE-4A-SECURITY-PLAN.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-SECURITY-PLAN.md) | Modified | Documented session revocation upon password reset and anti-enumeration controls |
| [`PHASE-4A-DECISIONS.md`](file:///d:/KKN%20Semester%207/Website%20Analisis%20Data%20Zul/sports-performance-platform/docs/PHASE-4A-DECISIONS.md) | Modified | Added decisions `DECISION-04-24` through `DECISION-04-26` |

---

## 16. Decisions Added
- **`DECISION-04-24` (Password Reset Token TTL):** Password reset tokens expire in **1 Hour (60 minutes)** and are strictly single-use.
- **`DECISION-04-25` (Session Revocation on Password Reset):** All active sessions across all devices for the target user are immediately terminated upon password reset.
- **`DECISION-04-26` (Athlete Without Email Recovery Policy):** Athletes without email cannot use public password reset; recovery is managed administratively via Admin activation regeneration.

---

## 17. Deviations
- None.

---

## 18. Remaining Issues
- None.

---

## 19. Ready For

# **`PHASE 4B-08 — QUICK ACCESS FINAL SECURITY & LIFECYCLE HARDENING`**
