# CLIENT REVISION MASTER — AUTHORITATIVE REVISION REGISTRY

**Document Version:** 2.0.0 (Phase 3.1 Corrected Master Registry)  
**Authoritative Source:** `WEBSITE REVISION.docx`  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Executive Correction & Scope Architecture

> [!IMPORTANT]
> **Correction of Previous Revision Numbering:**  
> The previous documentation iteration incorrectly mapped internal engineering/backlog tasks (e.g., CSV export, decimal serialization, multi-tenant isolation) as `REV-001` through `REV-018`.  
> This document **supersedes** all prior revision lists and establishes the **18 exact sections of `WEBSITE REVISION.docx`** as the sole authoritative Client Revisions.

### Classification Architecture:
- **`MARKETING / LANDING PAGE`**: Public branding & showcase sections $\to$ **`PARKED — IMPLEMENT LAST`** (per Phase 3.1 Directive).
- **`INTERNAL COACH APPLICATION`**: Field coaching, assessment engine, program planning, analytics.
- **`PARENT / ATHLETE PORTAL`**: Stakeholder progress, personal bests, transparent development.
- **`GLOBAL RULES & GUIDELINES`**: Sections 19–22 governing messaging, ethics, and visual direction across the entire platform.
- **`NEW PRODUCT / ENGINEERING REQUIREMENTS`**: Technical architecture items (e.g., `REQ-AUTH-001`, multi-tenant isolation, CTE queries) tracked separately in engineering blueprints.

---

## 2. Master Client Priority Model

1. **`PRIORITAS 1 — WAJIB`**: Core positioning, philosophy, assessment paradigm, programs, pricing, portal, and final CTA.
2. **`PRIORITAS 2 — DISARANKAN`**: Target audience segmentation, coach profile, testimonials, sport science depth.
3. **`PRIORITAS 3 — PENYEMPURNAAN`**: Visual polish, motion cues, micro-interactions.

---

## 3. Client Revisions (Sections 01 — 18)

---

### Section 01 — HERO SECTION
- **Original Intent:** Redefine primary headline from generic physical test to youth athletic development & private training.
- **Client Requirement:** Emphasize individualized conditioning, movement foundation, and long-term athletic development for young athletes (6–14 yo).
- **Implementation Type:** `COPY CHANGE + LAYOUT CHANGE`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Retain current landing hero until internal product completion.

---

### Section 02 — PHILOSOPHY SECTION
- **Original Intent:** Establish the 6-stage development lifecycle: **Assess $\to$ Understand $\to$ Plan $\to$ Develop $\to$ Monitor $\to$ Reassess**.
- **Client Requirement:** Clarify that physical assessment is NOT the final product; it is an internal decision-making tool for individualized coaching.
- **Implementation Type:** `COPY CHANGE + PRODUCT UX PRINCIPLE`
- **Affected Area:** `MARKETING / LANDING PAGE` & `INTERNAL COACH APPLICATION`
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`IMPLEMENTED IN LOGIC / PARKED ON LANDING`**
- **Action:** Internal app enforces assessment-to-plan linkage; landing page copy parked.

---

### Section 03 — TAMBAHKAN BAGIAN "WHO WE HELP?"
- **Original Intent:** Segmentation of target users (Grassroots Young Athletes, Competitive Junior Athletes, Multi-Sport Kids, Parents seeking healthy development).
- **Client Requirement:** 4 clear profile cards explaining who benefits most from private sports conditioning.
- **Implementation Type:** `COPY CHANGE + UI COMPONENT`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Implement during final landing page sprint.

---

### Section 04 — YOUTH ATHLETE PERFORMANCE
- **Original Intent:** Focus on age-appropriate physical literacy (coordination, speed mechanics, jump-landing safety, agility) rather than adult gym lifting.
- **Client Requirement:** Educational section reassuring parents about safe, scientific youth training methods.
- **Implementation Type:** `CONTENT ASSET + COPY CHANGE`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 05 — BAGIAN ASSESSMENT — REVISI BESAR
- **Original Intent:** **MAJOR REVISION** — Decouple assessment from a rigid one-size-fits-all battery.
- **Client Requirement:**
  1. Assessment serves as coaching baseline, not standalone product.
  2. Differentiate Beginner (Delta progression) vs. Competitive (Normative benchmark scoring).
  3. Explain the "Why" behind each physical test to parents.
