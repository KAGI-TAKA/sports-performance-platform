# ADMIN USER PROVISIONING & ACCOUNT WORKFLOW AUDIT

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. User Provisioning Capabilities

| Persona | Creation Method | Account Type | Invitation / Access Mechanism | Current Status |
| :--- | :--- | :--- | :--- | :---: |
| **Head Coach / Admin** | Public Registration (`/register`) or Admin Invite | Better Auth User + Member Record | Direct Email + Password Registration | **IMPLEMENTED** |
| **Assistant Coach** | Admin Panel (`/settings` Member Invite) | Better Auth User + Assistant Member | Email Invite Link / Temporary Password | **IMPLEMENTED** |
| **Athlete** | Coach Creation (`/athletes/new`) | Domain Entity (`Athlete`) | Secure Portal Token Link (`/portal/[token]`) | **IMPLEMENTED** |
| **Parent** | Linked via Athlete Profile (`parentEmail`, `parentPhone`) | Contact & Portal Stakeholder | WhatsApp / Email Link with Token | **IMPLEMENTED** |

---

## 2. Provisioning Workflows

1. **Coach Self-Registration**:
   - User signs up on `/register` $\to$ Organization created $\to$ User becomes `admin`.
2. **Assistant Coach Onboarding**:
   - Admin sends invitation $\to$ Better Auth creates pending member $\to$ Assistant accepts and sets password.
3. **Youth Athlete Onboarding**:
   - Coach inputs child name, DOB, sport category, parent contact $\to$ Unique SHA-256 portal access token generated $\to$ WhatsApp link dispatched to parent in 1 click.
