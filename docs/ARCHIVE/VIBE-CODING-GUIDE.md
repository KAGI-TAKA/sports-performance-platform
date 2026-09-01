# VIBE CODING & AI WORKFLOW DISCIPLINE GUIDE

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Target:** All AI Pair Programmers, Autonomous Agents, and Human Engineers  
**Date:** September 2026

---

## 1. The 16-Step Mandatory AI Engineering Workflow

Every AI coding session on this repository **MUST** execute the following sequence without deviation:

```
[1. READ .ai/AGENTS.md & CONTEXT]
          │
          ▼
[2. CONSULT RELEVANT DOCS (PRD, DATA-FETCHING, ARCHITECTURE)]
          │
          ▼
[3. IDENTIFY AFFECTED ARCHITECTURE & RELEVANT REV-ID / REQ-ID]
          │
          ▼
[4. MAP INTERNAL & EXTERNAL DEPENDENCIES]
          │
          ▼
[5. INSPECT ACTUAL EXISTING CODEBASE IMPLEMENTATION]
          │
          ▼
[6. CREATE STEP-BY-STEP IMPLEMENTATION PLAN]
          │
          ▼
[7. IMPLEMENT SMALLEST SAFE SURGICAL CHANGE]
          │
          ▼
[8. RUN UNIT & INTEGRATION TESTS (`npm test`)]
          │
          ▼
[9. RUN STRICT TYPECHECK (`npm run typecheck`)]
          │
          ▼
[10. RUN LINTER (`npm run lint`)]
          │
          ▼
[11. RUN PERFORMANCE BENCHMARK HARNESS (IF QUERY/UI CHANGED)]
          │
          ▼
[12. VALIDATE AGAINST PRD & CLIENT ACCEPTANCE CRITERIA]
          │
          ▼
[13. UPDATE SYSTEM DOCUMENTATION & DECISION LOGS]
          │
          ▼
[14. REPORT ALL MODIFIED / CREATED FILES CLEARLY]
          │
          ▼
[15. REPORT TEST OUTCOMES (CONFIRM 472/472 PASSING)]
          │
          ▼
[16. HIGHLIGHT RISKS, LIMITATIONS, OR FOLLOW-UP ACTIONS]
```

---

## 2. Strict AI Prohibitions (Zero Tolerance)

1. **PROHIBITED:** Inventing new architectural patterns, ad-hoc state managers, or new routing conventions not defined in `docs/ARCHITECTURE.md`.
2. **PROHIBITED:** Querying the database directly from UI component files (`page.tsx`, `*.tsx`). All database operations must go through `src/features/[feature]/queries.ts` or `actions.ts`.
3. **PROHIBITED:** Installing external NPM packages without documented justification and bundle impact analysis.
4. **PROHIBITED:** Deleting, commenting out, or skipping (`it.skip`) unit tests to force a failing task to pass.
5. **PROHIBITED:** Moving server-side authorization checks into client-side UI logic.
6. **PROHIBITED:** Modifying production database schemas with destructive changes.
7. **PROHIBITED:** Silently altering business scoring algorithms or physical threshold rules without explicit client revision approval.
