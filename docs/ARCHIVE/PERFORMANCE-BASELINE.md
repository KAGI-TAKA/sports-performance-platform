# BEFORE-OPTIMIZATION PERFORMANCE BASELINE

**Document Version:** 1.0.0 (Phase 0.5 Measured Baseline)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Measurement Harness:** Real HTTP Authenticated Benchmark + Turbopack Telemetry + Node.js Query Profiler  
**Database:** Supabase PostgreSQL (`ap-southeast-1` via PgBouncer Pooler Port 6543)  
**Date:** September 2026

---

## 1. Measured Route Latency Baseline Table

| Route | Cold TTFB | Warm Avg TTFB | Warm Range (Min–Max) | Server DB Time | Next.js Internal | Payload HTML | Client Hydration (Mobile) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Landing Page (`/`)** | **402.4ms** | **253.2ms** | 225.9ms – 275.2ms | ~180ms | 12ms | **208.8 KB** | ~140ms | 200 OK |
| **Login Page (`/login`)** | **71.1ms** | **64.4ms** | 54.9ms – 72.3ms | 0ms | 7ms | **22.9 KB** | ~50ms | 200 OK |
| **Dashboard (`/dashboard`)** | **1,200.8ms** | **1,067.6ms** | 977.7ms – 1,277.5ms | ~980ms (22 DB queries) | 8ms | **136.5 KB** | ~280ms (ECharts) | 200 OK |
| **Athletes Directory (`/athletes`)** | **1,281.8ms** | **1,538.4ms** | 1,199.0ms – 2,515.7ms | ~1,450ms (Deep relations) | 11ms | **74.6 KB** | ~110ms | 200 OK |
| **Schedule Matrix (`/schedule`)** | **910.5ms** | **858.8ms** | 803.2ms – 951.8ms | ~800ms (50 sessions + joins) | 10ms | **91.8 KB** | ~160ms | 200 OK |
| **Training Plans (`/training-plans`)** | **941.3ms** | **1,140.9ms** | 880.4ms – 1,926.0ms | ~1,050ms (Plans + Exercises) | 12ms | **61.5 KB** | ~90ms | 200 OK |
| **Progress Analytics (`/progress`)** | **1,520.6ms** | **1,381.7ms** | 1,336.5ms – 1,453.9ms | ~1,300ms (History + Radar) | 9ms | **166.7 KB** | ~320ms (ECharts) | 200 OK |
| **Reports Hub (`/reports`)** | **1,294.2ms** | **1,070.4ms** | 983.5ms – 1,233.4ms | ~980ms (Assessments) | 14ms | **98.9 KB** | ~150ms | 200 OK |
| **Athlete Compare (`/compare`)** | **1,298.6ms** | **1,288.6ms** | 1,179.2ms – 1,370.7ms | ~1,220ms (Multi-athlete test items) | 8ms | **66.1 KB** | ~290ms (ECharts) | 200 OK |

---

## 2. Granular Database Execution Baseline

### A. Individual Query Latency Profile (Serial Execution)
- Initial Connection Ping & Handshake: **499.89ms**
- `requireOrgContext` Step 1 (Session DB Lookup): **159.92ms**
- `requireOrgContext` Step 2 (Member DB Lookup): **167.90ms**
- **requireOrgContext Total Baseline:** **327.83ms**

#### Dashboard 12 Queries in `getDashboardStats` (Serial Execution):
1. `Count Active Athletes`: **164.57ms**
2. `Count Month Assessments`: **163.84ms**
3. `Count Today Sessions`: **161.71ms**
4. `Count Draft Assessments`: **163.72ms**
5. `Count Active Injuries`: **160.23ms**
6. `Count Unlogged Past Sessions`: **151.96ms**
7. `Completed Assessments Scores`: **160.92ms**
8. `GroupBy Top Active Athlete`: **167.41ms**
9. `Completed Analyses Radar`: **179.57ms**
10. `Upcoming Sessions (with coach & athletes)`: **160.05ms**
11. `Recent Assessments (with athlete)`: **227.11ms**
12. `Athlete Directory (with 3-level subqueries)`: **350.90ms**
- **SUM OF SERIAL QUERY DURATIONS:** **2,211.98ms**

### B. Parallel Execution (`Promise.all` with PgBouncer Pooler)
- 12 Dashboard queries parallel run: **331.3ms – 596.8ms**
- Full 6-function Dashboard batch (20+ queries): **348.8ms – 579.9ms**
- Total Critical Path TTFB on `/dashboard` = 328ms (`auth`) + 550ms (`parallel batch`) + 120ms (`SSR & serialization`) = **~1,067ms**.

---

## 3. Client-Side Bundle & Hydration Profile

- **Total Client JS Bundle Size (Initial Load):** ~1.4MB uncompressed (~380KB gzipped).
- **Chart Component JS Contribution (`echarts`):** ~980KB – 1.1MB uncompressed.
- **Hydration Time (Main Thread on Desktop):** **120ms – 180ms**.
- **Hydration Time (Main Thread on Mid-Tier Mobile Device / 4x CPU Throttling):** **320ms – 480ms**.
- **First Contentful Paint (FCP):** Blocked by TTFB (~1,100ms on authenticated pages).
- **Time to Interactive (TTI):** TTFB (1,067ms) + HTML download (40ms) + JS download & Hydration (350ms) = **~1,450ms – 1,800ms**.
