# USER ROLE & SCOPE MATRIX

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. System Roles Overview

The platform implements 4 primary user roles and 1 passwordless stakeholder persona:

1. **`admin` (Owner / Head Coach)**: Full organizational authority, member provisioning, test item configuration, academy settings, full data read/write.
2. **`head_coach` (Senior Conditioning Specialist)**: Complete athletic management (athletes, assessments, training plans, schedules, reports, goals, parent feedback responses). Cannot delete organization or alter billing.
3. **`assistant_coach` (Field Assistant / Trainer)**: Operational field access. Can view assigned schedule, execute training sessions with live stopwatch, take attendance, and log field notes. Cannot delete master assessments or alter academy test items.
4. **`parent` (Guardian Persona)**: Accesses specific child's performance records via secure token link (`/portal/[token]`). Can view physical radar, milestones, star rating progress, and submit qualitative feedback.
5. **`athlete` (Youth Athlete Persona)**: Gamified portal access (`/portal/[token]`). Views personal bests, milestone badges, and coach recommendations.

---

## 2. Role Boundary & Authentication Specification

| Role / Persona | Authentication Method | Organization Scope | Accessible Dashboard / UI | Sensitive Action Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Email + Password (Better Auth Session) | Strict Organization Isolation | `/dashboard`, Full Shell | None within assigned organization |
| **Head Coach** | Email + Password (Better Auth Session) | Strict Organization Isolation | `/dashboard`, Full Shell | Restricted from Org Delete / Member Role Alteration |
| **Assistant Coach** | Email + Password (Better Auth Session) | Assigned Sessions & Roster | `/dashboard`, `/schedule`, `/session-logs` | Restricted from Deleting Athletes, Changing Benchmark Scales |
| **Parent** | Secure Token (SHA-256 `PortalAccess`) | Single Athlete Linked Token | `/portal/[token]` | Read-Only Athlete Progress + Submit Feedback Form |
| **Athlete** | Secure Token (SHA-256 `PortalAccess`) | Single Athlete Linked Token | `/portal/[token]` | Read-Only Gamified Profile + PB Cards |
