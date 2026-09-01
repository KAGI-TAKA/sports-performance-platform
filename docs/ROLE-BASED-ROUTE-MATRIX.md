# Role-Based Route Access Matrix

This matrix provides the exact route access rules and redirect policies enforced server-side.

---

## 1. Route Access Matrix

| Route Path | Admin / Owner | Head Coach | Assistant Coach | Parent | Athlete | Unauthorized Direct URL Access Action |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`/dashboard`** | ✅ (Default) | ✅ (Default) | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/schedule`** | ✅ | ✅ | ✅ (Default) | ❌ | ❌ | Redirect to Role Default Route |
| **`/schedule/[id]/execute`** | ✅ | ✅ | ✅ | ❌ | ❌ | Redirect to Role Default Route |
| **`/athletes`** | ✅ | ✅ | ✅ | ❌ | ❌ | Redirect to Role Default Route |
| **`/training-plans`** | ✅ | ✅ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/assessments`** | ✅ | ✅ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/session-logs`** | ✅ | ✅ | ✅ | ❌ | ❌ | Redirect to Role Default Route |
| **`/progress`** | ✅ | ✅ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/compare`** | ✅ | ✅ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/reports`** | ✅ | ✅ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/portal`** | ✅ (Staff Selector) | ✅ (Staff Selector) | ✅ (Staff Selector) | ✅ (Default Parent) | ✅ (Default Athlete) | Shared Dynamic Route |
| **`/portal/[token]`** | ✅ (Public Token) | ✅ (Public Token) | ✅ (Public Token) | ✅ (Public Token) | ✅ (Public Token) | Token-Based Authorization |
| **`/users`** | ✅ | ❌ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/benchmarks`** | ✅ | ❌ | ❌ | ❌ | ❌ | Redirect to Role Default Route |
| **`/settings`** | ✅ | ❌ | ❌ | ❌ | ❌ | Redirect to Role Default Route |

---

## 2. Server-Side Enforcement Mechanism

1. **Centralized Policy:** `src/lib/access-policy.ts` contains `isRouteAllowedForRole()` and `getDefaultRouteForRole()`.
2. **Page Guards:** Server Components check `ctx.role` against `isRouteAllowedForRole()` and immediately call Next.js `redirect(getDefaultRouteForRole(ctx.role))`.
3. **Sidebar & Mobile Nav:** `AppSidebar` and `MobileBottomNav` filter visible navigation links dynamically based on `isRouteAllowedForRole(role, item.href)`.
4. **Post-Auth Redirection:** `getPostAuthRedirectUrl()` inspects the authenticated session and routes users directly to their appropriate workspace.
