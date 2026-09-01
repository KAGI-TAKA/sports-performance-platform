# Role-Based User Flow & Acceptance Review

This document summarizes the user experience, workflow paths, and security verification across all four primary roles.

---

## 1. Flow 1: Head Coach & Founder (Coach Zulfi / Admin)
- **Login:** Email & Password at `/login`.
- **Destination:** `/dashboard` (Command Center).
- **Navigation:** All 4 groups (Workspace, Coaching 6-Step, Analytics, System).
- **Verification:** Can configure academy settings, manage users, edit benchmarks, plan training curricula, and supervise field coaches.

---

## 2. Flow 2: Assistant Coach (Asisten Pelatih)
- **Login:** Email & Password at `/login`.
- **Destination:** `/schedule` (Jadwal & Timetable).
- **Navigation:** Focused on operational execution (Jadwal, Catatan Sesi, Direktori Atlet).
- **Verification:** Direct URL access to `/users`, `/settings`, or `/benchmarks` is immediately redirected to `/schedule`.

---

## 3. Flow 3: Parent (Orang Tua / Wali)
- **Login:** Email & Password at `/login` or Quick Access link.
- **Destination:** `/portal` (Parent View).
- **Navigation:** Focused on child progress (Multi-child switcher, 3 pillars: Training, Physical, Feedback).
- **Verification:** Parents only see authorized children linked via parent-child relationship.

---

## 4. Flow 4: Athlete (Anak / Atlet Muda)
- **Login:** Username & Password at `/login` (no PIN authentication).
- **Destination:** `/portal` (Athlete View).
- **Navigation:** Focused on motivation (Home training checklist, gamified badges, personal bests, upcoming schedule).
- **Verification:** Athlete can only view own personal data.
