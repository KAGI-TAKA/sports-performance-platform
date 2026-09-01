# EMAIL ACCOUNT & NOTIFICATION SYSTEM REQUIREMENTS

**Document Version:** 1.0.0 (Phase 3 Audit)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Required Email Capabilities

1. **Password Reset Workflow**:
   - Dispatches secure token link to coach/admin email when `/forgot-password` is submitted.
2. **Coach Member Invitation**:
   - Dispatches invitation link to newly invited assistant coaches.
3. **Optional Parent PDF Report Delivery**:
   - Optional automated dispatch of assessment PDF attachment to parent email upon coach completion.

---

## 2. Recommended Email Provider Configuration

- **Provider:** **Resend** (Recommended for Vercel/Next.js) or standard SMTP (NodeMailer).
- **Required Environment Variables:**
  - `RESEND_API_KEY` (or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
  - `EMAIL_FROM` (e.g. `Kinetiq Sports <noreply@kinetiq.id>` or verified domain)
- **Current Development Fallback:**
  - When SMTP credentials are unconfigured, `src/lib/email.ts` logs password reset URLs directly to the server console for zero-blocker local testing.
