# Role-Based Workspace Architecture & User Flows

This document details the four primary role workspaces, their default landing pages, navigation permissions, and data visibility rules for the platform.

---

## 1. Flow 1: Head Coach / Founder / Admin (Coach Zulfi)

- **Primary Persona:** Coach Zulfi (Owner, Founder, Head Coach).
- **System Authority:** Full Administration (`role: "admin"` / Owner).
- **Default Landing Route:** `/dashboard` (Command Center).
- **Primary Purpose:** Command center for the entire academy, holistic athlete performance lifecycle management, training curriculum, and operational supervision.
- **Available Modules:**
  - **Command Center:** 6-Step Workflow Cockpit (*01 ASSESS $\to$ 06 REASSESS*), KPI cards, Retest intelligence widget, Operational attention, Today's sessions.
  - **Coaching Flow:** `/assessments` (Individual & Squad Matrix), `/training-plans` (Curriculum builder & Library), `/schedule` (Calendar & Execution), `/session-logs` (Daily logs & Attendance).
  - **Analytics:** `/progress` (Timeline & Personal Bests), `/compare` (Head-to-head radar analysis), `/reports` (Official PDF & CSV export).
  - **Administration:** `/users` (User provisioning, invitations, passwordless quick access), `/benchmarks` (Master benchmark standards), `/settings` (Organization profile & supervision).

---

## 2. Flow 2: Assistant Coach (Asisten Pelatih)

- **Primary Persona:** Field coaching assistants assigned by Head Coach.
- **System Authority:** Operational Execution (`role: "assistant_coach"`).
- **Default Landing Route:** `/schedule` (Jadwal & Lapangan).
- **Primary Purpose:** Fast, lightweight field-execution workspace focused on today's operational sessions and attendance.
- **Available Modules:**
  - **Field Execution Cockpit (`/schedule/[id]/execute`):** 1-tap attendance (Hadir, Absen, Izin), exercise checklist, stopwatch/timer, field scoring.
  - **Session Logs (`/session-logs`):** Post-session notes, movement-quality observations, and video upload links.
  - **Athlete Directory (`/athletes`):** View assigned athlete profiles and anthropometrics.
- **Strict Server-Side Restrictions:**
  - ❌ Denied access to `/users` (User Management).
  - ❌ Denied access to `/settings` (Organization Administration).
  - ❌ Denied access to `/benchmarks` (Benchmark editing).
  - ❌ Denied destructive athlete/member deletion.

---

## 3. Flow 3: Parent (Orang Tua / Wali)

- **Primary Persona:** Parents of enrolled youth athletes.
- **System Authority:** Family / Guardian (`role: "parent"`).
- **Default Landing Route:** `/portal` (Parent Transparent View).
- **Login Credentials:** Email + Password or 1-Click WhatsApp Quick Access link.
- **Primary Purpose:** Transparent, plain-language progress tracking without confusing sports jargon.
- **Available Modules:**
  - **Multi-Child Switcher:** Instant switching between authorized children only.
  - **3 Pillars of Progress:**
    1. *Training Progress:* Attendance percentage, weekly focus, and skill development.
    2. *Physical Progress:* Movement quality trends, speed, landing control, and balance.
    3. *Coach Feedback:* Direct observations from Coach Zulfi and next training priorities.
  - **Official Reports:** Download official PDF assessment reports.
  - **Parent Feedback:** Post-session star rating and coach message submission.
- **Strict Server-Side Restrictions:**
  - ❌ Cannot access internal staff dashboards, internal notes, or other families' data.

---

## 4. Flow 4: Athlete (Anak / Atlet Muda)

- **Primary Persona:** Enrolled youth athletes.
- **System Authority:** Athlete (`role: "athlete"`).
- **Default Landing Route:** `/portal` (Athlete View).
- **Login Credentials:** Username + Password (no PIN authentication).
- **Primary Purpose:** Motivation, self-discipline, and homework drill execution.
- **Available Modules:**
  - **Home Training Checklist:** Prescribed home exercises with target sets, reps, and movement technique instructions.
  - **Achievements & Badges:** Gamified milestones (*Speed Demon, Balance Master, Explosive Jumper, Consistency Hero*).
  - **Upcoming Schedule:** Timetable, location, and required gear.
  - **Personal Bests:** Record book and performance growth.
- **Strict Server-Side Restrictions:**
  - ❌ Cannot access other athletes' data or internal coach configurations.
