# PHASE 4A — FINAL TRANSACTIONAL EMAIL ARCHITECTURE

**Document Version:** 2.1.0 (Phase 4B-06 Email Verification & Delivery Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Provider Abstraction & Sender Configuration

### Configuration Separation
- **Transactional Sender Email (`EMAIL_FROM`):** Configured via production environment variables (e.g. `Coach Zulfi Athletic Performance <noreply@coachzulfi.com>`).
- **Admin Login Identity:** `zulfikarnegrosa@gmail.com` (completely independent from transactional sender address).
- **Supported Backends:**
  1. **Resend API (Primary Cloud):** `RESEND_API_KEY` (production delivery via `resend` SDK).
  2. **Development Simulated Logger (Local Dev):** Outputs formatted `[DEV_AUTH]` payload to console when no API key is provided in development mode.

---

## 2. Core Email Workflows & Security Rules

| Email Flow | Target Roles | Token TTL | Single Use? | Security & Privacy Protections |
| :--- | :--- | :---: | :---: | :--- |
| **Assistant Coach Invitation** | Assistant Coach | 7 Days | **YES** | Revocable by Admin; single-use invalidation on acceptance; auto-verifies email (Option A). |
| **Parent Portal Invitation** | Parents | 7 Days | **YES** | Dispatches activation link; links parent to children; Quick Access remains independent. |
| **Athlete Activation** | Athletes with Email | 48 Hours | **YES** | 32-byte crypto token (SHA-256 in DB); single-use; non-email athletes activate manually. |
| **Email Verification** | All credential accounts | 24 Hours | **YES** | SHA-256 token; timingSafeEqual check; 60-second cooldown rate limit. |
| **Password Reset** | All credential accounts | 1 Hour | **YES** | Generic success message (zero email enumeration); revokes existing sessions on reset. |

---

## 3. Email Verification Policy Decision (Option A)
- **Decision:** Accepting an invitation email delivered directly to a recipient mailbox establishes ownership of that mailbox.
- **Rule:** `User.emailVerified` is automatically set to `true` upon invitation acceptance for invitation-created accounts.
- **Direct Signups:** Must complete explicit email verification via `/verify-email`.
- **Athletes Without Email:** No fake email generated; email verification not required.

---

## 4. Email Enumeration Protection
- When submitting verification or password reset requests, the API returns a generic success message:  
  `"Jika email Anda terdaftar, tautan telah dikirimkan ke kotak masuk Anda."`  
  This prevents malicious actors from probing valid staff or parent email addresses.
