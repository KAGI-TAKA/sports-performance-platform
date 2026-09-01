# DOCUMENTATION CONFLICTS & RESOLUTION RECORD

**Document Version:** 1.0.0  
**Phase:** Phase 1 — System Blueprint & Vibe Coding Foundation  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Requirement Conflict Hierarchy

In accordance with Section 6 of the architecture specification, all requirements are evaluated against the following strict precedence hierarchy:

1. **Explicit Client Revision Document (`WEBSITE REVISION` / Blueprint)**
2. **Verified Domain Business Rules & Validated Algorithms**
3. **Verified Existing Application Behavior (Tested Runtime)**
4. **Existing Implementation Codebase**
5. **Engineering Inference / AI Assumptions**

---

## 2. Documented Conflict Registry

### CONFLICT-01: Basketball-Specific Fields vs. Multi-Sport Neutrality
- **Source A (Legacy Schema / Initial Code):** `AthletePosition` enum (`POINT_GUARD`, `SHOOTING_GUARD`, `CENTER`, etc.) was originally a required field on athlete profiles.
- **Source B (Explicit Client Revision REV-003):** Client requested platform neutrality to support basketball, soccer, badminton, track & field, and general athletic conditioning.
- **Impact:** Form validations and filters previously failed if an athlete was not assigned a basketball position.
- **Resolution:** `AthletePosition` has been set to default to `UNSPECIFIED` and made optional in UI forms. A new `sportCategory` string field was added to allow freeform multi-sport categorization.
- **Status:** **RESOLVED & VERIFIED IN RUNTIME**.

---

### CONFLICT-02: Single Assessment Model vs. Dual Beginner/Elite Paradigm
- **Source A (Initial Implementation):** Assessments always required benchmark thresholds (A/B/C/D) to calculate scores.
- **Source B (Client Revision REV-001):** Beginner youth athletes (ages 6–9) should NOT be evaluated against rigid elite benchmarks; they require **Progress-Based Assessment (Delta % and Trend Improvements)** between pre-test and post-test. Elite athletes continue to use **Benchmark-Based Assessment**.
- **Impact:** Beginner athletes received "D" or failing grades on elite standards, causing negative psychological impact on young athletes.
- **Resolution:** Added `AssessmentType` enum (`PROGRESS_BASED` vs `BENCHMARK_BASED`) and created two distinct deterministic scoring engines (`calculateProgressAssessmentEngine` vs `calculateAssessmentEngine`).
- **Status:** **RESOLVED IN ENGINE & SCHEMA; FORM WIZARD UI READY FOR POLISH**.

---

### CONFLICT-03: Theoretical Stack Replacement vs. Empirical Optimization Evidence
- **Source A (Early AI Inference):** Speculated that Next.js App Router might be inherently slow and suggested rewriting the backend in Fastify or Go.
- **Source B (Phase 0.5 Measured Empirical Evidence):** Next.js Turbopack server breakdown proves Next.js framework overhead is only **7ms–18ms**, while unaggregated remote PostgreSQL queries account for **95%–98% (1,000ms+)** of server wait time.
- **Impact:** Rebuilding in Go/Fastify would cost weeks of engineering, discard 472 passing unit tests, and STILL suffer from the same latency if the queries were not aggregated.
- **Resolution:** Rebuild and stack replacement firmly rejected. Final decision ratified as **Option B: Targeted Partial Refactor & Query Consolidation**.
- **Status:** **RESOLVED & DOCUMENTED IN TECHNOLOGY-DECISION.MD**.

---

### CONFLICT-04: Session Log Auto-Generation Lifecycle
- **Source A (Prisma Relation):** `ScheduleSession` and `SessionLog` are 1-to-1 or 1-to-many separate records.
- **Source B (Coach On-Field UX):** When a coach marks a schedule session as "COMPLETED", they expect to immediately enter attendance and notes without navigating away to a separate menu.
- **Impact:** Past sessions remained unlogged, creating false operational alerts on the dashboard.
- **Resolution:** Created direct transition cockpit (`/schedule/[id]/execute`) allowing live attendance marking, field stopwatch timing, and instant `SessionLog` creation upon session completion.
- **Status:** **RESOLVED & VERIFIED**.
