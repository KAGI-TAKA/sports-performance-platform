# PHASE 4C — ISSUES & TECHNICAL DEBT REGISTER

**Sprint:** Phase 4C — Acceptance Review  
**Date:** September 2026  

---

## 1. Issue Classification Standard
- **P0 (Critical / Blocker):** Security breach, account takeover, cross-tenant exposure, data corruption, or auth bypass.
- **P1 (High Priority):** Core account flow broken, invitation cannot activate, parent cannot access child, password reset failure.
- **P2 (Medium Priority):** UX friction, confusing status message, non-blocking edge cases.
- **P3 (Low Priority):** Visual polish, layout alignment, typography, micro-animations.

---

## 2. Issues Discovered During Acceptance Review

| Issue ID | Severity | Description | Impact | Recommendation |
|---|:---:|---|---|---|
| *None* | **P0** | No P0 security issues detected. | N/A | N/A |
| *None* | **P1** | No P1 core flow broken. | N/A | N/A |
| **`ISS-4C-01`** | **P2** | In the Admin User Management panel, if an athlete's username is very long (> 20 chars), the activation status badge wraps on ultra-compact mobile viewports (< 360px width). | Minor visual wrap on small screens | Apply `truncate` / `shrink-0` to badge container in future polish phase. |
| **`ISS-4C-02`** | **P3** | On `/verify-email`, the resend cooldown timer does not count down in real-time in the browser without re-submitting. | User must submit to see remaining cooldown seconds | Add a client-side countdown interval in future UX polish sprint. |

---

## 3. Risk Assessment
- **Security Posture:** High. All token lookups use SHA-256 hashes with `timingSafeEqual`, 24h/1h TTLs, single-use invalidation, session revocation on password reset, and anti-enumeration generic responses.
- **Data Isolation:** Robust. Multi-child and tenant scoping strictly enforced by server queries.
- **Database Safety:** Zero migrations or schema modifications were required.
