# PROJECT CODING STANDARDS & ARCHITECTURAL CONVENTIONS

**Document Version:** 1.0.0 (Phase 1 Validated Single Source of Truth)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Date:** September 2026

---

## 1. Directory & File Organization Standards

The codebase enforces a **Feature-Driven Architecture** under `src/`:

```
src/
├── app/                      # Next.js App Router (Routing, Layouts, API Route Handlers)
│   ├── (app)/                # Private Authenticated Coach & Admin Pages
│   ├── (public)/             # Public Pages (Landing, Login, Register, Password Reset)
│   ├── api/                  # Route Handlers (Better Auth, PDF Streamers, CSV Export)
│   ├── onboarding/           # Initial Organization Onboarding Flow
│   └── portal/               # Token-Guarded Youth Athlete & Parent Portal
├── components/               # Global / Cross-Feature UI Components
│   ├── layout/               # App Shell, Sidebar, Header, Mobile Bottom Nav
│   └── ui/                   # Base-UI / Radix Primitives (Button, Dialog, Card, Input)
├── features/                 # Domain Feature Modules (Encapsulated)
│   └── [feature-name]/       # e.g., assessments, athletes, schedule, portal
│       ├── actions.ts        # Server Actions (Mutations, Zod validated)
│       ├── queries.ts        # Data Access Functions (Prisma / SQL)
│       ├── engine.ts         # Pure Business Logic & Algorithms (Deterministic)
│       ├── types.ts          # Feature-Specific TypeScript Interfaces & Types
│       ├── schemas.ts        # Zod Validation Schemas
│       ├── components/       # Feature-Specific React Components
│       └── *.test.ts         # Unit & Integration Tests for the Feature
└── lib/                      # Core Singletons & System Helpers
    ├── auth.ts               # Better Auth Instance
    ├── auth-context.ts       # requireOrgContext() Tenant Scoper
    ├── prisma.ts             # Prisma Client Singleton
    ├── permissions.ts        # RBAC Role Definitions
    └── utils.ts              # cn() Tailwind Merger & General Helpers
```

---

## 2. Server Component vs. Client Component Rules

### 2.1 Server Component Standards (Default)
- Every file in `src/app/` is a Server Component unless explicitly marked `"use client"`.
- Query functions in `queries.ts` **MUST** include `"server-only";` at line 1.
- Direct database calls (`prisma.*`) are strictly confined to `queries.ts` and `actions.ts`.

### 2.2 Client Component Standards (`"use client"`)
- Place `"use client";` strictly at line 1 of the file.
- Keep Client Components at the leaf nodes of the component tree.
- Never pass un-serialized complex objects (e.g. Prisma `Decimal` instances) as props to Client Components. Convert `Decimal` to `number` in query mappers.

---

## 3. Data Mutation & Server Action Standards

Every Server Action in `actions.ts` **MUST** follow this exact template:
```typescript
"use server";

import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAthleteSchema, type CreateAthleteInput } from "./schemas";
import type { ActionResult } from "./types";

export async function createAthleteAction(
  payload: CreateAthleteInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Authenticate & Authorize
    const ctx = await requireOrgContext();
    if (ctx.role !== "admin" && ctx.role !== "head_coach") {
      return { success: false, error: "Akses ditolak: Hanya Head Coach atau Admin yang dapat menambah atlet." };
    }

    // 2. Validate Payload
    const parsed = createAthleteSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Data input tidak valid." };
    }

    // 3. Execute Scoped Database Mutation
    const athlete = await prisma.athlete.create({
      data: {
        ...parsed.data,
        organizationId: ctx.organizationId,
      },
      select: { id: true },
    });

    // 4. Revalidate Affected Paths
    revalidatePath("/athletes");
    revalidatePath("/dashboard");

    return { success: true, data: { id: athlete.id } };
  } catch (error: any) {
    console.error("[createAthleteAction Error]:", error);
    return { success: false, error: "Gagal menyimpan data atlet. Silakan coba lagi." };
  }
}
```

---

## 4. TypeScript & Typing Standards

1. **Strict Type Safety:** `noImplicitAny: true` is enforced. Never use `any` unless working around third-party untyped modules.
2. **Explicit Action Returns:** Always type return values as `Promise<ActionResult<T>>`.
3. **Pure Function Engines:** Domain engines in `engine.ts` must be pure functions with zero side effects, enabling fast unit testing without mocking databases.
