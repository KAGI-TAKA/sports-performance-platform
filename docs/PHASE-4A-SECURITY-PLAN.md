# PHASE 4A — FINAL SECURITY & THREAT MITIGATION PLAN

**Document Version:** 2.1.0 (Phase 4B-05 Security Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Threat Mitigation Matrix

| Threat Category | Potential Vulnerability | Architectural Defense & Mitigation |
| :--- | :--- | :--- |
| **Account Takeover / Brute Force** | Repeated login attempts | Better Auth IP/Email rate limiting + Scrypt/Bcrypt hashing. |
| **Token Theft & Replay** | Intercepted reset/invitation links | SHA-256 token hashing in DB; single-use invalidation upon consumption; short TTL (1h for reset, 7d for invite, 48h for athlete activation, 24h default for Quick Access). |
| **Athlete Activation Takeover** | Username-only activation attempt | Cryptographic token required (`crypto.randomBytes(32)`). Raw token never stored in DB; SHA-256 hash verified using `crypto.timingSafeEqual`. Single-use deletion upon password setup. |
| **Parent Name Collision** | Multiple parents with identical display names | Identity-based relationship store in `Verification` table keyed by `parent-children:{userId}:{orgId}`. Display names are ignored for access control. |
| **Cross-Tenant IDOR** | Manipulating athlete ID in URL or request | Mandatory `requireOrgContext()` check binding queries to `session.organizationId` and verifying against the parent's authorized athlete ID array. |
| **Privilege Escalation** | Assistant coach modifying role or generating tokens | User provisioning and parent relationship changes restricted to `role === "admin"`. Activation token generation restricted to Admin and Head Coach. |
| **Stale Authorization** | Suspended user or removed child relationship | Real-time check of `Verification` table on every parent query. Removing a child from a parent immediately denies access. |
| **Information Disclosure / Enumeration** | Timing attacks on activation or recovery | Uniform response time & identical generic error messages ("Tautan aktivasi tidak valid atau sudah kedaluwarsa") regardless of username existence. |
| **Data Leakage in Parent Portal** | Exposing private coach notes to parents | Share-Safe DTO filtering omitting internal logs, coach compensation, and draft notes. |
