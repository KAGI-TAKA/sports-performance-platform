# AI DATABASE & ORM RULES

1. **Mandatory Tenant Scoping:** 100% of queries accessing tenant data must include `where: { organizationId }` obtained from `requireOrgContext()`.
2. **Consolidated Batching Over N+1 Micro-Queries:** Never write loops containing individual `prisma.*` calls. Use `Promise.all` or consolidated raw SQL CTE queries (`prisma.$queryRaw`) for aggregations.
3. **Selective Projection (`select`):** Always specify explicit `select` fields. Never execute open-ended `select: *` on entity tables with heavy relations.
4. **Parameterized SQL Queries:** When using `prisma.$queryRaw`, use parameterized template strings (`$1, $2`). String concatenation of raw user input is strictly prohibited.
5. **Zero Destructive Migrations:** Never drop tables or columns in production database schemas.
