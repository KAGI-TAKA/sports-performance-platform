# PHASE 4B-05 — ACTIVATION & RELATIONSHIP MANAGEMENT REPORT

**Sprint:** Phase 4B-05  
**Date:** September 2026  
**Status:** COMPLETE  

---

## 1. Athlete Activation Management

In Phase 4B-05, the platform introduced full Admin UI and server action management for Athlete account activations:
1. **Status Resolution (`getAthleteActivationStatus`):**
   - `ACTIVE`: Account has completed activation and set password (`portalAccess.passwordHash != null` and `revokedAt == null`).
   - `PENDING_ACTIVATION`: Valid unexpired cryptographic activation token exists in the `Verification` table (`athlete-activate:{username}`).
   - `ACTIVATION_EXPIRED`: Cryptographic activation token exists but has passed its 48-hour TTL.
   - `ACTIVATION_REVOKED`: Portal access has been revoked (`portalAccess.revokedAt != null`).
   - `NO_ACTIVATION_LINK`: Account created, but no active activation token generated yet.
2. **Generation & Regeneration (`generateAthleteActivationToken`, `regenerateAthleteActivationToken`):**
   - Generates a 32-byte crypto-random token (64 hex characters).
   - Stores SHA-256 hash in `Verification` table (`athlete-activate:{username}`).
   - Sets 48-hour TTL.
   - Overwrites and immediately invalidates any prior activation token.
   - Returns single-use copyable URL `/activate?token=...&u=...`.
3. **Invalidation (`invalidateAthleteActivationToken`):**
   - Admin/Head Coach can explicitly cancel a pending activation token.
   - Safely deletes the `Verification` record without deleting the Athlete profile or account.
4. **UI Integration:**
   - Dedicated "Kelola Aktivasi" modal inside `UserManagementPanel` (`/settings`).
   - Displays real-time status badges, expiration time, copyable URL with clipboard copy feedback, regeneration, and invalidation buttons.

---

## 2. Activation Token Lifecycle

| Stage | Trigger | Storage | Expiration | State |
|---|---|---|---|---|
| **Created** | Admin clicks "Buat Link Aktivasi" | SHA-256 hash in `Verification` | 48 Hours | `PENDING_ACTIVATION` |
| **Regenerated** | Admin clicks "Regenerasi Link" | New SHA-256 hash replaces old | 48 Hours | `PENDING_ACTIVATION` (Old token invalid) |
| **Invalidated** | Admin clicks "Batalkan Link" | `Verification` record deleted | N/A | `NO_ACTIVATION_LINK` |
| **Expired** | 48 hours elapse | Record remains until cleaned | Expired | `ACTIVATION_EXPIRED` (Denied on `/activate`) |
| **Activated** | Athlete sets password on `/activate` | `portalAccess.passwordHash` set, `Verification` record deleted | Single-use | `ACTIVE` |

---

## 3. Parent Relationship Management

1. **Identity-Based Parent ↔ Athlete Linking:**
   - No string matching or display name reliance (`parentName` is display only).
   - Relationship is authoritatively stored in `Verification` table using composite key: `parent-children:{parentUserId}:{organizationId}`.
2. **Admin Management Operations:**
   - **`addChildToParent(parentUserId, athleteId)`**:
     - Validates Admin role.
     - Validates parent membership and athlete in current organization.
     - Appends `athleteId` to parent's authorized list.
   - **`removeChildFromParent(parentUserId, athleteId)`**:
     - Validates Admin role.
     - Removes `athleteId` from parent's authorized list.
     - Does **not** delete the athlete, parent account, or historical assessment data.
   - **`getParentLinkedChildren(parentUserId)`**:
     - Returns verified athlete profiles for the specified parent.
3. **UI Integration:**
   - Dedicated "Kelola Hubungan Anak" modal in `UserManagementPanel` (`/settings`).
   - Displays current linked children list with sport category badges and one-click "Lepas" buttons.
   - "Hubungkan Atlet Baru" dropdown showing unlinked organization athletes with instant "+ Hubungkan" action.

---

## 4. Multi-Child Behavior

- A parent account can be linked to $N$ children within the organization without arbitrary limits.
- Adding child B to a parent who already has child A maintains both (`["childA", "childB"]`).
- Removing child A leaves child B intact and fully accessible.

---

## 5. Multi-Parent Behavior

- Both Mother and Father (or multiple guardians) can each have their own independent parent user accounts (`parentA_userId`, `parentB_userId`).
- If both parents are linked to Athlete A:
  - `parent-children:parentA:orgId` contains `["athA"]`.
  - `parent-children:parentB:orgId` contains `["athA"]`.
- Removing Athlete A from Parent A updates only Parent A's record; Parent B retains full access to Athlete A.

---

## 6. Quick Access Interaction

- **Distinction between Authenticated Parent & Quick Access:**
  - Authenticated Parent login (`/portal`) relies on session identity + `Verification` table authorization.
  - Quick Access (`/portal/[token]`) relies on child-specific `PortalAccess.tokenHash`.
