# MISSING FEATURES & GAPS

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Identified Feature Enhancements & Gaps

| Feature / Enhancement | Source | Why Required | Role | Dependencies | Priority | Implementation Complexity |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **Dual Assessment Wizard Category Switch UI** | `REV-001` | Clear visual separation between Beginner (Delta %) and Elite (Normative A/B/C/D) scoring modes during form input. | Coach | `AssessmentEngine` | **P0** | **LOW** |
| **Test Item & Physical Component Management Modal** | `REV-002` | Allow Head Coach to add custom physical drills, change measurement units, and update target benchmarks directly from `/settings`. | Admin | `TestItem` CRUD | **P0** | **LOW** |
| **Production SMTP / Resend Email Credentials** | `REV-005` | Enable live outbound emails for password reset tokens and coach invitations. | Admin, System | Provider API Key | **P1** | **LOW** |
| **Direct WhatsApp Link Copy in Athlete Directory** | Client UX | Provide quick copy/share button next to each athlete in `/athletes` to rapidly dispatch the portal link. | Coach | Clipboard API | **P1** | **LOW** |
