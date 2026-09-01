# AI SECURITY & ACCESS CONTROL RULES

1. **Server-Side Authorization Enforcement:** Never rely on hiding buttons in the UI for security. Enforce member roles (`admin`, `head_coach`, `assistant_coach`) at the start of every Server Action.
2. **IDOR Prevention:** Always verify that the entity being modified belongs to `ctx.organizationId` before executing update or delete operations.
3. **Portal Token Validation:** Tokens for athlete/parent portals must be validated via SHA-256 hash comparison with expiry (`expiresAt > now()`) and revocation (`revokedAt IS NULL`) checks.
4. **No Secrets in Client Bundles:** Never export secret keys with `NEXT_PUBLIC_` prefix. Environment variables containing server secrets must only be imported in server files guarded by `import "server-only"`.
5. **Rate Limiting:** Protect public authentication and password reset actions with Better Auth rate limiter rules.
