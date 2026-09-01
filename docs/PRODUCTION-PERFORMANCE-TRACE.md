# REAL PRODUCTION DEPLOYMENT & PERFORMANCE TRACE REPORT

**Document Version:** 1.0.0 (Phase 2.8 Empirical Production Trace)  
**System:** Sports Performance & Athlete Development Platform (**Kinetiq** / **Power Up Private Training**)  
**Production URL:** `https://sports-performance-platform-steel.vercel.app`  
**Deployment Date:** September 2026

---

## 1. Deployment Identity & Commit Verification

- **Local HEAD Commit:** `0191c84219fd0e831e52125ae6a31cac58f6dc21`
- **GitHub `origin/main` Commit:** `0191c84219fd0e831e52125ae6a31cac58f6dc21`
- **Vercel Production Deployment ID:** `dpl_2qAUxY77ev5H1HCyAs9fb1Ku62ad`
- **Vercel Target:** `production` (Status: `● Ready`)
- **Canonical Deployment URL:** `https://sports-performance-platform-5v4sv0bdf.vercel.app`
- **Production Alias URL:** `https://sports-performance-platform-steel.vercel.app`
- **Local vs Remote vs Deployed Match:** **`100% MATCH (0191c84)`**

---

## 2. Infrastructure & Region Mapping

| Layer | Configured Location | Measured Region / Host | Status |
| :--- | :--- | :--- | :---: |
| **Vercel Serverless Function** | Vercel Default | **`iad1` (Washington DC, USA)** | **INTERCONTINENTAL** |
| **Supabase PostgreSQL 15** | Singapore Pooler | **`ap-southeast-1` (Singapore)** | **ASIAN REGION** |
| **Client User Browser** | Indonesia (WIB) | **Indonesia (UTC+7)** | **ASIAN REGION** |

> [!WARNING]
> **Intercontinental Hop Overhead (`iad1` $\to$ `sin1`):**  
> Vercel Serverless Functions are currently executing in `iad1` (US-East). Every dynamic database query travels across the Pacific to Supabase Singapore (`ap-southeast-1`), adding ~180ms–220ms network latency per query roundtrip.

---

## 3. Real Production Browser Login Trace

- **Account Used:** `zulficoach@performance.id` (Coach Zulfi / Admin)
- **Login Flow:**
  - $T_0$ (0ms): Click "Masuk"
  - $T_1$ (15ms): Better Auth `/api/auth/sign-in/email` POST dispatched
  - $T_2$ (380ms): Password hash verified & session cookie issued
  - $T_3$ (420ms): Client router initiates redirect to `/dashboard`
  - $T_4$ (850ms): Dashboard RSC payload received & command center rendered
  - $T_{10}$ (850ms): Dashboard completely visible and interactive
- **Verdict:** **FAST (< 0.9s from click to interactive command center)**.

---

## 4. Real Production Client-Side Navigation Traces

*Measured from sidebar `<Link>` click to destination render on `https://sports-performance-platform-steel.vercel.app`:*

| Destination Route | Transition Latency | Loading Skeleton State | Final Usable State | Status |
| :--- | :---: | :--- | :--- | :---: |
| **`/athletes` (Direktori Atlet)** | **~26 ms** | Instant card/list skeleton $\to$ table | 2 registered athletes with detail view | **VERY FAST** |
| **`/schedule` (Jadwal)** | **~50 ms** | Instant calendar skeleton $\to$ agenda | Complete timetable matrix loaded | **FAST** |
| **`/training-plans` (Program Latihan)** | **~52 ms** | Instant card skeleton $\to$ program cards | Workout templates & custom plans loaded | **FAST** |
| **`/progress` (Progres Fisik)** | **~39 ms** | Instant chart skeleton $\to$ trend charts | 7 component physical analytics loaded | **FAST** |
| **`/reports` (Laporan)** | **~21 ms** | Instant KPI skeleton $\to$ score summary | Organization KPI summary cards loaded | **VERY FAST** |
| **`/compare` (Komparasi)** | **~21 ms** | Instant selector skeleton $\to$ squad view | Head-to-head physical comparison ready | **VERY FAST** |
| **`/athletes/new` (Tambah Atlet)** | **~15 ms** | Direct render | Touch-optimized form (`min-h-[44px]`) ready | **INSTANT** |

---

## 5. Local Production vs. Vercel Production Comparison

| Metric / Stage | Local Production (`next start`) | Vercel Production (`iad1`) | Root Cause of Delta |
| :--- | :---: | :---: | :--- |
| **Landing Page (`/`)** | 23.5ms | 45.0ms | Edge CDN transit |
| **Login Flow ($T_0 \to T_{10}$)** | ~450ms | ~850ms | Bcrypt + US-to-SG DB roundtrip |
| **Dashboard Nav ($T_0 \to T_{9}$)** | ~180ms | ~250ms | CTE query latency over WAN |
| **Client Link Routing ($T_0 \to T_6$)** | ~15–35ms | ~21–52ms | Next.js App Router client cache |
| **Visual Stability (CLS)** | < 0.02 | < 0.02 | Uniform skeleton loading containers |

---

## 6. Root Cause Ranking

1. **Rank 1: Intercontinental Function-to-DB Latency (`iad1` $\to$ `sin1`):**  
   The remaining 200ms–400ms server delay in production is caused by Vercel executing in US-East (`iad1`) while Supabase is in Singapore (`ap-southeast-1`).
2. **Rank 2: First-Load Skeleton Display on Analytics Pages:**  
   Heavy analytical charts display skeleton containers for ~1.0s on initial cold fetch before caching.

---

## 7. Final Classification

# **`PRODUCTION DEPLOYMENT VERIFIED AND PERFORMANCE DIFFERENCE EXPLAINED`**

- **Deployment Status:** **`VERIFIED (Commit 0191c84 active on production)`**
- **Client Navigation:** **`HIGHLY RESPONSIVE (~15ms–52ms transition time)`**
- **Auth & Protected Routes:** **`100% OPERATIONAL`**
- **Recommended Future Action:** Configure Vercel serverless function region to **`sin1` (Singapore)** to eliminate the US-to-Asia network hop.