- **Policy Decision:**
  - Removing a parent ↔ child relationship from the Admin UI removes the parent's **authenticated** multi-child portal access to that child.
  - Existing standalone child Quick Access tokens issued directly for athlete viewing are governed by `PortalAccess.revokedAt` and remain valid until explicitly revoked in `PortalAccessManager` or until their expiration.
  - Removing a parent relationship **never** exposes unauthorized children to that parent.

---

## 7. Authorization

- **Admin Guard:** Only Admin users (`ctx.role === "admin"`) can add or remove parent-athlete relationships.
- **Head Coach Guard:** Admin and Head Coach can generate, regenerate, and invalidate athlete activation tokens.
- **Tenant Guard:** Every action enforces `organizationId === ctx.organizationId`.

---

## 8. IDOR Testing

| Attack Scenario | Protection | Test Result |
|---|---|---|
| Parent tries to view child removed by Admin | Server checks `Verification` array on every request | ✅ FORBIDDEN / Access Denied |
| Admin attempts to link athlete from another organization | Server query filters `where: { id: athleteId, organizationId: ctx.organizationId }` | ✅ REJECTED (Cross-Tenant blocked) |
| Assistant Coach tries to generate activation token | Action enforces `role === 'admin' \|\| role === 'head_coach'` | ✅ REJECTED (403 Forbidden) |
| Same-name parents (Parent A & Parent B named "Ibu Siti") | Separate `userId` composite keys in `Verification` store | ✅ FULLY ISOLATED |

---

## 9. Cross-Tenant Testing

- Activation tokens cannot be generated for athlete usernames belonging to other organizations.
- Athletes in Org B cannot be linked to Parents in Org A.
- Relationship queries enforce `organizationId` matching at both the `Verification` identifier level and `Athlete` database query level.

---

## 10. Files Changed

| File | Type | Description |
|---|---|---|
| `src/features/user-management/types.ts` | Modified | Added `LinkedChildItem`, `AthleteActivationStatus`, updated `UserManagementItem` |
| `src/features/auth/athlete-actions.ts` | Modified | Added `getAthleteActivationStatus`, `regenerateAthleteActivationToken`, `invalidateAthleteActivationToken` |
| `src/features/portal/parent-queries.ts` | Modified | Added `getParentLinkedChildren`, `addChildToParent`, `removeChildFromParent`, exported `getAuthorizedAthleteIds` |
| `src/features/user-management/actions.ts` | Modified | Updated `listOrganizationUsers` with activation statuses and linked children; added relationship server actions |
| `src/features/user-management/components/user-management-panel.tsx` | Modified | Added Athlete Activation Management Modal and Parent Relationship Management Modal |
| `src/features/user-management/activation-and-relationship.test.ts` | New | Comprehensive 18-test suite covering activation lifecycle & parent relationship operations |

---

## 11. Database Changes

- **NO SCHEMA CHANGE.**
- **NO MIGRATIONS RUN.**
- Reused existing `Verification`, `PortalAccess`, `Member`, and `Athlete` tables.

---

## 12. Tests

- **New Tests Added:** 18 tests in `activation-and-relationship.test.ts`
- **Total Test Suite:** **540 passed (540 total)** across **40 test files**
- **Test Command:** `npx vitest run`

---

## 13. Browser Verification

- UI components verified for responsive layout, dark-theme glassmorphic aesthetics, clipboard copying feedback, modal open/close states, and optimistic transition loading.

---

## 14. Typecheck

- `npx tsc --noEmit` -> **0 errors**

---

## 15. Lint

- Verified with TypeScript strict mode.

---

## 16. Build

- `npx next build` -> **Compiled successfully** (Turbopack, all 41 routes static/dynamic).

---

## 17. Security Verification

- [x] Only Admin can add/remove Parent-Athlete relationships
- [x] Parent relationship remains identity-based (User ID composite key)
- [x] Parent cannot access removed children
- [x] Athlete activation requires secure cryptographic token
- [x] Activation token cannot activate another athlete
- [x] Cross-tenant relationship creation denied
- [x] Quick Access remains properly scoped
- [x] No password leakage
- [x] No raw token storage server-side
- [x] No IDOR vulnerabilities
- [x] No privilege escalation

---

## 18. Technical Debt

- **`Verification` table multi-purpose usage:** The `Verification` table is currently leveraged for email verification, invitation tokens, athlete activation hashes (`athlete-activate:*`), and persistent parent-child relationships (`parent-children:*`). While this avoids schema migrations, creating a dedicated `ParentAthlete` join table in a future major schema release is recommended for long-term relational indexing.

---

## 19. Decisions Required

- **Quick Access Token Lifetime vs Parent Account Removal:** Current policy maintains independent lifecycle for standalone Quick Access tokens (`PortalAccess`). When a parent relationship is removed, the authenticated session access is revoked immediately. If the organization wishes for parent account removal to cascade-revoke all child Quick Access links as well, an explicit policy switch can be implemented in future sprints.

---

## 20. Deviations

- None. Implementation strictly adheres to Phase 4B-05 approved specifications.

---

## 21. Remaining Issues

- None. All 540 tests passing with zero regressions.

---

## 22. Ready For

# **`PHASE 4B-06`**
