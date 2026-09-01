# AI ARCHITECTURE RULES & BOUNDARIES

1. **Feature Module Encapsulation:** All new domain logic must live inside `src/features/[feature]/` under standard files: `actions.ts`, `queries.ts`, `engine.ts`, `types.ts`, `schemas.ts`, and `components/`.
2. **Server/Client Boundary Separation:** Server components handle all database access and auth context. Client components (`"use client"`) are strictly reserved for interactive leaf nodes, DOM events, and client-only charts.
3. **No Direct UI Database Access:** Never call `prisma.*` from within a React UI component (`*.tsx`). All database calls must be imported from `queries.ts` or dispatched via `actions.ts`.
4. **Streaming Suspense First:** Data-heavy widgets on dashboard, athlete profiles, and progress pages must be wrapped in React `<Suspense>` boundaries with matching skeleton placeholders.
5. **No Architectural Drift:** Never introduce new state management libraries (Redux, Zustand, MobX) or alternative routing models without explicit architectural approval.
