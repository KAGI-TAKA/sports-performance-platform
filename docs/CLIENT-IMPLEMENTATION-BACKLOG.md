# CLIENT IMPLEMENTATION BACKLOG

**Document Version:** 2.0.0 (Phase 3.1 Backlog Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Grouped Implementation Backlog

---

### A. LANDING PAGE — PARKED / LAST SPRINT
*Per Phase 3.1 Directive, landing page code changes are deferred until internal product, portal, and authentication workflows are stabilized.*

- **`TASK-LANDING-01`**: Implement Section 01 (Hero Section) & Section 02 (Philosophy) layout and copy (`REV-01`, `REV-02`).  
  - *Priority:* `PRIORITAS 1` | *Status:* **`PARKED — IMPLEMENT LAST`**
- **`TASK-LANDING-02`**: Implement Section 03 ("Who We Help?") & Section 04 ("Youth Athlete Performance") (`REV-03`, `REV-04`).  
  - *Priority:* `PRIORITAS 2` | *Status:* **`PARKED — IMPLEMENT LAST`**
- **`TASK-LANDING-03`**: Implement Section 07 (Injury Prevention Reframe), Section 09 (Sport Science), Section 13 ("Why Us?"), Section 14 (Coach Profile) (`REV-07`, `REV-09`, `REV-13`, `REV-14`).  
  - *Priority:* `PRIORITAS 2` | *Status:* **`PARKED — IMPLEMENT LAST`**
- **`TASK-LANDING-04`**: Implement Section 15 (Programs), Section 16 (Pricing), Section 17 (Testimonials), Section 18 (Final WhatsApp CTA) (`REV-15`, `REV-16`, `REV-17`, `REV-18`).  
  - *Priority:* `PRIORITAS 1` | *Status:* **`PARKED — IMPLEMENT LAST`**

---

### B. INTERNAL PRODUCT UX & ASSESSMENT WORKFLOWS

- **`TASK-INTERNAL-01`**: Refine Dual Assessment Input Wizard on `/assessments/new` with explicit 2-tab switch between Beginner Delta Mode and Elite Benchmark Mode (`REV-05`, `REV-06`).  
  - *Source:* `WEBSITE REVISION.docx` Section 05  
  - *Priority:* **`PRIORITAS 1 — WAJIB`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**
- **`TASK-INTERNAL-02`**: Add Custom Test Items & Component Configuration Modal in `/settings` (`REV-06`).  
  - *Source:* `WEBSITE REVISION.docx` Section 06  
  - *Priority:* **`PRIORITAS 1 — WAJIB`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**
- **`TASK-INTERNAL-03`**: Polish Assessment-to-Training Plan builder integration on `/training-plans/new` (`REV-08`).  
  - *Source:* `WEBSITE REVISION.docx` Section 08  
  - *Priority:* **`PRIORITAS 1 — WAJIB`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**

---

### C. PARENT PORTAL & REPORTING WORKFLOWS

- **`TASK-PORTAL-01`**: Add 1-Click WhatsApp Copy Link button with portal access token in Athlete Directory `/athletes` (`REV-12`).  
  - *Source:* `WEBSITE REVISION.docx` Section 12  
  - *Priority:* **`PRIORITAS 1 — WAJIB`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**
- **`TASK-PORTAL-02`**: Enhance PDF assessment report template with organization logo and plain Indonesian coaching guidance (`REV-10`).  
  - *Source:* `WEBSITE REVISION.docx` Section 10  
  - *Priority:* **`PRIORITAS 1 — WAJIB`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**

---

### D. ATHLETE PORTAL EXPERIENCE

- **`TASK-ATHLETE-01`**: Polish youth athlete gamification view on `/portal/[token]` with animated milestone badges and star ratings (`REV-11`, `REV-12`).  
  - *Source:* `WEBSITE REVISION.docx` Section 12  
  - *Priority:* **`PRIORITAS 2 — DISARANKAN`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**

---

### E. AUTH & USER PROVISIONING

- **`TASK-AUTH-01` (`REQ-AUTH-001`)**: Product design alignment on parent dual-access (Token Link vs Optional Password Login).  
  - *Source:* Project Planning Requirement  
  - *Priority:* **`P1`**  
  - *Status:* **`REQUIRES PRODUCT DECISION`**  
  - *Complexity:* **MEDIUM**
- **`TASK-AUTH-02` (`REQ-PROV-001`)**: Admin member invitation modal in `/settings` for Assistant Coaches.  
  - *Source:* Project Planning Requirement  
  - *Priority:* **`P1`**  
  - *Status:* **`READY FOR IMPLEMENTATION`**  
  - *Complexity:* **LOW**

---

### F. EMAIL SYSTEM INTEGRATION

- **`TASK-EMAIL-01` (`REQ-EMAIL-001`)**: Production SMTP / Resend environment configuration for password resets.  
  - *Source:* System Infrastructure  
  - *Priority:* **`P1`**  
  - *Status:* **`AWAITING CLIENT SMTP CREDENTIALS`**  
  - *Complexity:* **LOW**

---

## 2. Summary Backlog Matrix

| Work Stream | Total Tasks | Ready Tasks | Parked Tasks | Pending Decisions |
| :--- | :---: | :---: | :---: | :---: |
| **A. Marketing / Landing Page** | 4 | 0 | 4 | 0 |
| **B. Internal Coach Product UX** | 3 | 3 | 0 | 0 |
| **C. Parent Portal & Reports** | 2 | 2 | 0 | 0 |
| **D. Athlete Experience** | 1 | 1 | 0 | 0 |
| **E. Auth & User Provisioning** | 2 | 1 | 0 | 1 |
| **F. Email System** | 1 | 0 | 0 | 1 (Credentials) |
