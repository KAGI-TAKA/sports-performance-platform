# API & SERVER ACTIONS SPECIFICATION

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Date:** September 2026

---

## 1. REST API Route Handlers

### 1.1 Better Auth Authentication Endpoints
- **Path:** `/api/auth/[...all]`
- **Methods:** `GET`, `POST`
- **Purpose:** Handles email/password sign-in, sign-up, sign-out, session retrieval, password reset requests, and organization switching.
- **Auth:** Public / Session Cookie.
- **Rate Limiting:** 100 req/60s default; `/sign-in/email` limited to 5 attempts/5min; password resets limited to 3 requests/15min.

---

### 1.2 Coach PDF Report Stream Endpoint
- **Path:** `/api/assessments/[id]/pdf`
- **Method:** `GET`
- **Purpose:** Generates and streams a downloadable or previewable PDF report for an assessment.
- **Auth:** Requires Coach/Admin session (`requireOrgContext()`).
- **Response:** `Content-Type: application/pdf; Content-Disposition: inline; filename="Laporan-Fisik-[Name]-[Date].pdf"`
- **Errors:** `401 Unauthorized`, `404 Assessment Not Found`.

---

### 1.3 Athlete Portal PDF Stream Endpoint
- **Path:** `/api/portal/pdf/[token]/[assessmentId]`
- **Method:** `GET`
- **Purpose:** Allows athletes and parents to stream/download their official PDF report from the portal without a coach account.
- **Auth:** Unauthenticated session; authorized by valid SHA-256 `token` lookup in `portal_access` where `revokedAt IS NULL AND expiresAt > now()` and matching `athleteId`.
- **Response:** `Content-Type: application/pdf`.

---

### 1.4 CSV Data Export Endpoints
- **Paths:**
  - `/api/export/athletes`
  - `/api/export/schedule`
  - `/api/export/session-logs`
  - `/api/export/assessments`
- **Method:** `GET`
- **Purpose:** Generates UTF-8 BOM encoded CSV files of organization datasets.
- **Auth:** Requires Coach/Admin session (`requireOrgContext()`).
- **Response:** `Content-Type: text/csv; charset=utf-8; Content-Disposition: attachment; filename="[entity]-export-[date].csv"`.

---

## 2. Server Action Specifications

All mutations in `src/features/*/actions.ts` follow a uniform contract:
```typescript
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

| Feature Area | Action Function | Purpose | Authorization | Input Validation (Zod) | Revalidation Path |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Athletes** | `createAthleteAction` | Register new athlete | `head_coach`, `admin` | `createAthleteSchema` | `/athletes` |
| **Athletes** | `updateAthleteAction` | Edit athlete biometrics | `head_coach`, `admin` | `updateAthleteSchema` | `/athletes`, `/athletes/[id]` |
| **Assessments** | `submitAssessmentAction` | Submit test scores & analysis | `assistant_coach`+ | `assessmentSubmissionSchema` | `/assessments`, `/dashboard` |
| **Schedule** | `createScheduleSessionAction` | Book training session | `assistant_coach`+ | `createScheduleSessionSchema` | `/schedule`, `/dashboard` |
| **Schedule** | `cloneScheduleAction` | Duplicate week schedule | `head_coach`, `admin` | `cloneScheduleSchema` | `/schedule` |
| **Session Execution**| `recordAttendanceAction` | Mark athlete present/absent | `assistant_coach`+ | `attendanceRecordSchema` | `/schedule/[id]/execute` |
| **Session Execution**| `completeSessionAction` | Submit workout log & video | `assistant_coach`+ | `sessionLogSchema` | `/session-logs`, `/dashboard` |
| **Training Plans** | `createTrainingPlanAction`| Build exercise program | `head_coach`, `admin` | `trainingPlanSchema` | `/training-plans` |
| **Portal** | `generatePortalAccessAction` | Issue portal link/password | `head_coach`, `admin` | `generatePortalAccessSchema`| `/athletes/[id]` |
| **Parent Feedback** | `submitParentFeedbackAction` | Submit star rating & review | Portal Token Holder | `parentFeedbackSchema` | `/portal/[token]` |
