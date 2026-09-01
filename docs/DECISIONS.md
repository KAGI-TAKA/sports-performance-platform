# ARCHITECTURAL DECISION LOG (ADR)

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Date:** September 2026

---

## 1. Architectural Decision Records

### DECISION-01: Partial Refactor / Optimization over Full Rebuild
- **Context:** The website was reported as "feeling very slow".
- **Problem:** Determine whether the stack (Next.js, Supabase, Vercel) is flawed or if performance issues stem from data access patterns.
- **Alternatives Considered:**
  - Option A: Keep current stack unchanged (rejected; slowness persists).
  - Option B: Partial refactor and query consolidation (selected).
  - Option C: Decoupled Fastify API + Vite SPA (rejected; high migration cost, duplicate types).
  - Option D: Full rebuild in Go/Rust (rejected; extreme risk, discards 472 passing tests).
- **Decision:** **Option B (Partial Refactor & Performance Optimization)**.
- **Reason:** Measured framework overhead is only 7ms; 98% of delay is remote DB WAN latency from 22 unaggregated queries. Consolidating queries solves the root cause with zero regression risk.
- **Tradeoff:** Requires writing targeted raw SQL CTE aggregations for high-frequency dashboards.
- **Risk:** Minimal; verified by comprehensive test suites.
- **Affected Areas:** `src/features/dashboard/queries.ts`, `src/lib/auth-context.ts`, client chart components.

---

### DECISION-02: Dual Physical Assessment Paradigm (Progress vs Benchmark)
- **Context:** Youth athletes age 6–9 were being failed by rigid elite benchmark thresholds.
- **Problem:** Support both pre/post-test improvement tracking for beginners and normative A/B/C/D grading for elite competitors.
- **Alternatives Considered:**
  - Single flexible benchmark with low thresholds (rejected; inaccurate for elite).
  - Separate database tables for beginner vs elite (rejected; schema duplication).
  - Unified assessment header with `AssessmentType` enum (selected).
- **Decision:** Add `AssessmentType` enum (`PROGRESS_BASED` vs `BENCHMARK_BASED`) with two deterministic calculation engines.
- **Reason:** Clean data model, preserves 1-to-many relationship with test items, and supports both athlete archetypes.
- **Affected Areas:** `src/features/assessments/engine.ts`, `src/features/assessments/components/*`.

---

### DECISION-03: Dynamic Code-Splitting of ECharts via `next/dynamic`
- **Context:** Initial client route chunks contained ~1.1MB uncompressed ECharts canvas code.
- **Problem:** Delayed mobile hydration (320ms–480ms) and blocked main-thread responsiveness.
- **Alternatives Considered:**
  - Replace ECharts with SVG chart library (rejected; loses radar zoom and rich canvas tooltips).
  - Keep synchronous static imports (rejected; hurts mobile performance).
  - Lazy dynamic import with SVG skeleton placeholders (selected).
- **Decision:** Dynamically load `ReactECharts` using `next/dynamic(..., { ssr: false })`.
- **Reason:** Cuts initial JS payload by >60% while preserving all rich chart capabilities.
- **Affected Areas:** `radar-chart.tsx`, `dual-radar-chart.tsx`, `progress-line-chart.tsx`, `multi-athlete-radar-chart.tsx`.
