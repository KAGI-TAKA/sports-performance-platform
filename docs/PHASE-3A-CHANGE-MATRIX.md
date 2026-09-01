# PHASE 3A — CLIENT CHANGE MATRIX

**Document Version:** 1.0.0 (Phase 3A Change Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Master Change Matrix

| ID | Source | Area | Current State | Target State | Change Type | Priority | Dependency | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **CLIENT-REV-01** | `WEBSITE REVISION` Sec 01 | Marketing | General athletic testing hero | Youth Athletic Conditioning & Private Training hero | CONTENT / COPY | Prioritas 1 | None | Clear youth S&C positioning + WhatsApp CTA |
| **CLIENT-REV-02** | `WEBSITE REVISION` Sec 02 | Marketing & Product | Generic features list | 6-stage lifecycle: Assess $\to$ Plan $\to$ Develop $\to$ Monitor | CONTENT / UX | Prioritas 1 | Assessment Engine | Assessment explicitly framed as coaching tool |
| **CLIENT-REV-03** | `WEBSITE REVISION` Sec 03 | Marketing | Missing target segmentation | 4 Profile cards (Grassroots, Competitive, etc.) | CONTENT / UI | Prioritas 2 | None | Clear differentiation of target child profiles |
| **CLIENT-REV-04** | `WEBSITE REVISION` Sec 04 | Marketing | Missing youth literacy focus | Age-appropriate physical literacy & safety pillars | CONTENT | Prioritas 2 | None | Reassures parents on safe, non-gym lifting |
| **CLIENT-REV-05** | `WEBSITE REVISION` Sec 05 | Internal & Portal | Single input form for all tests | Dual-mode input (Beginner Delta % vs Elite Benchmarks)| UI / UX / DATA | Prioritas 1 | `AssessmentEngine` | Contextual 2-tab switch on `/assessments/new` |
| **CLIENT-REV-06** | `WEBSITE REVISION` Sec 06 | Internal Product | Fixed 7 components in form | Modular component selection & custom test items | UI / FUNCTIONAL| Prioritas 1 | `TestItem` CRUD | Settings modal for adding/editing test drills |
| **CLIENT-REV-07** | `WEBSITE REVISION` Sec 07 | Marketing & Reports | Mentions "injury prevention" | Reframe to "Movement Quality & Physical Durability" | CONTENT / COPY | Prioritas 1 | None | Zero medical diagnosis or 100% safe claims |
| **CLIENT-REV-08** | `WEBSITE REVISION` Sec 08 | Internal Product | Standalone plan creation | Assessment deficit directly guides plan template selection | UX / WORKFLOW | Prioritas 1 | `/training-plans` | 1-click plan creation from assessment review |
| **CLIENT-REV-09** | `WEBSITE REVISION` Sec 09 | Marketing | Technical sports science jargon | 3 Practical pillars (Overload, Recovery, Mechanics) | CONTENT / COPY | Prioritas 2 | None | Plain Indonesian explanations for parents |
| **CLIENT-REV-10** | `WEBSITE REVISION` Sec 10 | Reports & Portal | PDF report without coach notes | PDF report with spider radar + 6-8 wk recommendations | REPORT / PDF | Prioritas 1 | `@react-pdf` | Readable in 30 seconds by parents |
| **CLIENT-REV-11** | `WEBSITE REVISION` Sec 11 | Progress & Portal | Raw trend numbers | 7-component progression delta with context | ANALYTICS / UX | Prioritas 2 | ECharts Dynamic | Visual delta tracking over 3, 6, 12 months |
| **CLIENT-REV-12** | `WEBSITE REVISION` Sec 12 | Parent Portal | General token portal | Transparent development hub + parent star feedback | PORTAL / UX | Prioritas 1 | `PortalAccess` | Mobile-friendly token access & feedback submit |
| **CLIENT-REV-13** | `WEBSITE REVISION` Sec 13 | Marketing | Generic value propositions | 4 Differentiators: Certified Coach, 1-on-1, Reports | CONTENT / COPY | Prioritas 2 | None | Clear competitive advantages displayed |
| **CLIENT-REV-14** | `WEBSITE REVISION` Sec 14 | Marketing | Generic coach profile | Coach Zulfi profile, S&C background, philosophy | CONTENT / COPY | Prioritas 2 | None | Trust-building bio and coach portrait |
| **CLIENT-REV-15** | `WEBSITE REVISION` Sec 15 | Marketing | Single generic program card | Two Programs: Youth Performance vs Multilateral Dev | CONTENT / COPY | Prioritas 1 | None | Clear target audience & objectives for both |
| **CLIENT-REV-16** | `WEBSITE REVISION` Sec 16 | Marketing | Outdated pricing table | Client Pricelist (Indiv 150k/125k, Duo 200k/170k, Group)| CONTENT / COPY | Prioritas 1 | None | Exact pricing with attendee breakdown |
| **CLIENT-REV-17** | `WEBSITE REVISION` Sec 17 | Marketing | Placeholder testimonials | Real parent & athlete feedback quotes | CONTENT / COPY | Prioritas 2 | None | Testimonials with child sport and age |
| **CLIENT-REV-18** | `WEBSITE REVISION` Sec 18 | Marketing | Generic contact form | Direct WhatsApp CTA to `+62 888-6602-440` | CONTENT / CTA | Prioritas 1 | WhatsApp Link | Direct consultation link to `wa.me/628886602440` |
| **GLOBAL-19** | `WEBSITE REVISION` Sec 19 | Global Platform | Potential absolute claims | Prohibit 100% injury-free, absolute faster/stronger | GOVERNANCE | Prioritas 1 | All Modules | Zero prohibited marketing claims |
| **GLOBAL-20** | `WEBSITE REVISION` Sec 20 | All UI / Portal | Standard dark theme | Youth Athletic Performance visual tone | UI STYLING | Prioritas 3 | Design Tokens | Modern, athletic, non-childish, non-bodybuilding |
| **GLOBAL-21** | `WEBSITE REVISION` Sec 21 | Marketing | Unstructured message flow | Strict hierarchy: Identity $\to$ Method $\to$ Trust $\to$ CTA | CONTENT | Prioritas 1 | Landing Page | Logical progression for prospective parents |
| **GLOBAL-22** | `WEBSITE REVISION` Sec 22 | Whole System | Fragmented app perception | Unified coaching ecosystem & achievement portal | ARCHITECTURE | Prioritas 1 | Full Platform | Integrated coach-parent-athlete user loop |
| **ADD-CLIENT-01** | Additional Brief | Coach Profile | Missing Level 2 certification | National Level 2 S&C Coach (LANKOR-ICCA) displayed | CONTENT | Prioritas 1 | Profile Module | Strict credential hierarchy maintained |
| **ADD-CLIENT-02** | Additional Brief | Pricing & Format | Unspecified group size caps | MFD group cap: 8 kids; YAP small group: 4 athletes | CONTENT / DATA | Prioritas 1 | Pricing / Schedule| Accurate attendee limits displayed |
| **PROD-REQ-01** | Project Planning | Auth / Stakeholder | Token-only portal access | Dual Access Model (Token link + Optional Password) | AUTH / DESIGN | P2 | Better Auth | Documented as `REQ-AUTH-001` (Awaiting Decision) |
