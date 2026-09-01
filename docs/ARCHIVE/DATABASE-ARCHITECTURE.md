# DATABASE ARCHITECTURE & SCHEMA SPECIFICATION

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**Database Engine:** PostgreSQL 15 (Supabase Managed, AWS Singapore `ap-southeast-1`)  
**ORM:** Prisma 6.19.3  
**Connection Mode:** Transaction Pooling (PgBouncer/Supavisor, Port 6543) via `DATABASE_URL`  
**Direct Migration Port:** Port 5432 via `DIRECT_URL`  
**Date:** September 2026

---

## 1. Core Entity Relationship Diagram (ERD)

```
[Organization] (Tenant Root)
  ├── 1:N ── [Member] ──── N:1 ──── [User] ──── 1:N ──── [Session]
  ├── 1:N ── [Athlete] ─── 1:N ──── [AthleteInjuryHistory]
  │             │
  │             ├── 1:N ── [Assessment] ─── 1:1 ──── [AssessmentAnalysis]
  │             │             └── 1:N ──── [AssessmentResultItem] ──── N:1 ─── [TestItem]
  │             │                                                                 │
  │             ├── 1:N ── [PortalAccess]                                          ├── N:1 ── [AssessmentComponent]
  │             ├── 1:N ── [AthleteGoal]                                           └── 1:N ── [Benchmark]
  │             └── 1:N ── [ScheduleSessionAthlete]
  │                            │
  ├── 1:N ── [ScheduleSession] ─┴── 1:N ── [SessionLog]
  │             └── N:1 ──── [TrainingPlan] ─── 1:N ─── [TrainingExercise] ─── N:1 ── [Exercise]
  └── 1:N ── [Attendance]
```

---

## 2. Table Classification & Hot Tables

| Table Name | Role | Read Frequency | Write Frequency | Hot Query / Critical Path |
| :--- | :--- | :---: | :---: | :--- |
| `organization` | Multi-Tenant Root | High | Low | Looked up on layout load via `id`. |
| `member` | Org User Association | Very High | Low | Hot lookup on every request via compound key `(organizationId, userId)`. |
| `session` | Better Auth Sessions | Very High | Low–Med | Hot lookup on every authenticated request via unique `token`. |
| `athlete` | Athlete Master Record | High | Medium | Filtered by `organizationId`, `isActive`, sorted by `fullName`. |
| `assessment` | Physical Testing Header | High | Medium | Filtered by `(athleteId, assessmentDate)`, `(organizationId, status)`. |
| `assessment_result_item` | Granular Test Results | High | Medium | Joined with `TestItem` to generate radar charts & delta comparisons. |
| `schedule_session` | Field Appointments | High | High | Filtered by `organizationId`, `startTime` range (today / week). |
| `portal_access` | Token Access for Kids/Parents | High | Low | Filtered by unique `tokenHash`. |

---

## 3. Indexing & Optimization Strategy

1. **Multi-Tenant Scoping Indexes:** All tenant tables contain single or composite indexes starting with `organizationId`:
   - `athlete(organizationId)`
   - `assessment(organizationId)`
   - `schedule_session(organizationId)`
   - `test_item(organizationId)`
   - `training_plan(organizationId)`
2. **Compound Filter Indexes:**
   - `member(organizationId, userId)` [UNIQUE] -> O(1) indexed lookup in `requireOrgContext()`.
   - `assessment(athleteId, assessmentDate)` -> Speeds up historical progress timelines.
   - `portal_access(tokenHash)` [UNIQUE] -> Instant unauthenticated token lookup.
   - `portal_access(organizationId, athleteId)` -> Fast portal credential management.
   - `benchmark(organizationId, testItemId)` -> Fast threshold calculation.
   - `assessment_result_item(assessmentId, testItemId)` [UNIQUE] -> Prevents duplicate results.

---

## 4. Transaction Boundaries & Cascades

- **Cascade Deletion:** Child records (`AthleteInjuryHistory`, `Assessment`, `PortalAccess`, `ScheduleSessionAthlete`) automatically cascade on athlete or organization deletion (`onDelete: Cascade`).
- **Nullification:** Optional references (e.g. `TrainingPlan` on `ScheduleSession`) are safely set to null on deletion (`onDelete: SetNull`).
- **Atomic Server Action Transactions:** All multi-row mutations (e.g., creating an assessment with its 7 result items and analysis) execute within a single Prisma interactive transaction (`prisma.$transaction`).
