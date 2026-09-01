# PHASE 4A — FINAL ROLE IDENTITY & AUTHENTICATION MATRIX

**Document Version:** 2.0.0 (Phase 4A-Revision Role Identity Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Role Identity & Authentication Matrix (FINAL)

| Role | Identifier | Password Req? | Email Req? | Verification | Normal Login? | Quick-Access Link? | Admin Provisioned? | Public Registration? |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin / Owner** | Email (`zulfikarnegrosa@gmail.com`) | **YES** | **YES** | **YES** | **YES** (`/login`) | **NO** | Initial Setup | **NO** |
| **Head Coach** | Coach Email | **YES** | **YES** | **YES** | **YES** (`/login`) | **NO** | **YES** (by Admin) | **NO** |
| **Assistant Coach**| Staff Email | **YES** | **YES** | **YES** | **YES** (`/login`) | **NO** | **YES** (by Admin/Head) | **NO** |
| **Parent** | Email | **YES** | **YES** | **YES** | **YES** (`/login`) | **YES** (`/portal/[token]`)| **YES** (by Coach) | **NO** |
| **Athlete** | Username (`atlet_...`) | **YES** | **OPTIONAL** | Conditional | **YES** (`/login`) | **YES** (`/portal/[token]`)| **YES** (by Coach) | **NO** |

---

## 2. Resource & Permission Scope Matrix

| Role | Organization Scope | Athlete Records | Assessments & Plans | Schedules & Attendance | Billing & Settings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin / Owner** | Full Organization | View / Edit / Delete All | View / Edit / Delete All | Full Schedule Management | Full Access |
| **Head Coach** | Full Organization | View / Edit All | Create / Edit / Delete | Full Schedule Management | Read Settings |
| **Assistant Coach**| Full Organization | View Assigned Roster | View Only / Input Field Scores | Log Attendance & Reps | No Access |
| **Parent** | Scoped to Associated Child | View Child Profile Only | View Child Radar Reports | View Child Schedule | No Access |
| **Athlete** | Scoped to Own Record | View Own Profile Only | View Own Radar Reports | View Own Sessions | No Access |
