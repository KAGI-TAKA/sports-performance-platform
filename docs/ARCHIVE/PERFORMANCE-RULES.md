# AI PERFORMANCE GUARDRAILS & LATENCY RULES

1. **Target Constraint:** Server Time to First Byte (TTFB) must remain **< 150ms** on key dashboard and operational pages.
2. **Dynamic Chart Splitting:** Never import `echarts` or `echarts-for-react` statically at the top of a file. Use `next/dynamic` with `{ ssr: false }`.
3. **No Redundant Auth Queries:** Use `React.cache()` and request-scoped caching for `requireOrgContext()` to avoid duplicate database roundtrips.
4. **Master Data Caching:** Use `unstable_cache` with cache tags for static datasets (e.g. test items, benchmark tables, organization profile).
5. **Empirical Validation Required:** Every performance change must be benchmarked using `scratch/run_full_route_benchmark.ts`. Never claim performance improvements without measured timing data.
