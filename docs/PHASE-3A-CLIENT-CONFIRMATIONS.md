# PHASE 3A — CLIENT CONFIRMATION LIST

**Document Version:** 1.0.0 (Phase 3A Client Questions Record)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Items Requiring Explicit Client Confirmation

### Question 1: Organization Name & Brand Working Title
- **Context:** The system references both **Coach Zulfi Athletic Hub** and **Power Up Private Training**.
- **Impact:** Organization logo, header titles, PDF report headers, and WhatsApp messaging text.
- **Recommended Default:** Use **Coach Zulfi Athletic Performance** for the primary hub, while supporting multi-academy branding via organization settings.
- **Decision Needed:** Confirm the default brand name for customer-facing documents.

---

### Question 2: Parent Portal Dual Access Model (`REQ-AUTH-001`)
- **Context:** Currently, parents and youth athletes access their personal dashboard via a secure passwordless token link (`/portal/[token]`).
- **Impact:** Should parents also have the option to create a traditional password-based account for multi-device login, or is the token link sufficient for the initial launch?
- **Recommended Default:** Keep the lightweight token link active for MVP (zero registration friction) and defer full parent password authentication to Phase 4.
- **Decision Needed:** Confirm if token-only link is sufficient for MVP launch.
