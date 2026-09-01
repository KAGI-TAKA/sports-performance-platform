# PHASE 3A — IMPLEMENTATION BACKLOG

**Document Version:** 1.0.0 (Phase 3A Implementation Backlog)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Categorized Implementation Sprints (Ready for Phase 3B)

---

### SPRINT A: PRODUCT & COPY FOUNDATION (Global Positioning & Claims)
- **`TASK-FOUNDATION-01`**: Audit and sanitize all terminology across internal components and reports to ensure compliance with Global Rule 19 (Zero medical claims, zero 100% injury prevention promises).  
  - *ID:* `GLOBAL-19` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**
- **`TASK-FOUNDATION-02`**: Embed Coach Zulfi official certifications (Level 2 S&C, Level 1 S&C, PSSI D License) and primary contact `+62 888-6602-440`.  
  - *ID:* `ADD-CLIENT-01` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**

---

### SPRINT B: INTERNAL COACH PRODUCT UX & LIFECYCLE
- **`TASK-INTERNAL-01`**: Refine `/assessments/new` with a contextual 2-tab switch: **Beginner (Delta % Mode)** vs. **Competitive (Benchmark Mode)** with plain Indonesian drill guidance (`CLIENT-REV-05`).  
  - *ID:* `CLIENT-REV-05` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**
- **`TASK-INTERNAL-02`**: Build custom Test Item & Physical Component CRUD modal in `/settings` (`CLIENT-REV-06`).  
  - *ID:* `CLIENT-REV-06` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**
- **`TASK-INTERNAL-03`**: Connect assessment deficit insights directly into the `/training-plans/new` workout builder (`CLIENT-REV-08`).  
  - *ID:* `CLIENT-REV-08` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**

---

### SPRINT C: PARENT PORTAL & REPORTING
- **`TASK-REPORT-01`**: Enhance PDF assessment report template in `/api/assessments/[id]/pdf` with 30-second summary format and 6–8 week coach recommendations (`CLIENT-REV-10`).  
  - *ID:* `CLIENT-REV-10` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**
- **`TASK-PORTAL-01`**: Add 1-click WhatsApp portal copy button next to each athlete in `/athletes` with prefilled greeting (`CLIENT-REV-12`).  
  - *ID:* `CLIENT-REV-12` | *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**

---

### SPRINT D: ATHLETE EXPERIENCE
- **`TASK-ATHLETE-01`**: Polish `/portal/[token]` Youthful Sports Performance hub with star rating progress and personal best achievement cards (`CLIENT-REV-11`).  
  - *ID:* `CLIENT-REV-11` | *Priority:* **`PRIORITAS 2`** | *Complexity:* **LOW** | *Status:* **READY**

---

### SPRINT E: MARKETING LANDING PAGE CONTENT (Sections 01–18 Copy)
- **`TASK-LANDING-01`**: Update Hero (Sec 01), Philosophy (Sec 02), Who We Help (Sec 03), Youth Performance (Sec 04) with client copy (`CLIENT-REV-01`, `02`, `03`, `04`).  
  - *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**
- **`TASK-LANDING-02`**: Update Sport Science (Sec 09), Coach Profile (Sec 14), Programs (Sec 15), Pricing (Sec 16), Testimonials (Sec 17), and Final WhatsApp CTA `+62 888-6602-440` (Sec 18) (`CLIENT-REV-09`, `14`, `15`, `16`, `17`, `18`).  
  - *Priority:* **`PRIORITAS 1`** | *Complexity:* **LOW** | *Status:* **READY**

---

### SPRINT F: VISUAL DESIGN POLISH (DEFERRED TO DEDICATED PHASE)
- Major layout refactoring, new typography imports, custom illustrations, and hero motion transitions remain **`DEFERRED`**.