- **Implementation Type:** `FEATURE REFINEMENT + UX WIZARD + COPY`
- **Affected Area:** `INTERNAL COACH APPLICATION` (`/assessments/new`, `/assessments/[id]`) & `PARENT PORTAL`
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARTIALLY IMPLEMENTED (Engine Ready / Wizard UI Polish Needed)`**
- **Action:** Add explicit dual-mode toggle (Beginner vs Elite) on `/assessments/new` with test purpose cues.

---

### Section 06 — UBAH KONSEP 7 PARAMETER
- **Original Intent:** Clarify that the 7 physical components (Speed, Power, Agility, Flexibility, Endurance, Coordination, Strength) are development pillars, not a rigid mandatory battery for every single child on day one.
- **Client Requirement:** Modular assessment where coaches select relevant components based on athlete age, sport, and current training cycle.
- **Implementation Type:** `FEATURE FLEXIBILITY + SETTINGS CRUD`
- **Affected Area:** `INTERNAL COACH APPLICATION` (`/settings`, `/assessments`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARTIALLY IMPLEMENTED`**
- **Action:** Ensure `/settings` provides custom test item management and flexible component selection in assessment forms.

---

### Section 07 — REVISI BAGIAN "INJURY PREVENTION"
- **Original Intent:** Eliminate misleading medical claims ("bebas cedera 100%", "diagnosis medis").
- **Client Requirement:** Reframe as **Movement Quality, Landing Mechanics, and Physical Durability** to minimize risk.
- **Implementation Type:** `COPY CHANGE + CONTENT GUIDELINE`
- **Affected Area:** `MARKETING / LANDING PAGE` & `REPORTS`
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARKED ON LANDING / VERIFIED IN REPORTS`**
- **Action:** Parked for landing page; PDF reports verified free of medical diagnosis claims.

---

### Section 08 — UBAH "ASSESSMENT → PROGRAM"
- **Original Intent:** Seamless transition from physical assessment findings directly into tailored Training Plans.
- **Client Requirement:** When physical weaknesses are identified (e.g., lower limb power deficit), the system guides the coach to select corresponding exercise templates.
- **Implementation Type:** `WORKFLOW UX + TRAINING BUILDER`
- **Affected Area:** `INTERNAL COACH APPLICATION` (`/training-plans/new`, `/assessments/[id]`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`IMPLEMENTED`**
- **Action:** Retain direct plan creation link from assessment results.

---

### Section 09 — BAGIAN "SPORT SCIENCE"
- **Original Intent:** Demystify sports science for parents into practical language (Progressive Overload, Recovery, Movement Mechanics) without academic jargon.
- **Client Requirement:** 3 approachable pillars explaining how scientific principles guide training safely.
- **Implementation Type:** `COPY CHANGE + UI CARDS`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 10 — REVISI CONTOH ASSESSMENT REPORT
- **Original Intent:** Redesign sample assessment report for parents to be intuitive in 30 seconds.
- **Client Requirement:** Show visual spider radar chart, plain Indonesian explanations, and 6–8 week coach recommendations.
- **Implementation Type:** `REPORT UX + PDF GENERATOR`
- **Affected Area:** `INTERNAL COACH APPLICATION` (`/reports`, `/api/assessments/[id]/pdf`) & `PARENT PORTAL`
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`IMPLEMENTED`**
- **Action:** PDF generator active; polish layout styling with organization logo.

---

### Section 11 — BAGIAN PROGRESS REPORT
- **Original Intent:** Explain how ongoing progress is tracked and communicated to parents over 3, 6, and 12 months.
- **Client Requirement:** Historical progress tracking showing re-test deltas and personal best milestones.
- **Implementation Type:** `ANALYTICS UX + CHARTS`
- **Affected Area:** `INTERNAL COACH APPLICATION` (`/progress`) & `PARENT PORTAL`
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`IMPLEMENTED`**
- **Action:** 7-component progress charts active in `/progress` and portal.

---

### Section 12 — BAGIAN PARENT PORTAL
- **Original Intent:** Showcase transparent development for parents (Schedule, Attendance, Progress, Video Cues, Feedback).
- **Client Requirement:**
  1. Portal acts as a supporting transparency tool for coaching.
  2. Mobile-friendly passwordless token access (`/portal/[token]`).
  3. Star rating & qualitative feedback submission.
- **Implementation Type:** `PORTAL UX + STAKEHOLDER WORKFLOW`
- **Affected Area:** `PARENT / ATHLETE PORTAL` (`/portal/[token]`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`IMPLEMENTED`**
- **Action:** Fully operational; add direct WhatsApp portal share link from coach roster.

---

### Section 13 — BAGIAN "WHY US?"
- **Original Intent:** Differentiators (Certified Sports Conditioning Coach, Private 1-on-1 / Semi-Private Focus, Transparent Reporting, Long-term Development).
- **Client Requirement:** 4 core value proposition cards highlighting professional coaching standards.
- **Implementation Type:** `COPY CHANGE + UI GRID`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 14 — BAGIAN COACH PROFILE
- **Original Intent:** Highlight Head Coach credentials, sport science background, certifications, and coaching philosophy.
- **Client Requirement:** Trust-building bio section with coach photo, experience highlights, and training ethos.
- **Implementation Type:** `COPY CHANGE + PROFILE CARD`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 15 — BAGIAN PROGRAM
- **Original Intent:** Structure training offerings (1-on-1 Private Conditioning, Small Group Semi-Private, Pre-Season Conditioning, Movement Fundamentals).
- **Client Requirement:** Clear program pathway cards with target athlete profiles and session formats.
- **Implementation Type:** `COPY CHANGE + PRICING / PROGRAM CARDS`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 16 — BAGIAN HARGA
- **Original Intent:** Transparent pricing packages (Single Session, 4-Session Monthly, 8-Session Intensive, Assessment Package).
- **Client Requirement:** Clear package inclusions (assessment, custom plan, parent report, portal access).
- **Implementation Type:** `COPY CHANGE + PRICING TABLE`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 17 — BAGIAN TESTIMONIAL
- **Original Intent:** Real parent & young athlete feedback demonstrating increased speed, stamina, and confidence.
- **Client Requirement:** Testimonial cards with parent name, child sport, and tangible development quotes.
- **Implementation Type:** `COPY CHANGE + TESTIMONIAL CAROUSEL`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 2 — DISARANKAN`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

