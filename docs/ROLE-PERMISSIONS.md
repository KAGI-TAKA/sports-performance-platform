# ROLE PERMISSION & ACCESS CONTROL MATRIX

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Role Permission Matrix

| Feature / Domain Action | Admin | Head Coach | Assistant Coach | Parent (Token) | Athlete (Token) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Dashboard Command Center** | ALLOW | ALLOW | ALLOW | DENY | DENY |
| **Manage Academy / Org Settings** | ALLOW | DENY | DENY | DENY | DENY |
| **Manage Coaches / User Roles** | ALLOW | DENY | DENY | DENY | DENY |
| **Create / Edit Athlete Profiles** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Archive / Delete Athletes** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Create / Edit Physical Assessments** | ALLOW | ALLOW | VIEW ONLY | DENY | DENY |
| **Delete Assessments** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Create / Edit Training Plans** | ALLOW | ALLOW | VIEW ONLY | DENY | DENY |
| **Create / Manage Calendar Schedule** | ALLOW | ALLOW | VIEW ONLY | DENY | DENY |
| **Execute Session on Field (Stopwatch)**| ALLOW | ALLOW | ALLOW | DENY | DENY |
| **Record Attendance & Field Logs** | ALLOW | ALLOW | ALLOW | DENY | DENY |
| **View Squad Progress Analytics** | ALLOW | ALLOW | ALLOW | DENY | DENY |
| **Generate & Download PDF Reports** | ALLOW | ALLOW | ALLOW | ALLOW (Child Only) | ALLOW (Self Only) |
| **Export Full CSV Backups** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Submit Parent Qualitative Feedback** | DENY | DENY | DENY | ALLOW | DENY |
| **Respond to Parent Feedback** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Prescribe Physical Goals** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Configure Test Items & Benchmarks** | ALLOW | ALLOW | DENY | DENY | DENY |

---

## 2. Server-Side Enforcement Verification

- Multi-tenant scoping: 100% of Prisma queries enforced via `organizationId`.
- Role verification: `requireCoachRole()` or `requireAdminRole()` server action guards protect all mutating procedures.
- Portal isolation: `verifyPortalToken()` SHA-256 hash lookup restricts data strictly to the single athlete record linked to the token.
