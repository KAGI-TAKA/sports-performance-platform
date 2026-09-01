# PHASE 4A — AUTHENTICATION, ACCOUNT & USER PROVISIONING MASTER PLAN

**Document Version:** 2.0.0 (Phase 4A-Revision Final Approved Planning Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Status:** **FINAL APPROVED SPECIFICATION (Ready for Phase 4B Implementation)**

---

## 1. Executive Summary & Identity Realignment

This document establishes the finalized authentication, identity, user provisioning, and transactional email architecture for the platform. It integrates five distinct user roles across internal coaching operations and client-facing interfaces while preserving multi-tenant data isolation (`organizationId`), Better Auth session security, and parent-athlete relationship scoping.

```
+----------------------------------------------------------------------------------------------------+
|                                      ROLE & ACCESS ARCHITECTURE                                    |
+------------------------------------+---------------------------------------------------------------+
| INTERNAL STAFF ACCOUNTS            | CLIENT DUAL-ACCESS ACCOUNTS (Parents & Athletes)              |
+------------------------------------+---------------------------------------------------------------+
| • Admin / Owner: Coach Zulfi       | • Parent: Normal login (Email/PW) + Quick-Access Token Link   |
|   Holds: admin + head_coach        | • Athlete: Normal login (Username/PW) + Quick-Access Link     |
| • Assistant Coach: Field Trainer   | • Scoped strictly to associated child/athlete records         |
| • Full access to internal app      | • Zero access to internal coach notes or admin settings       |
+------------------------------------+---------------------------------------------------------------+
```

---

## 2. Core Identity & RBAC Model

### Final Role Set
1. **Admin / Owner (`admin`):** Full tenant administration, organization settings, user provisioning, member role assignment, and audit logs.
2. **Head Coach (`head_coach`):** Full athletic lifecycle authority (create assessments, design training plans, schedule sessions, evaluate assistant coaches, issue reports).
   - *Current Business Reality:* Coach Zulfi is Owner, Head Coach, and Lead Administrator, holding `admin + head_coach` within the primary academy organization.
3. **Assistant Coach (`assistant_coach`):** Field execution authority (view schedule, log workout sessions, record athlete attendance/reps, input field test scores). Cannot delete records or manage billing.
4. **Parent (`parent`):** View child's development progress, attendance history, assessment radar reports, and submit qualitative feedback.
5. **Athlete (`athlete`):** View personal bests, milestone achievement stars (1–5), upcoming training reminders, and coach video guidance.

---

## 3. Dual-Access Architecture (Parent & Athlete)

### Method 1: Permanent / Normal Credential Account
- **Parent:** Authenticates via **Email + Password**. Supports multi-child switcher on the portal dashboard.
- **Athlete:** Authenticates via **Username (`atlet_...`) + Password**. Email is optional; verification only required if email is provided.

### Method 2: Temporary Quick-Access Token Link (Convenience Mechanism)
- **Mechanism:** Cryptographically secure token (`crypto.randomBytes(32).toString("hex")`) stored as SHA-256 hash in `PortalAccess.tokenHash`.
- **Route:** `/portal/[token]`
- **TTL Presets:** `1 Hour`, `24 Hours` (**Default**), `7 Days`, or `Custom`.
- **Security:** Scoped strictly to designated `athleteId` and `organizationId`. Revocable by Head Coach/Admin in 1 click. Share-Safe DTO boundary enforced.

---

## 4. Email Infrastructure & Event Workflows

- **Transactional Sender Identity:** Independent from Admin login email (configured via `RESEND_API_KEY` or SMTP).
- **Admin Login Identity:** `zulfikarnegrosa@gmail.com` (Owner / Admin).
- **Core Flows:**
  1. Assistant Coach Invitation (`/invitations/accept?token=...`, 7-day TTL).
  2. Email Verification (`/verify-email?token=...`, 24-hour TTL).
  3. Password Reset (`/forgot-password` $\to$ `/reset-password?token=...`, 1-hour TTL, enumeration-safe).
