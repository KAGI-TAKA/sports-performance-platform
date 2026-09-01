# PHASE 4A — FINAL AUTH & USER PROVISIONING ACCEPTANCE CRITERIA

**Document Version:** 2.0.0 (Phase 4A-Revision Acceptance Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Measurable Acceptance Criteria (FINAL)

1. **Production Admin Onboarding (`AC-AUTH-01`):**
   - The production admin (`zulfikarnegrosa@gmail.com`) can log in securely and holds full administrative authority (`admin + head_coach`) over the primary organization.

2. **Parent Credential Login & Multi-Child Access (`AC-AUTH-02`):**
   - A parent can log in with Email + Password and seamlessly view and switch between all associated children. Cross-family record access is strictly blocked.

3. **Athlete Username Login (`AC-AUTH-03`):**
   - An athlete can log in with Username (`atlet_...`) + Password without requiring a personal email address.

4. **Quick-Access Token Lifecycle (`AC-AUTH-04`):**
   - Quick-Access tokens default to a 24-hour TTL, are stored as SHA-256 hashes, can be revoked in 1 click, and cannot access unrelated athlete data.

5. **Staff Invitation Security (`AC-AUTH-05`):**
   - Invitations expire after 7 days; single-use token consumption is strictly enforced; revoked invitations cannot be accepted.

6. **Password Reset Protection (`AC-AUTH-06`):**
   - `/forgot-password` always returns a generic success message preventing email enumeration. Valid reset tokens expire after 1 hour and invalidate active sessions.

7. **Multi-Tenant Scoping (`AC-AUTH-07`):**
   - All mutations and data fetches enforce `organizationId` matching the active session. Cross-tenant record access returns 404 or 403.
