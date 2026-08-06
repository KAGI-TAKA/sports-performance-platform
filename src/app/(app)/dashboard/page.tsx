import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getDashboardStats } from "@/features/dashboard/queries";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import {
  Users,
  ClipboardCheck,
  Award,
  Flame,
  BarChart2,
  ArrowUpRight,
} from "lucide-react";

const GRADE_COLOR: Record<string, string> = {
  A: "#22c55e",
  "B+": "#4ade80",
  B: "#86efac",
  "C+": "#fbbf24",
  C: "#fb923c",
  D: "#f87171",
};

function gradeColor(grade: string | null) {
  if (!grade) return "#94a3b8";
  return GRADE_COLOR[grade] ?? "#94a3b8";
}

export default async function DashboardPage() {
  const ctx = await requireOrgContext();
  const stats = await getDashboardStats(ctx.organizationId);

  let weakestComps: Array<{ key: string; score: number }> = [];
  let bestComp: { key: string; score: number } | null = null;

  if (stats.squadComponentScores) {
    const sorted = Object.entries(stats.squadComponentScores).sort(
      (a, b) => a[1] - b[1]
    );
    if (sorted.length > 0) {
      weakestComps = sorted.slice(0, 2).map(([key, score]) => ({ key, score }));
      const best = sorted[sorted.length - 1];
      bestComp = { key: best[0], score: best[1] };
    }
  }

  const compLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ringkasan kondisi fisik atlet dan statistik assessment terkini.
          </p>
        </div>
        <Link
          href="/assessments/new"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))" }}
        >
          <ClipboardCheck className="h-4 w-4" />
          Assessment Baru
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Atlet */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Total Atlet</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-foreground tabular-nums">
            {stats.totalAthletes}
          </div>
          <p className="text-[11px] text-muted">atlet aktif terdaftar</p>
        </div>

        {/* Assessment Bulan Ini */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Bulan Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <ClipboardCheck className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-foreground tabular-nums">
            {stats.assessmentsThisMonth}
          </div>
          <p className="text-[11px] text-muted">assessment selesai</p>
        </div>

        {/* Rata-rata Skor */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Rata-rata Skor</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-foreground tabular-nums">
            {stats.avgScore != null ? `${stats.avgScore}%` : "—"}
          </div>
          <p className="text-[11px] text-muted">
            {stats.avgScore != null ? "rata-rata performa skuad" : "belum ada data skor"}
          </p>
        </div>

        {/* Atlet Teraktif */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Teraktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
              <Flame className="h-4 w-4 text-rose-400" />
            </div>
          </div>
          <div className="font-display text-lg font-bold text-foreground leading-tight line-clamp-2 min-h-[2.25rem]">
            {stats.topActiveAthlete ? stats.topActiveAthlete.fullName : "—"}
          </div>
          <p className="text-[11px] text-muted">
            {stats.topActiveAthlete
              ? `${stats.topActiveAthlete.count}× assessment bulan ini`
              : "belum ada assessment bulan ini"}
          </p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Komponen Terlemah vs Terbaik */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 flex flex-col gap-4">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Profil Komponen Skuad
          </h2>

          {stats.squadComponentScores && bestComp ? (
            <div className="space-y-3 flex-1">
              <div className="text-[11px] font-medium text-muted uppercase tracking-wide mb-1">
                Perlu Perhatian
              </div>
              {weakestComps.map((comp) => (
                <div key={comp.key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground">{compLabel(comp.key)}</span>
                    <span className="text-xs font-mono font-semibold text-danger">{comp.score}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-danger/70"
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-3 mt-3">
                <div className="text-[11px] font-medium text-muted uppercase tracking-wide mb-1">
                  Komponen Terkuat
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-foreground">{compLabel(bestComp.key)}</span>
                    <span className="text-xs font-mono font-semibold text-success">{bestComp.score}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-success/70"
                      style={{ width: `${bestComp.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* All components bar mini */}
              <div className="pt-2 border-t border-border">
                <div className="text-[11px] font-medium text-muted uppercase tracking-wide mb-2">Semua Komponen</div>
                <div className="space-y-1.5">
                  {Object.entries(stats.squadComponentScores)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, score]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted w-36 shrink-0 truncate">{compLabel(key)}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${score}%`,
                              background:
                                score >= 80
                                  ? "hsl(150 52% 52%)"
                                  : score >= 60
                                  ? "hsl(230 90% 67%)"
                                  : "hsl(3 74% 68%)",
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-secondary w-8 text-right">{score}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2">
                <BarChart2 className="h-5 w-5 text-muted" />
              </div>
              <p className="text-sm font-medium text-foreground">Belum ada evaluasi komponen</p>
              <p className="text-xs text-muted max-w-xs">
                Grafik akan terbentuk setelah ada hasil assessment fisik yang tersimpan.
              </p>
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 flex flex-col gap-3">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Radar Fisik — 7 Komponen
          </h2>

          {stats.squadComponentScores ? (
            <div className="flex-1">
              <AssessmentRadarChart componentScores={stats.squadComponentScores} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2">
                <BarChart2 className="h-5 w-5 text-muted" />
              </div>
              <p className="text-sm font-medium text-foreground">Belum ada data radar</p>
              <p className="text-xs text-muted max-w-xs">
                Grafik radar 7 komponen fisik akan muncul setelah ada assessment selesai.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Terbaru */}
      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Assessment Terbaru
          </h2>
          <Link
            href="/reports"
            className="flex items-center gap-1 text-xs text-muted hover:text-accent transition"
          >
            Lihat semua
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2/50">
              <tr>
                <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px]">Atlet</th>
                <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px]">Tanggal</th>
                <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-center">Skor</th>
                <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-center">Grade</th>
                <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.latestAssessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    Belum ada assessment. Mulai dengan klik tombol "Assessment Baru" di atas.
                  </td>
                </tr>
              ) : (
                stats.latestAssessments.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-2/30 transition-colors group">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {a.athlete.fullName}
                    </td>
                    <td className="px-5 py-3 text-muted tabular-nums">
                      {new Date(a.assessmentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-center font-mono font-semibold text-foreground tabular-nums">
                      {a.overallScore != null ? `${Number(a.overallScore).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {a.overallGrade ? (
                        <span
                          className="inline-flex items-center justify-center h-6 min-w-[2rem] rounded-md px-1.5 text-[11px] font-bold"
                          style={{
                            backgroundColor: gradeColor(a.overallGrade) + "22",
                            color: gradeColor(a.overallGrade),
                          }}
                        >
                          {a.overallGrade}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/assessments/${a.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-secondary hover:text-accent hover:bg-accent/10 transition"
                      >
                        Detail
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
