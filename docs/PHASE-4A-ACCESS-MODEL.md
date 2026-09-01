# PHASE 4A — FINAL PARENT & ATHLETE ACCESS & RELATIONSHIP MODEL

**Document Version:** 2.1.0 (Phase 4B-05 Parent Relationship & Athlete Activation Specification)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Parent ↔ Athlete Relationship Architecture

```
+------------------------------------+
|            ORGANIZATION            |
+------------------------------------+
                  |
                  | 1:N
                  v
+------------------------------------+          1:N         +------------------------------------+
|            PARENT USER             | -------------------> |         PORTAL ACCESS LINK         |
| (Name, Email, Phone, Password)     |                      | (Hashed Token, TTL, Revocable)     |
+------------------------------------+                      +------------------------------------+
                  |                                                           |
                  | 1:N (Identity Store: Verification table)                  | Scoped Access
                  v                                                           v
+------------------------------------+                      +------------------------------------+
|          ATHLETE PROFILE           | <------------------- |      ATHLETE DASHBOARD & REPORT    |
| (Name, Username, DOB, Sport)       |                      | (Spider Radar, Stars, Attendance)  |
+------------------------------------+                      +------------------------------------+
```

---

## 2. Multi-Child & Multi-Parent Capability
1. **Multi-Child Families:** A parent with 2 or more enrolled children can log in with their permanent email + password and seamlessly switch between their children's progress profiles.
2. **Multi-Guardian Support:** Both mother and father can have separate parent accounts (`parentA_userId`, `parentB_userId`) linked to the same athlete without conflict. Removing Athlete A from Parent A does not affect Parent B.
3. **Identity-Based Authorization:** Authorization relies entirely on the `Verification` store (`parent-children:{userId}:{orgId}`). Display fields (`Athlete.parentName`) are never used for access decisions.
4. **Strict IDOR & Tenant Boundary:** All queries explicitly enforce:
   `where: { id: athleteId, organizationId: ctx.organizationId }` combined with verified athlete ID array checks.

---

## 3. Relationship Management by Admin
- **Add Child (`addChildToParent`):** Admin can link an athlete from the same organization to a parent account.
- **Remove Child (`removeChildFromParent`):** Admin can remove a linked child from a parent account. The parent immediately loses access, but the athlete, parent account, and assessment records remain intact.

---

## 4. Quick-Access Expiration & Revocation Policy
- **Quick Access:** Standalone child-specific access tokens (`PortalAccess`) used at `/portal/[token]`.
- **Configurable TTL Presets:** `1 Hour`, `24 Hours` (**Default**), `7 Days`, `Custom`.
- **Revocation:** Admin and Head Coach can instantly revoke an active Quick-Access token from `/athletes/[id]` or the user management panel.
- **Interaction with Parent Account:** Removing a parent's authenticated relationship revokes their multi-child portal session access to that child, while standalone Quick Access tokens are governed by `PortalAccess.revokedAt`.
