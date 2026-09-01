# AI TESTING & REGRESSION GUARDRAILS

1. **Preserve 472 Passing Tests:** All existing 472 unit tests across 31 test files must continue to pass on every task.
2. **Never Weaken Tests:** Never delete assertions, weaken threshold criteria, or add `.skip` / `.todo` to make a failing test pass.
3. **Mandatory Test Execution:** Run `npm test` after modifying any engine or business logic code.
4. **Deterministic Unit Tests:** Test domain algorithms (e.g. scoring calculations, conflict detections) as pure functions with deterministic input/output expectations.
5. **Continuous Verification:** Every completed task must verify `npm test`, `npm run typecheck`, and `npm run lint`.
