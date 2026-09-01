# PHASE 4A — FINAL USER PROVISIONING & WORKFLOW SPECIFICATION

**Document Version:** 2.1.0 (Phase 4B-05 User Provisioning & Relationship Management)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Provisioning Matrix by Role (FINAL)

| Target Role | Created By | Required Inputs | Organization Assignment | Relationship Binding | Initial State |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Head Coach** | System Admin | Full Name, Email | Auto-assigned to current org | None | `INVITED` |
| **Assistant Coach** | Admin / Head Coach | Full Name, Email | Auto-assigned to current org | None | `INVITED` |
| **Parent** | Admin | Full Name, Email, Linked Athlete(s) | Auto-assigned to current org | Identity-based link in `Verification` store | `ACTIVE (Member)` / Normal Login |
| **Athlete** | Admin | Full Name, Username, Athlete Profile | Auto-assigned to current org | Bound to Athlete record | `NO_ACTIVATION_LINK` / `PENDING_ACTIVATION` |

---

## 2. Step-by-Step Provisioning Workflows

### A. Assistant Coach Invitation Flow
```
1. Admin opens `/settings` -> "Undang Anggota".
2. Enters email (e.g. `coach.budi@gmail.com`) and selects Role (`assistant_coach`).
3. System creates a `prisma.invitation` record (TTL: 7 days, cryptographically secure token).
4. System triggers transactional invitation email with secure activation URL.
5. Invitee clicks URL -> Sets secure password -> Email verified -> Logged into `/dashboard`.
```

### B. Parent Provisioning & Relationship Management Flow
```
1. Admin opens `/settings` -> "Tambah Pengguna" -> Role "Orang Tua".
2. Admin enters Parent Name, Email, and selects one or more initial athletes.
3. System provisions User + Member (role: parent) and records relationship in `Verification` (`parent-children:{userId}:{orgId}`).
4. Later Management: Admin opens "Kelola Hubungan Anak" in User Management Panel.
   - Admin can add additional children via `addChildToParentAction()`.
   - Admin can remove children via `removeChildFromParentAction()`.
   - Removing a child immediately revokes the parent's authenticated access to that child without deleting historical data.
```

### C. Athlete Account Provisioning & Activation Management Flow
```
1. Admin opens `/settings` -> "Tambah Pengguna" -> Role "Atlet".
2. Admin selects Athlete Profile and defines unique username (e.g. `faisal_youth`).
3. System creates User + Member (role: athlete) + `PortalAccess` record with status `NO_ACTIVATION_LINK`.
4. Activation Management:
   - Admin clicks "Kelola Aktivasi" -> "Buat Link Aktivasi".
   - Server creates 32-byte crypto token (SHA-256 stored in `Verification` as `athlete-activate:{username}`, TTL: 48h).
   - Admin copies URL `/activate?token=...&u=...` and shares with athlete.
   - Athlete opens `/activate`, sets password -> `passwordHash` stored, `Verification` token deleted (single-use).
   - Account status transitions to `ACTIVE`.
   - Admin can regenerate or invalidate pending tokens anytime.
```
