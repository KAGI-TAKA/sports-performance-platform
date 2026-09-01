# PHASE 3C — REAL BROWSER EXPERIENCE CHECKLIST

**Document Version:** 1.0.0 (Phase 3C Browser Audit Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Public & Marketing Pages
- [x] **Landing Page (`/`):** Loads with core message *"BUILD THE ATHLETE BEFORE CHASING PERFORMANCE."*
- [x] **Hero Section:** Clear youth S&C positioning + working WhatsApp consultation button.
- [x] **Two-Program Comparison:** Youth Athlete Performance vs. Multilateral Athletic Development side-by-side.
- [x] **Pricing Transparency:** Accurate pricing for YAP (150k/200k/225k/260k) and MFD (125k/170k/50k).
- [x] **Coach Zulfi Profile:** Official Level 2, Level 1, and PSSI D coaching licenses displayed.
- [x] **Login Page (`/login`):** Clean branding, accessible email/password inputs, rate limiting protection.

---

## 2. Internal Coach Workspace
- [x] **Dashboard (`/dashboard`):** Operational cockpit displaying today's sessions, attendance, and overdue re-tests.
- [x] **Athletes Directory (`/athletes`):** Roster listing, filters, dynamic BMI calculation, and 1-click WhatsApp portal sharing.
- [x] **Athlete Profile (`/athletes/[id]`):** Spider radar charts, personal best cards, injury log, and portal manager.
- [x] **Assessments List (`/assessments`):** Filter by athlete/category, delta score badges, and PDF download buttons.
- [x] **New Assessment Wizard (`/assessments/new`):** Dual-mode switch (Progress Delta % vs Benchmark Scoring) with plain drill instructions.
- [x] **Schedule Matrix (`/schedule`):** Weekly calendar, conflict detection, recurring sessions, and assistant assignment.
- [x] **Session Execution (`/session-logs`):** Real-time drill stopwatch, fatigue check, and field notes logger.
- [x] **Training Plans (`/training-plans`):** Workout builder connected to athlete-specific physical deficit areas.
- [x] **Progress Analytics (`/progress`):** Dynamic multi-period progress curves and squad radar comparisons.
- [x] **Reports Engine (`/reports`):** Batch PDF generator and instant WhatsApp progress sharing.
- [x] **Compare Tool (`/compare`):** Multi-athlete spider radar overlay and percentile rankings.
- [x] **Settings (`/settings`):** Club profile, coach invitations, and direct link to `/benchmarks` for test items.

---

## 3. Parent & Youth Athlete Portal
- [x] **Parent Portal (`/portal/[token]`):** Token access, attendance log, training focus explanation, star feedback form.
- [x] **Youth Athlete Experience:** Personal best badges, 5-star rating progress, and coach video guidance.
- [x] **Share-Safe Data Boundary:** Zero internal coach notes or admin settings exposed to parents.

---

## 4. Communication & CTA Channels
- [x] **WhatsApp Consultation Link:** Points strictly to `https://wa.me/628886602440` (`+62 888-6602-440`).
- [x] **PDF Assessment Stream:** Accessible via `/api/assessments/[id]/pdf` with clean 2-page parent-friendly layout.
