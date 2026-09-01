# PHASE 4A — FINAL AUTH & EMAIL DECISION REGISTER

**Document Version:** 2.1.0 (Phase 4B-05 Decisions Register)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Final Approved Decision Register

| Decision ID | Topic | Final Approved Policy | Status |
| :--- | :--- | :--- | :---: |
| **`DECISION-04-01`** | Owner + Head Coach + Admin Identity | Coach Zulfi holds `admin + head_coach`. Owner is a business position mapped to system `admin`. | **LOCKED** |
| **`DECISION-04-02`** | Parent Email + Password | Parents have permanent credential accounts using **Email + Password**. | **LOCKED** |
| **`DECISION-04-03`** | Athlete Username + Password | Athletes log in via **Username (`faisal_youth`) + Password**. Personal email is not mandatory. | **LOCKED** |
| **`DECISION-04-04`** | Athlete Optional Email | Athlete email is optional; email verification is conditional on whether an email address is provided. | **LOCKED** |
| **`DECISION-04-05`** | Parent Quick Access | Parents can also use Quick-Access token links for zero-friction mobile/WhatsApp access. | **LOCKED** |
| **`DECISION-04-06`** | Athlete Quick Access | Athletes can also use Quick-Access token links during training sessions. | **LOCKED** |
| **`DECISION-04-07`** | Quick-Access Default TTL | **24 Hours** (balances security with convenience; replaces rigid 30-day assumption). | **LOCKED** |
| **`DECISION-04-08`** | Quick-Access TTL Presets | Presets supported: **1 Hour, 24 Hours (Default), 7 Days, Custom**. | **LOCKED** |
| **`DECISION-04-09`** | Quick-Access Revocation | Admin and Head Coach can revoke active Quick-Access tokens with 1 click. | **LOCKED** |
| **`DECISION-04-10`** | Parent Multi-Child Access | Parent credential account can view and switch between all associated children within the academy. | **LOCKED** |
| **`DECISION-04-11`** | Portal Token Coexistence | Existing `/portal/[token]` architecture is preserved as the underlying Quick-Access token engine. | **LOCKED** |
| **`DECISION-04-12`** | Assistant Coach Invitation | Admin invites via email; invitee activates password via secure link; role has zero admin permissions. | **LOCKED** |
| **`DECISION-04-13`** | Password Initialization | Zero hardcoded default passwords in code or docs. All accounts set passwords via secure activation. | **LOCKED** |
| **`DECISION-04-14`** | Email Verification by Role | Mandatory for Admin, Head Coach, Assistant Coach, and Parent. Conditional for Athlete. | **LOCKED** |
| **`DECISION-04-15`** | Production Admin Identity | **`zulfikarnegrosa@gmail.com`** is the designated production admin identity. | **LOCKED** |
| **`DECISION-04-16`** | Test Account Cleanup | Retain `zulficoach@performance.id` for regression testing; isolate and safely archive obsolete scratch accounts. | **LOCKED** |
| **`DECISION-04-17`** | Athlete Activation Token Lifetime | **48 Hours** cryptographic token TTL (`crypto.randomBytes(32)` -> SHA-256 in `Verification`). | **LOCKED** |
| **`DECISION-04-18`** | Athlete Activation Single-Use | Verification token is invalidated and deleted immediately upon password setup on `/activate`. | **LOCKED** |
| **`DECISION-04-19`** | Parent-Child Relationship Store | Stored in `Verification` as `parent-children:{userId}:{orgId}`. Display fields are ignored for auth. | **LOCKED** |
| **`DECISION-04-20`** | Parent Removal vs Quick Access Lifecycle | Removing parent relationship revokes authenticated multi-child portal access; standalone child Quick Access tokens remain governed by `PortalAccess.revokedAt`. | **LOCKED** |
| **`DECISION-04-21`** | Email Verification on Invitation Acceptance | Accepting an email invitation sent directly to a recipient mailbox establishes ownership of that mailbox. `User.emailVerified` is marked `true` upon invitation acceptance (Option A). | **LOCKED** |
| **`DECISION-04-22`** | Email Verification Token TTL | Email verification tokens expire in **24 Hours** and are single-use (`Verification` table SHA-256 hash). | **LOCKED** |
| **`DECISION-04-23`** | Verification Resend Rate Limit | **60-Second Cooldown** enforced per email address on verification resend requests. | **LOCKED** |
| **`DECISION-04-24`** | Password Reset Token TTL | Password reset tokens expire in **1 Hour (60 minutes)** and are single-use (`Verification` table SHA-256 hash). | **LOCKED** |
| **`DECISION-04-25`** | Session Revocation on Password Reset | All active sessions across all devices for the target user are immediately terminated upon password reset. | **LOCKED** |
| **`DECISION-04-26`** | Athlete Without Email Recovery Policy | Athletes without email cannot use public password reset; recovery is managed administratively via Admin activation regeneration. | **LOCKED** |
| **`DECISION-04-27`** | Child-Scoped Quick Access Token Model | Quick Access tokens are strictly child-scoped. A token for Child A cannot view or access Child B. | **LOCKED** |
| **`DECISION-04-28`** | Quick Access Regeneration Invalidation | Generating a new Quick Access token immediately invalidates any prior active tokens for that athlete and access type. | **LOCKED** |
| **`DECISION-04-29`** | Portal Dynamic Rendering & CDN Protection | All `/portal/[token]` routes are marked `force-dynamic` to prevent public caching of private athlete data. | **LOCKED** |
