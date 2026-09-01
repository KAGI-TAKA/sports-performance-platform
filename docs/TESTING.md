# TESTING STRATEGY, BASELINE & DEFINITION OF DONE

**Document Version:** 2.0.0 (Consolidated Single Source of Truth)  
**Testing Framework:** Vitest 4.1.10 (`@vitest/coverage-v8`)  
**Verified Baseline:** **472 Tests Passing across 31 Suites (100% Pass Rate)**  
**Date:** September 2026

---

## 1. The Quality Baseline Rule

> [!IMPORTANT]
> **BASELINE PRESERVATION RULE: 472/472 PASSING TESTS MUST BE MAINTAINED AT ALL TIMES.**
> Existing unit and integration tests validate the core mathematical algorithms of the physical assessment scoring engine, schedule conflict collision detection, recurrence rules, portal achievements, and security headers.
> **NEVER DELETE, SKIP (`.skip`), OR WEAKEN TESTS TO MAKE A TASK PASS.**

---

## 2. Test Suite Architecture & Coverage

| Feature Module | Test Suite Path | Tests | Key Domain Rules Validated |
| :--- | :--- | :---: | :--- |
| **Assessment Scoring Engine** | `src/features/assessments/engine.test.ts` | 24 | Baseline delta, percentile calculation, score direction (`HIGHER_IS_BETTER` vs `LOWER_IS_BETTER`), grade mapping (A/B/C/D), recommendation generation. |
| **Squad Assessment Matrix** | `src/features/assessments/squad-matrix.test.ts`| 14 | 7-component squad average radar, historical score aggregation, sorting and filtering. |
| **Schedule Conflict Engine** | `src/features/schedule/conflict-engine.test.ts` | 19 | Overlapping coach/athlete timeslots, buffer times, multi-coach conflict detection. |
| **Schedule Recurrence Engine**| `src/features/schedule/recurrence-engine.test.ts`| 12 | Weekly recurrence expansions, boundary dates, exception handling. |
| **Schedule Verification** | `src/features/schedule/p7-b5-final-verification.test.ts`| 27 | Comprehensive end-to-end schedule lifecycle, clone operations, filter engines. |
| **Coaching Intelligence Engine**| `src/features/coaching-intelligence/engine.test.ts`| 29 | Re-test overdue thresholds (>60 days), coach workload period calculations, session health states. |
| **Portal Achievements & Stars** | `src/features/portal/achievements.test.ts` | 12 | 1-5 star achievement calculations, milestone badges, youth card progress. |
| **Portal Business Engine** | `src/features/portal/engine.test.ts` | 8 | Token verification, personal best resolutions, parent feedback threads. |
| **Parent Feedback & Rating** | `src/features/parent-feedback/engine.test.ts` | 23 | 5-star validation, feedback submission, coach response threads. |
| **Parent Feedback E2E Flow** | `src/features/parent-feedback/p5-e2e.test.ts` | 18 | Multi-step parent portal feedback lifecycle. |
| **Attendance & Field Tracking**| `src/features/attendance/engine.test.ts` | 21 | Present, Absent, Sick, Excused status transitions and session logs. |
| **Athlete Goal Milestone Engine**| `src/features/athlete-goals/engine.test.ts` | 17 | Automatic goal achievement validation from assessment score updates. |
| **Athlete Compare Engine** | `src/features/compare/compare-engine.test.ts` | 21 | Head-to-head comparison, radar overlay, historical delta mapping. |
| **Progress Reporting Engine** | `src/features/reports/progress-reporting.test.ts` | 23 | Progress PDF template data formatting, WhatsApp markdown generator. |
| **Dashboard Resilience** | `src/features/dashboard/dashboard-resilience.test.ts` | 6 | Graceful degradation on partial query failures; zero white-screen crashes. |
| **Command Palette Search** | `src/features/command-palette/command-palette.test.ts`| 18 | Fuzzy search scoring, keyboard navigation, debounced action execution. |
| **Security Headers & CSP** | `src/features/auth/security-headers.test.ts` | 13 | CSP, X-Frame-Options, HSTS, blob workers whitelist for PDF rendering. |
| **Auth & Password Reset** | `src/features/auth/auth-reset.test.ts` | 9 | Email reset rate limiting, token expiration, password validation. |

---

## 3. Mandatory Quality Gateways & Definition of Done (DoD)

A task is strictly **NOT COMPLETE** until all 10 gateways are satisfied:

1. **Requirement Met:** Validated against PRD and `CLIENT-REVISION.md`.
2. **Tests Pass:** All 472 unit tests pass (`npm test`).
3. **Type Safety:** 0 TypeScript compilation errors (`npm run typecheck`).
4. **Linting:** 0 ESLint violations (`npm run lint`).
5. **Multi-Tenant Isolation:** `organizationId` scoping strictly enforced at data layer.
6. **Zod Validation:** 100% of mutation inputs parsed with `.safeParse()`.
7. **Performance Benchmark:** Validated via `scratch/run_full_route_benchmark.ts` when queries or UI are modified.
8. **Documentation Updated:** `docs/` updated to reflect changes.
9. **File Reporting:** All modified and created files reported with file links.
10. **Limitations & Risks Documented:** Known constraints and rollback steps recorded.