### Section 18 — BAGIAN CTA TERAKHIR
- **Original Intent:** Compelling final call-to-action inviting parents to book an Initial Physical Assessment & Consultation.
- **Client Requirement:** High-contrast WhatsApp booking CTA button and consultation form link.
- **Implementation Type:** `COPY CHANGE + CTA BANNER`
- **Affected Area:** `MARKETING / LANDING PAGE` (`/`)
- **Priority:** **`PRIORITAS 1 — WAJIB`**
- **Status:** **`PARKED — IMPLEMENT LAST`**
- **Action:** Parked for landing page sprint.

---

## 4. Global Guidelines & Rules (Sections 19 — 22)

### Section 19 — HAL-HAL YANG PERLU DIHINDARI DI SELURUH WEBSITE
- **Prohibited Claims:**
  - ❌ "Dijamin lari lebih cepat dalam 2 minggu" (Guaranteed instant results).
  - ❌ "Bebas cedera 100%" (Zero injury guarantees).
  - ❌ Medical diagnoses or clinical rehabilitation claims.
  - ❌ "Standar Internasional" without verifiable reference.
  - ❌ Overly aggressive gym/bodybuilding imagery for children.
- **Mandatory Terms:**
  - ✅ "Pengembangan Gerak Bertahap" (Progressive Movement Development).
  - ✅ "Membangun Fondasi Fisik & Daya Tahan" (Physical Foundation & Durability).
  - ✅ "Pendekatan Sesuai Usia & Kebutuhan Atlet" (Age-Appropriate Individualization).

### Section 20 — ARAHAN VISUAL WEBSITE
- **Visual Tone:** Professional + Athletic + Modern + Scientific + Approachable for Parents.
- **Imagery Context:** Youth athletes sprinting, jumping, landing safely, agility ladders, positive coach-athlete interaction.

### Section 21 — HIERARKI PESAN WEBSITE
- **Message Hierarchy:**
  1. *Who We Are & What We Do* (Private youth sports performance conditioning).
  2. *How We Work* (Assess $\to$ Understand $\to$ Plan $\to$ Develop $\to$ Monitor).
  3. *Why Trust Us* (Scientific foundation, qualified coaches, transparent parent reporting).
  4. *Action* (Book assessment & consultation).

### Section 22 — KESIMPULAN IMPLEMENTASI
- Align all platform touchpoints so that the web app feels like an integrated operational coaching ecosystem and digital athlete achievement hub.

---

## 5. New Product Requirements (Tracked Separately)

- **`REQ-AUTH-001` (Dual Access Model for Parents/Athletes)**:
  - *Mode A:* Direct secure token link (`/portal/[token]`) for instant zero-friction access.
  - *Mode B:* Optional credential login (Username/Email + Password) for multi-device households.
  - *Status:* **`REQUIRES PRODUCT DECISION`** (Token link is currently 100% operational).
- **`REQ-PROV-001` (Admin User Provisioning)**:
  - Admin panel capability in `/settings` to invite Assistant Coaches with role assignment.
  - *Status:* **`IMPLEMENTED IN LOGIC / UI POLISH`**.
- **`REQ-EMAIL-001` (Transactional Email Integration)**:
  - Resend / SMTP configuration for password reset tokens and coach invitations.
  - *Status:* **`READY (Awaiting Production Credentials)`**.

---

## 6. Authoritative Revision Summary

| Category | Section IDs | Primary Action |
| :--- | :--- | :--- |
| **Marketing / Landing Page** | 01, 03, 04, 07, 09, 13, 14, 15, 16, 17, 18 | **PARKED — IMPLEMENT LAST** |
| **Internal Coach App** | 02, 05, 06, 08, 10, 11 | **ACTIVE / POLISH REFINEMENTS** |
| **Parent / Athlete Portal** | 05, 10, 11, 12 | **ACTIVE / OPERATIONAL** |
| **Global Rules** | 19, 20, 21, 22 | **ACTIVE GOVERNANCE** |
