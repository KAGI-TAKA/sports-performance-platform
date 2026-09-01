# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Product Name:** Sports Performance & Athlete Development Platform (Working Title: **Kinetiq** / **Power Up Private Training**)  
**Document Version:** 2.0.0 (Phase 1 Validated Single Source of Truth)  
**Status:** Approved Architectural Baseline  
**Date:** September 2026

---

## 1. Product Overview & Vision

Platform **Kinetiq** is a digital **Sports Performance & Youth Athletic Development Ecosystem** designed to bridge the operational workflow of Strength & Conditioning coaches (*Coach*), the motivational athletic identity of youth athletes age 6–14 (*Athlete*), and the transparency needs of parents (*Parent*).

The platform functions as:
1. **Coach Pocket Operations Command Center:** An ultra-fast, mobile-optimized operational workspace to manage schedules, log attendance, execute physical testing, and automate report generation.
2. **Youth Athlete Performance Card & Portal:** A visual, aspirational, gamified personal profile ("Athlete Card") that displays personal bests, milestone stars, badges, and exercise video clips without feeling like a preschool cartoon.
3. **Parent Transparency & Progress Hub:** 1-click professional PDF reports and instant WhatsApp progress summaries detailing physical growth, biometric metrics, and 6–8 week coach prescriptions.

---

## 2. Business Objectives & Outcomes

1. **Eliminate Operational Overhead:** Reduce coach administrative time by **> 80%** (< 2 minutes per assessment input; 1-click PDF/WhatsApp report generation).
2. **Increase Private Training Retention:** Elevate client engagement and renewal rates through professional, transparent, and quantifiable progress reporting.
3. **Scalable Multi-Tenant Foundation:** Support scaling from 1-on-1 private training (16–30 athletes) to multi-coach academy training (500+ athletes across multiple organizations).

---

## 3. Target Users & Personas

### 3.1 Coach (Head Coach & Assistant Coach)
- **Role:** Leads physical testing, builds training plans, schedules sessions, marks field attendance, logs workouts.
- **Environment:** Active outdoors on sports fields / gyms using mobile smartphones and desktop workstations in office.
- **Key Pain Points:** Slow mobile connections, complex multi-step forms, uncoordinated WhatsApp messages, manual Excel calculations.

### 3.2 Youth Athlete (Ages 6–14)
- **Role:** Views upcoming sessions, celebrates personal bests, unlocks star badges, reviews exercise technique videos.
- **Tone & Aesthetic:** **Youthful Sports Performance** — dynamic, bold, sporty, aspirational. Not preschool/cartoonish.
- **Key Pain Points:** Bored by dense numerical tables; needs visual athletic identity and clear milestone progression.

### 3.3 Parent (Client Guardian)
- **Role:** Reviews child's physical development ROI, confirms schedule appointments, submits qualitative feedback.
- **Key Pain Points:** Lack of visibility into training progress; confusion over complex scientific jargon without explanations.

---

## 4. User Roles & Permission Matrix (RBAC)

| Permission Area | Admin (`admin`) | Head Coach (`head_coach`) | Assistant Coach (`assistant_coach`) | Athlete / Parent (`PortalAccess`) |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Organization & Billing** | Full | None | None | None |
| **Invite & Manage Coaches** | Full | None | None | None |
| **Create & Edit Athlete Profiles** | Full | Full | View Only (or Assigned) | View Own Profile |
| **Configure Components & Benchmarks** | Full | Full | Read Only | None |
| **Conduct & Submit Physical Assessments**| Full | Full | Create / Submit | View Own Reports |
| **Build & Edit Training Plans** | Full | Full | View Only | View Assigned Plans |
| **Schedule Sessions & Collision Checks** | Full | Full | Create / Assigned | View Own Schedule |
| **Mark Field Attendance & Stopwatch** | Full | Full | Full | None |
| **Generate PDF & WhatsApp Reports** | Full | Full | Full | Download Own PDF |
| **Submit Parent Feedback & Ratings** | View / Respond | View / Respond | View / Respond | Submit Feedback |

---

## 5. Functional Requirements (P0 & P1)

### Module 1: Multi-Tenant Workspace & Authentication
- **[REQ-001] Multi-Tenant Data Isolation (P0 | REV-016):** All core database records must be explicitly scoped by `organizationId`. Cross-tenant data leakage is strictly prohibited.
- **[REQ-002] Better Auth Session Management (P0 | REV-016):** Secure session cookies with rate limiting on auth endpoints (login, forgot-password, reset-password).
- **[REQ-003] Request-Scoped Auth Context (P0 | REV-010):** `requireOrgContext()` must retrieve and cache `userId`, `memberId`, `organizationId`, and `role` within `React.cache`.

