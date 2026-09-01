import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import {
  listAthletesForAnalytics,
  getAthleteProgressSummary,
  getAthleteDetailedProgressTimeline,
} from "@/features/analytics/queries";
import { ProgressLineChart } from "@/features/progress/components/progress-line-chart";
import { AthleteProgressTimeline } from "@/features/progress/components/athlete-progress-timeline";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Sparkles,
  Zap,
  ChevronRight,
  Clock,
} from "lucide-react";
import { PHYSICAL_COMPONENTS } from "@/features/analytics/types";

function componentNameID(comp: string): string {
  const names: Record<string, string> = {
    FLEXIBILITY: "Kelenturan (Flexibility)",
    SPEED: "Kecepatan (Speed)",
    POWER: "Daya Ledak (Power)",
    AGILITY: "Kelincahan (Agility)",
    MUSCULAR_ENDURANCE: "Daya Tahan Otot",
    ANAEROBIC_ENDURANCE: "Daya Tahan Anaerobik",
    AEROBIC_ENDURANCE: "Daya Tahan Aerobik (VO2Max)",
  };
  return names[comp] ?? comp;
}

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string; period?: string }>;
}) {
  const { athleteId, period = "ALL" } = await searchParams;
  const ctx = await requireOrgContext();

  const athletes = await listAthletesForAnalytics(ctx.organizationId);

  const selectedAthlete = athleteId
    ? (athletes.find((a) => a.id === athleteId) ?? athletes[0])
    : athletes[0];

  const [summary, detailedTimeline] = await Promise.all([
    selectedAthlete
      ? getAthleteProgressSummary(ctx.organizationId, selectedAthlete.id)
      : Promise.resolve(null),
    selectedAthlete
      ? getAthleteDetailedProgressTimeline(ctx.organizationId, selectedAthlete.id)
      : Promise.resolve(null),
  ]);

  const assessments = summary?.assessmentTimeline ?? [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl flex items-center gap-2">
            <Activity className="h-6 w-6 text-accent" />
            Analisis Progress &amp; Perkembangan Atlet
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Pantau tren perkembangan skor fisik 7 komponen utama dari waktu ke waktu.
          </p>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 border border-border text-xs">
          <span className="text-muted px-2 font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Periode:
          </span>
          {["ALL", "90", "30", "7"].map((p) => {
            const label = p === "ALL" ? "Semua" : `${p} Hari`;
            const isActive = period === p;
            const href = selectedAthlete
              ? `/progress?athleteId=${selectedAthlete.id}&period=${p}`
              : `/progress?period=${p}`;
            return (
              <Link
                key={p}
                href={href}
                className={`rounded-md px-2.5 py-1 font-semibold transition ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {athletes.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-1 p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 mx-auto">
            <Activity className="h-6 w-6 text-muted" />
          </div>
          <p className="text-sm font-medium text-foreground">Belum ada data atlet</p>
          <p className="text-xs text-muted max-w-xs mx-auto">
            Tambah atlet dan lakukan assessment untuk mulai melacak progress.
          </p>
          <Link
            href="/athletes/new"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
          >
            + Tambah Atlet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left Panel: Athlete Roster Picker */}
          <div className="rounded-xl border border-border bg-surface-1 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Daftar Atlet ({athletes.length})
              </p>
              <span className="text-[10px] text-muted font-mono">Historis Terbuka</span>
            </div>
            <div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
              {athletes.map((athlete) => {
                const isSelected = athlete.id === selectedAthlete?.id;
                const lastAss = athlete.assessments[athlete.assessments.length - 1];
                return (
                  <Link
                    key={athlete.id}
                    href={`/progress?athleteId=${athlete.id}&period=${period}`}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-accent/10 border-l-2 border-accent"
                        : "hover:bg-surface-2/60 border-l-2 border-transparent"
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))"
                          : "hsl(var(--surface-3))",
                        color: isSelected ? "white" : "hsl(var(--text-secondary))",
                      }}
                    >
                      {athlete.fullName
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {athlete.fullName}
                        </span>
                        {!athlete.isActive && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            Nonaktif
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted">
                        {athlete.assessments.length} sesi
                        {lastAss && ` · ${Number(lastAss.overallScore ?? 0).toFixed(0)}%`}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Progress Intelligence Dashboard */}
          {summary && selectedAthlete && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">
                    Total Sesi Assessment
                  </p>
                  <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                    {summary.totalAssessments}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">
                    Skor Assessment Terkini
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                      {summary.latestScore != null ? `${summary.latestScore.toFixed(1)}%` : "—"}
                    </p>
                    {summary.latestGrade && (
                      <Badge variant="accent" className="font-bold text-xs">
                        Grade {summary.latestGrade}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">
                    Tren Overall vs Sesi Lalu
                  </p>
                  <div className="flex items-center gap-1.5">
                    {summary.overallDelta !== null ? (
                      <>
                        {summary.overallDelta > 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        ) : summary.overallDelta < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        ) : (
                          <Minus className="h-5 w-5 text-muted" />
                        )}
                        <span
                          className={`font-display text-3xl font-bold tabular-nums ${
                            summary.overallDelta > 0
                              ? "text-emerald-400"
                              : summary.overallDelta < 0
                              ? "text-red-400"
                              : "text-muted"
                          }`}
                        >
                          {summary.overallDelta > 0 ? "+" : ""}
                          {summary.overallDelta.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted font-medium">Belum cukup data</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlights & Intelligence Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    Komponen Peningkatan Terbesar
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {summary.strongestImprovingComponent
                      ? componentNameID(summary.strongestImprovingComponent)
                      : "Belum Ada Peningkatan Signifikan"}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Zap className="h-4 w-4" />
                    Komponen Penurunan Terbesar
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {summary.largestDecliningComponent
                      ? componentNameID(summary.largestDecliningComponent)
                      : "Tidak Ada Penurunan Signifikan"}
                  </p>
                </div>
              </div>

              {/* Line Chart */}
              <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-foreground">
                    Grafik Tren Perkembangan Skor — {selectedAthlete.fullName}
                  </h2>
                  <Link
                    href={`/assessments/new?athleteId=${selectedAthlete.id}`}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    + Assessment Baru <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {assessments.length >= 2 ? (
                  <ProgressLineChart
                    assessments={assessments}
                    athleteName={selectedAthlete.fullName}
                  />
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      {assessments.length === 1
                        ? "Baru 1 Sesi Assessment Terlibat"
                        : "Belum Ada Assessment"}
                    </p>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Minimal 2 sesi assessment dibutuhkan untuk membentuk garis grafik tren perkembangan.
                    </p>
                  </div>
                )}
              </div>

              {/* 7 Component Trend Breakdown Grid */}
              <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Rincian Tren 7 Komponen Fisik
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PHYSICAL_COMPONENTS.map((comp) => {
                    const detail = summary.componentTrends[comp];
                    const latest = detail?.latestScore;
                    const prev = detail?.previousScore;
                    const delta = detail?.delta;
                    const trend = detail?.trend;

                    return (
                      <div
                        key={comp}
                        className="p-3.5 rounded-lg border border-border bg-surface-2/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {componentNameID(comp)}
                          </span>
                          <Badge
                            variant={
                              trend === "IMPROVING"
                                ? "success"
                                : trend === "DECLINING"
                                ? "danger"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {trend}
                          </Badge>
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-[11px] text-muted">Skor Terkini:</span>
                          <span className="font-mono font-bold text-sm text-foreground">
                            {latest != null ? `${latest.toFixed(1)}%` : "—"}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-[11px]">
                          <span className="text-muted">Sesi Lalu:</span>
                          <span className="font-mono text-muted">
                            {prev != null ? `${prev.toFixed(1)}%` : "—"}
                          </span>
                        </div>

                        {delta !== null && (
                          <div className="text-[11px] font-mono text-right pt-1 border-t border-border/40 font-bold">
                            <span
                              className={
                                delta > 0
                                  ? "text-emerald-400"
                                  : delta < 0
                                  ? "text-red-400"
                                  : "text-muted"
                              }
                            >
                              {delta > 0 ? "+" : ""}
                              {delta.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* P8-C1 + P8-C2: ATHLETE PROGRESS TIMELINE & PERSONAL BEST HUB */}
              {detailedTimeline && (
                <div className="pt-2">
                  <AthleteProgressTimeline data={detailedTimeline} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
