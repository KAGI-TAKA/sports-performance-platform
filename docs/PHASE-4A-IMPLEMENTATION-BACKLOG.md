# PHASE 4A — FINAL AUTH & USER PROVISIONING IMPLEMENTATION BACKLOG

**Document Version:** 2.0.0 (Phase 4A-Revision Backlog Specification for Phase 4B)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Prioritized Implementation Sprints for Phase 4B (FINAL)

---

### SPRINT 4B-1: Role & Identity Foundations
- **`TASK-4B-01`**: Verify and lock Better Auth role definitions (`admin`, `head_coach`, `assistant_coach`, `parent`, `athlete`). Ensure Coach Zulfi holds `admin + head_coach`.
- **`TASK-4B-02`**: Provision the Production Admin identity (`zulfikarnegrosa@gmail.com`) in the database with `admin` role and organization ownership.

---

### SPRINT 4B-2: Transactional Email Client & Provider Setup
- **`TASK-4B-03`**: Implement the transactional email client supporting Resend API with fallback to SMTP and development console logger.
- **`TASK-4B-04`**: Create branded responsive HTML email templates (Assistant Coach Invitation, Parent Invitation, Password Reset, Email Verification).

---

### SPRINT 4B-3: Staff & Parent Invitation Workflows
- **`TASK-4B-05`**: Implement secure token generation and verification for `/invitations/accept?token=...` (7-day TTL).
- **`TASK-4B-06`**: Implement enumeration-safe password reset flow (`/forgot-password` and `/reset-password`).

---

### SPRINT 4B-4: Parent Multi-Child & Quick-Access Experience
- **`TASK-4B-07`**: Enhance `PortalAccessManager` with configurable Quick-Access TTL presets (`1h`, `24h` [Default], `7d`, `Custom`) and 1-click revocation.
- **`TASK-4B-08`**: Build Parent multi-child dashboard switcher for credential accounts.
- **`TASK-4B-09`**: Verify Share-Safe DTO boundary on all portal data queries.

---

### SPRINT 4B-5: Test Account Cleanup & Security Test Suite
- **`TASK-4B-10`**: Safe cleanup plan for temporary/obsolete test accounts while preserving historical assessment data.
- **`TASK-4B-11`**: End-to-end security test suite covering IDOR, token replay, and rate limiting.
