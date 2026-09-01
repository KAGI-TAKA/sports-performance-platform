# ROOT CAUSE PERFORMANCE ANALYSIS & BOTTLENECK RANKING

**Document Version:** 1.0.0 (Phase 0.5 Empirical Root Cause Analysis)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Audit Date:** September 2026

---

## 1. Measured Bottleneck Ranking

| Rank | Bottleneck Area | Measured Cost (Critical Path) | Measured Empirical Evidence | Confidence |
| :---: | :--- | :---: | :--- | :---: |
| **1** | **Multiplied Remote Database Roundtrips (18–22 queries / page)** | **~550ms – 880ms** (avg)<br>*Spikes to 2.5s on pool contention* | Next.js server telemetry shows **95%–98% of total page render time** (`1,008ms–1,503ms`) is spent waiting for remote PostgreSQL queries across WAN. Serial sum = **2.2s–3.8s**. Parallel batch = **350ms–580ms**. | **HIGH** |
| **2** | **Uncached Sequential Auth & Member Verification (`requireOrgContext`)** | **~302ms – 328ms** (per request) | Executed sequentially on EVERY dynamic page load before page queries start: `Session.findFirst` (152ms) + `Member.findUnique` (150ms). | **HIGH** |
| **3** | **Monolithic Page Blocking (Lack of `<Suspense>` Streaming)** | **~1,000ms – 1,500ms** (Blank Screen / Spinner) | The entire HTML response is held back until all 22 queries resolve. The shell/layout (which takes **< 70ms** to render) is completely blocked. | **HIGH** |
| **4** | **Static Client Bundle Bloat (`echarts` 1.1MB in Client Chunks)** | **~150ms – 350ms** (Mobile CPU parse & hydration delay) | `echarts-for-react` and `echarts` are statically imported into `"use client"` components across 4 modules, forcing 1MB+ of JS to be evaluated on initial client hydration. | **HIGH** |
| **5** | **Zero Data Caching on Read-Heavy Static/Semi-Static Master Data** | **~250ms – 400ms** (repeated on every page switch) | Benchmark thresholds, assessment components, and organization metadata are re-queried from PostgreSQL on every page navigation due to `await headers()` opting out of static cache. | **HIGH** |
| **6** | **Decimal Serialization Overhead (`Decimal` objects to Client)** | **~10ms – 25ms** + Console Warnings | Warning logged on `/compare`: *"Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported."* Serialization happens repetitively during render. | **MEDIUM** |

---

## 2. Detailed Root-Cause Classification

### A. Database Root Cause: Network Latency & Query Multiplicity (NOT Slow SQL Engine)
- **Database Engine Execution Time:** Raw PostgreSQL query execution time on Supabase is very fast (**0.8ms – 5.2ms** per query in PostgreSQL query planner).
- **Network Transit / Pooler Overhead:** Connecting from client/serverless to Supabase (`aws-0-ap-southeast-1.pooler.supabase.com` via PgBouncer on port 6543) adds **~150ms – 165ms of TCP/TLS WAN roundtrip latency per roundtrip**.
- **The True Culprit:** Firing 12–22 individual Prisma queries creates 12–22 roundtrips. Even when wrapped in `Promise.all`, Prisma's connection pool acquires connections in batches, creating 2 to 4 sequential roundtrip waves (**350ms to 580ms**).
- **Diagnosis:** **NETWORK LATENCY + QUERY MULTIPLICITY**. (NOT database CPU, NOT database IO, NOT slow table scans).

### B. Authentication Root Cause: Sequential Uncached Hops
- `requireOrgContext()` performs two sequential queries:
  1. `prisma.session.findFirst` (152ms)
  2. `prisma.member.findUnique` (150ms)
- Because `requireOrgContext()` is called at the top of every page handler and layout, this 302ms–328ms baseline is paid on **EVERY authenticated request** before any page data query is even dispatched.

### C. Frontend Root Cause: Monolithic SSR without Streaming
- `DashboardPage`, `AthletesPage`, `SchedulePage`, and `ProgressPage` are monolithic `async` functions that `await` all data before returning JSX.
- Consequently, TTFB = Database Wait Time + Next.js Render Time.
- If the slowest widget takes 1.2s to compute, the entire page (including the navigation bar, sidebar, and quick actions) is held back for 1.2s.

### D. Client Bundle Root Cause: Unsplit Canvas Chart Engines
- `echarts` is a full-featured charting library (~1.1MB uncompressed).
- Static imports inside `"use client"` files include `echarts` in the main route chunks, inflating first-load JS and delaying Time-to-Interactive (TTI).
