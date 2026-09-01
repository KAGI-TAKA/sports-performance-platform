# AI CODING & TYPESCRIPT RULES

1. **Strict Types Only:** `noImplicitAny: true` is enforced. Never use `any`. Define interfaces in `src/features/[feature]/types.ts`.
2. **Server Action Contract:** Every server action must return `Promise<ActionResult<T>>` containing `{ success: boolean; data?: T; error?: string }`.
3. **Zod Validation:** 100% of mutation inputs must be validated with `.safeParse()` at the very start of every Server Action.
4. **Clean Serialization:** Never pass Prisma `Decimal` instances directly to Client Components. Convert `Decimal` to JavaScript `number` (or `null`) in query return mappers.
5. **No Unused Imports:** Keep imports clean; use TypeScript path aliases (`@/*`) matching `tsconfig.json`.
6. **Preserve Existing Comments:** Do not remove docstrings, type annotations, or existing comments unrelated to your changes.
