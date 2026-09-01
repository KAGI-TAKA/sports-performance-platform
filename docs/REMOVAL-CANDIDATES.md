# REMOVAL & DEPRECATION CANDIDATES AUDIT

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Deprecation Candidates Audit

| Candidate | Type | Reason | Referenced By | Risk Level | Recommendation |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Basketball Specific Fields (`jerseyNumber`, `wingspanCm`)** | Data Field | Deprecated in `REV-003` in favor of multi-sport neutrality. | Optional in `schema.prisma` | **ZERO RISK** | Keep as optional fields for backwards compatibility; hide by default on multi-sport forms. |
| **Legacy Benchmark Tables (Hardcoded)** | Logic | Superseded by dynamic database `TestItem` and `BenchmarkTable`. | `engine.ts` default fallback | **ZERO RISK** | Retain as fallback seed defaults. |

---

## 2. Removal Verdict

**Zero active application pages or API endpoints are recommended for removal.** All 33 routes and 22 feature modules are actively utilized and directly aligned with the master client requirements.
