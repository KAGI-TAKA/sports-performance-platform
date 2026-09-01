# PHASE 3A — CLIENT PRODUCT REVISION MASTER PLAN

**Document Version:** 1.0.0 (Phase 3A Authoritative Planning Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Lead Architect & Planner:** Antigravity AI  
**Authoritative Sources:** `WEBSITE REVISION.docx` + Additional Client Brief (Coach Zulfi Profile, S&C Certifications, Pricing, Programs, Coaching Philosophy)  
**Status:** **PLANNING ONLY (Awaiting User Approval for Phase 3B)**

---

## 1. Executive Summary & Brand Positioning

### Core Philosophy & Positioning
- **Primary Brand Message:** **"BUILD THE ATHLETE BEFORE CHASING PERFORMANCE."**
- **Domain Identity:** **Youth Athletic Development & Strength & Conditioning Platform**.
- **Coaching Lifecycle Paradigm:**
  $$\text{Assess} \longrightarrow \text{Understand / Identify} \longrightarrow \text{Plan} \longrightarrow \text{Develop} \longrightarrow \text{Monitor} \longrightarrow \text{Reassess}$$
- **Key Realignment:** Physical assessment is **NOT** a standalone testing product; it is an internal diagnostic and decision-making tool for individualized coaching.
- **Visual & Tone Principle:** Professional, athletic, modern, scientific, and approachable for parents. Strictly avoids adult bodybuilding/gym imagery and preschool cartoon tropes.

---

## 2. Two Primary Program Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                    STRUCTURED TRAINING OFFERINGS                                   |
+-------------------------------------------------+--------------------------------------------------+
| PROGRAM A: YOUTH ATHLETE PERFORMANCE            | PROGRAM B: MULTILATERAL ATHLETIC DEVELOPMENT     |
+-------------------------------------------------+--------------------------------------------------+
| • Target: Children 8–16 with sports background  | • Target: Children 6–12 building fundamentals   |
| • Focus: Speed, Power, Agility, Deceleration,   | • Focus: Running, Jumping, Landing, Balance,     |
|   Sprint Mechanics, Jump-Landing Durability     |   Coordination, Spatial Awareness, Literacy      |
| • Objective: Enhance sport performance safely   | • Objective: Build complete athletic foundation  |
| • Formats & Pricing:                            | • Formats & Pricing:                             |
|   - Individual: Rp150.000 / session             |   - Individual: Rp125.000 / session              |
|   - Duo (2 athletes): Rp200.000 / session       |   - Duo (2 children): Rp170.000 / session        |
|   - Trio (3 athletes): Rp225.000 / session      |   - Group (max 8 children): Rp50.000 / anak/sesi |
|   - Small Group (4 athletes): Rp260.000 / ses   |                                                  |
+-------------------------------------------------+--------------------------------------------------+
```

---

## 3. Head Coach Profile & Certified Credentials

- **Coach Identity:** **Coach Zulfi** — *Youth Athletic Development & Strength & Conditioning Coach*
- **Philosophy:** *Quality over Quantity*, individualized progression, long-term athletic development (LTAD).
- **Official Certifications & Coaching Licenses (Strict Order):**
  1. **National Level 2 Strength & Conditioning Coach** — *LANKOR – ICCA*
  2. **National Level 1 Strength & Conditioning Coach** — *LANKOR – ICCA*
  3. **PSSI National D Football Coaching License** — *PSSI*
- **Primary Consultation WhatsApp Contact:** `+62 888-6602-440` (`https://wa.me/628886602440`)

---

## 4. Claims & Terminology Governance Plan

### A. Prohibited Marketing & Technical Claims:
- ❌ *"Bebas cedera 100%"* / *"Mencegah cedera pasti"* $\longrightarrow$ Replace with: **"Movement Quality, Landing Mechanics & Physical Durability"**
- ❌ Medical diagnoses or clinical injury treatment claims $\longrightarrow$ Scope restricted strictly to **Physical Capacity & Conditioning**.
- ❌ *"Standar Internasional"* without citation $\longrightarrow$ Replace with: **"Normative Youth Athletic Benchmarks & Progressive Delta Tracking"**.
- ❌ *"Pasti lebih cepat dalam 2 minggu"* $\longrightarrow$ Replace with: **"Structured, Monitored Long-Term Progression"**.

---

## 5. Domain-by-Domain Implementation Architecture

### A. Internal Coach Workspace (`/(app)/*`)
1. **Assessment Reframing (`/assessments/new`):**
   - Provide an explicit 2-tier mode switch: **Beginner (Progress Delta %)** vs. **Competitive (Benchmark Scoring)**.
   - Include test purpose guidance (e.g. *"Sit & Reach: Mengukur fleksibilitas rantai posterior untuk efisiensi gerak"*).
2. **Assessment $\to$ Training Plan Linkage (`/training-plans/new`):**
   - Automatically surface identified physical deficits from recent assessments to suggest tailored workout templates.
3. **Operational Dashboard (`/dashboard`):**
   - Reorganize actionable widgets around the lifecycle (Today's Sessions $\to$ Attendance $\to$ Unlogged Workouts $\to$ Overdue Re-tests).

### B. Parent Experience & Reporting
1. **Report Simplification (`/reports`, `/api/assessments/[id]/pdf`):**
   - 30-second readability: Visual spider radar chart + 3 plain Indonesian key takeaways + 6–8 week coach recommendations.
2. **1-Click WhatsApp Portal Dispatch (`/athletes`):**
   - Coach roster provides immediate WhatsApp link copy with personalized parent greetings.

### C. Youth Athlete Portal (`/portal/[token]`)
1. **Youthful Sports Performance Hub:**
   - Clean, gamified card interface: Personal bests, achievement stars (1–5 scale), upcoming training reminder, and coach video feedback.

### D. Marketing Landing Page (`/` — PARKED FOR PHASE 3B CONTENT)
1. **Content & Copy Realignment:**
   - Update 18 sections with client-provided text (Hero, Philosophy, Programs, Pricing, Coach Zulfi bio, WhatsApp CTA `+62 888-6602-440`).
   - Major visual CSS/layout redesign is **DEFERRED**.