### Module 2: Coach Command Center & Dashboard
- **[REQ-004] Level 1 Operational Attention Bar (P1 | REV-011):** Highlights unlogged past sessions, active unrecovered injuries, draft assessments, and overdue physical re-tests.
- **[REQ-005] Level 2 Today's Field Agenda (P0 | REV-011):** Chronologically sorted list of today's scheduled training sessions with direct link to the live execution cockpit.
- **[REQ-006] Level 3 Re-Test & Workload Intelligence (P1 | REV-011):** Automated detection of athletes exceeding 60-day testing intervals and coach workload distribution charts.
- **[REQ-007] Level 4 Squad Physical Profile (P1 | REV-003):** 7-component squad average radar visualization and active athlete quick directory.

### Module 3: Physical Assessment & Scoring Engine
- **[REQ-008] Dual Assessment Paradigm (P0 | REV-001):**
  - **Type A (Progress-Based / Beginner):** Calculates baseline, raw delta, percentage improvement, and qualitative trends (`IMPROVED`, `STABLE`, `DECLINING`) without external benchmarks.
  - **Type B (Benchmark-Based / Elite):** Converts raw scores to 0–100 scaled scores based on directional scoring (`HIGHER_IS_BETTER` vs `LOWER_IS_BETTER`) and age/gender benchmark thresholds (`thresholdA` to `thresholdD`).
- **[REQ-009] Configurable Assessment Components (P0 | REV-002):** Full CRUD on physical components (Flexibility, Speed, Power, Agility, Muscular Endurance, Anaerobic Endurance, Aerobic Endurance) and custom test items.
- **[REQ-010] Automated Recommendation Engine (P0 | REV-001):** Automatically identifies the athlete's strongest physical attribute, weakest areas, and generates actionable 6–8 week training recommendations.

### Module 4: Athlete Roster & Injury Tracking
- **[REQ-011] Multi-Sport Athlete Profile (P0 | REV-003):** Manage athlete biometrics (Height, Weight, BMI, Wingspan), DOB, training level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ELITE`), and sport category.
- **[REQ-012] Injury & Recovery Tracker (P0 | REV-011):** Log athlete injury type, date, severity, and active/recovered status with automatic alert badges across all training sessions.

### Module 5: Training Plans, Scheduling & Live Execution
- **[REQ-013] Exercise Library & Program Builder (P1 | REV-009):** Reusable exercise database with sets, reps, rest intervals, and YouTube video reference links.
- **[REQ-014] Timezone-Aware Collision Detection Engine (P0 | REV-008):** Real-time conflict validation preventing double-booking of coaches or athletes in overlapping timeslots (`Asia/Jakarta` reference).
- **[REQ-015] Live Session Execution Cockpit (P1 | REV-017):** Field-ready mobile interface with interactive digital stopwatch, attendance checklist, and 1-click `SessionLog` submission upon completion.

### Module 6: Athlete & Parent Gamified Portal
- **[REQ-016] Token-Based Lightweight Access (P0 | REV-005):** Zero-friction portal access via secure SHA-256 token URL (`/portal/[token]`) with expiration and revocation controls.
- **[REQ-017] Youth Athlete Card & Milestone Achievements (P1 | REV-004):** Visual sporty athlete card featuring 1–5 star ratings, personal best badges, upcoming sessions, and assigned training programs.
- **[REQ-018] Parent Feedback & Rating System (P1 | REV-012):** Interactive 5-star rating and comment submission directly from the portal.

### Module 7: Reporting & Export Hub
- **[REQ-019] One-Click Streamed PDF Report (P0 | REV-006):** Clean, branded PDF generated via `@react-pdf/renderer` containing athlete bio, radar chart, test scores, and coach prescription.
- **[REQ-020] Instant WhatsApp Share Generator (P0 | REV-007):** Preformatted markdown message generator opening `wa.me` in one click with zero external API fees.
- **[REQ-021] CSV Data Export (P1 | REV-015):** UTF-8 BOM CSV export for athletes, sessions, logs, and assessment data.

---

## 6. Non-Functional Requirements

### 6.1 Performance (Measured Baseline & Targets)
- **Target Server TTFB:** **< 150ms** on all authenticated routes (down from 1,067ms baseline).
- **Target Shell FCP:** **< 80ms** via React 19 Streaming Suspense.
- **Target Client Bundle:** **< 500KB** initial JS payload (via dynamic ECharts code-splitting).
- **Mobile Interaction Lock (INP):** **< 80ms** on 4x CPU-throttled mobile devices.

### 6.2 Security & Compliance
- **Tenant Scoping:** Zero cross-tenant data leaks enforced at query and server action layers.
- **Token Security:** SHA-256 hashing on all portal access tokens; constant-time token comparison.
- **Input Sanitization:** Strict Zod validation on 100% of Server Action payloads and API endpoints.

### 6.3 Reliability & Resilience
- **Zero N+1 Query Regressions:** All queries must use consolidated batching.
- **Test Integrity:** All 472 existing unit tests across 31 test suites must pass continuously.

---

## 7. Out of Scope (Non-Goals)

- Live GPS / Wearable sensor streaming integration (deferred to future hardware phase).
- Multi-currency payment gateway billing (deferred; current subscription is manual).
- Full mobile native apps (iOS/Android IPA/APK) — the target is a responsive Progressive Web App (PWA).
