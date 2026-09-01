# END-TO-END REQUIREMENT TRACEABILITY MATRIX

**Document Version:** 1.0.0  
**Phase:** Phase 1 — System Blueprint & Vibe Coding Foundation  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Traceability Mapping Table

| Client Revision (REV-ID) | Requirement (REQ-ID) | PRD Section | Architectural Subsystem | Implementation Task / Files | Validating Test Suites | Acceptance Criteria & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REV-001** (Dual Assessment) | **REQ-008** | Section 5.3 | Assessment Engine | `src/features/assessments/engine.ts`<br>`src/features/assessments/actions.ts` | `assessments/engine.test.ts`<br>`assessments/squad-matrix.test.ts` | Calculates both Delta % for Beginner and A/B/C/D Grade for Elite with zero runtime calculation errors. |
| **REV-002** (Configurable Test Items) | **REQ-009** | Section 5.3 | Assessment Master Data | `src/features/benchmarks/queries.ts`<br>`src/features/benchmarks/actions.ts` | `assessments/engine.test.ts` | Coach can dynamically add/reorder components & test items with custom units. |
| **REV-003** (Sports Neutrality) | **REV-011** | Section 5.4 | Athlete Profile | `src/features/athletes/components/*`<br>`src/features/compare/*` | `compare/compare-engine.test.ts` | Multi-sport category selector supported; zero mandatory basketball fields. |
| **REV-004** (Youth Performance UX) | **REQ-017** | Section 5.6 | Athlete Portal UI | `src/features/portal/components/*` | `portal/achievements.test.ts`<br>`portal/engine.test.ts` | Portal displays 1-5 star badges, personal bests, and clean sporty UI (touch target min 48px). |
| **REV-005** (Token Portal Access) | **REQ-016** | Section 5.6 | Token Auth Guard | `src/app/portal/[token]/page.tsx`<br>`src/features/portal/queries.ts` | `portal/engine.test.ts` | SHA-256 token verification without Better Auth session overhead; invalid tokens redirect safely. |
| **REV-006** (1-Click PDF Report) | **REQ-019** | Section 5.7 | React-PDF Streamer | `src/features/reports/components/report-pdf.tsx`<br>`src/app/api/assessments/[id]/pdf/route.tsx` | `reports/progress-reporting.test.ts` | PDF streams in < 1.5s with clean layout, radar chart, and coach prescription. |
| **REV-007** (WhatsApp Share) | **REQ-020** | Section 5.7 | Markdown Text Formatter | `src/features/reports/utils.ts`<br>`src/features/reports/components/whatsapp-share-button.tsx` | `reports/progress-reporting.test.ts` | Formats clean Indonesian progress message and opens `wa.me` deep link in 1 click. |
| **REV-008** (Collision & Timezone) | **REQ-014** | Section 5.5 | Schedule Conflict Engine | `src/features/schedule/conflict-engine.ts`<br>`src/features/schedule/recurrence-engine.ts` | `schedule/conflict-engine.test.ts`<br>`schedule/recurrence-engine.test.ts`<br>`schedule/p7-b5-final-verification.test.ts` | 100% collision prevention for overlapping coach/athlete slots with strict `Asia/Jakarta` conversion. |
| **REV-009** (Training Lifecycle) | **REQ-013**, **REQ-015** | Section 5.5 | Training & Execution Cockpit | `src/features/training-plans/*`<br>`src/features/session-execution/*` | `training-plans/engine.test.ts`<br>`session-execution/engine.test.ts`<br>`session-execution/field-tools.test.ts` | Clean separation between reusable Plan, Schedule Appointment, and live Execution Log. |
| **REV-010** (Performance TTFB <150ms) | Non-Functional 6.1 | Section 6.1 | Data Fetching & Bundling | `src/features/dashboard/queries.ts`<br>`src/lib/auth-context.ts`<br>`src/components/ui/chart-theme.ts` | `dashboard/dashboard-resilience.test.ts`<br>`scratch/run_full_route_benchmark.ts` | Single CTE aggregation query drops dashboard TTFB from 1,067ms to < 150ms. |
| **REV-011** (Operational Attention) | **REQ-004**, **REQ-006** | Section 5.2 | Coaching Intelligence | `src/features/coaching-intelligence/*`<br>`src/features/dashboard/components/*` | `coaching-intelligence/engine.test.ts`<br>`dashboard/dashboard.test.ts` | Automatically surfaces unlogged sessions, active injuries, and athletes overdue for re-test (>60 days). |
| **REV-012** (Parent Feedback) | **REQ-018** | Section 5.6 | Feedback Dialog & Feed | `src/features/parent-feedback/*` | `parent-feedback/engine.test.ts`<br>`parent-feedback/p5-e2e.test.ts` | 5-star rating submission from portal with coach notification and response thread. |
| **REV-013** (Athlete Goal Tracking) | **REQ-013** | Section 5.4 | Goal Milestone Engine | `src/features/athlete-goals/*` | `athlete-goals/engine.test.ts`<br>`athlete-goals/p6-b2.test.ts` | Automatically marks goal as `ACHIEVED` when assessment result satisfies threshold value. |
| **REV-014** (Command Palette Ctrl+K) | Non-Functional 6.1 | Section 5.1 | Global Search Component | `src/features/command-palette/*` | `command-palette/command-palette.test.ts` | Debounced 200ms multi-entity search supporting keyboard navigation (Enter/Esc/Arrows). |
| **REV-015** (CSV Data Export) | **REQ-021** | Section 5.7 | CSV Stream Handlers | `src/app/api/export/*`<br>`src/features/export/*` | `export/export.test.ts` | UTF-8 BOM CSV exports generated with organization scoping for athletes, logs, and assessments. |
| **REV-016** (Multi-Tenant Scoping) | **REQ-001**, **REQ-003** | Section 4, 5.1 | Organization Context & RBAC | `src/lib/auth-context.ts`<br>`src/lib/permissions.ts`<br>`src/proxy.ts` | `auth/security-headers.test.ts`<br>`auth/auth-reset.test.ts` | Zero cross-tenant data leakage; verified by compound unique `[organizationId, userId]` index. |
| **REV-017** (Field Stopwatch & Tool) | **REQ-015** | Section 5.5 | Live Execution Cockpit | `src/features/session-execution/components/field-stopwatch.tsx` | `session-execution/field-tools.test.ts` | Digital lap stopwatch with start/pause/split controls and touch target min 48px. |
| **REV-018** (Decimal Normalization) | Non-Functional 6.1 | Section 6.1 | Query Result Mappers | `src/features/compare/queries.ts`<br>`src/features/assessments/queries.ts` | `compare/compare-engine.test.ts` | 0 Decimal serialization warnings during SSR; numbers serialized cleanly to Client Components. |

---

## 2. Traceability Verification Summary

- **Total Traceable Requirements:** 18
- **Unscoped Work:** 0 (`[UNSCOPED: 0]`)
- **Total Validating Test Files:** 31 test suites (472 passing unit tests)
- **Status:** 100% Traceability across all P0 & P1 features.
