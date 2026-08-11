import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteProgressData } from "@/features/progress/queries";
import { ProgressLineChart } from "@/features/progress/components/progress-line-chart";
import { TrendingUp, TrendingDown, Minus, Activity, ArrowUpRight } from "lucide-react";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string }>;
}) {
  const { athleteId } = await searchParams;
  const ctx = await requireOrgContext();
  const athletes = await getAthleteProgressData(ctx.organizationId);

  // Default ke atlet pertama jika tidak ada athleteId di URL
  const selectedAthlete = athleteId
    ? (athletes.find((a) => a.id === athleteId) ?? athletes[0])
    : athletes[0];

  // Ascending order sudah dijamin oleh query (orderBy assessmentDate asc)
  const assessments = selectedAthlete?.assessments ?? [];

  // Hitung tren: delta skor antara 2 assessment terbaru
  const scoreDelta =
    assessments.length >= 2
      ? Number(assessments[assessments.length - 1].overallScore ?? 0) -
        Number(assessments[assessments.length - 2].overallScore ?? 0)
      : null;

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
          Progress Perkembangan Atlet
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Pantau tren skor fisik atlet dari waktu ke waktu antar sesi tes berkala.
        </p>
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
            Tambah Atlet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[260px_1fr] gap-4 items-start">
          {/* ── Left Panel: Athlete List ──────────────────────────────── */}
          <div className="rounded-xl border border-border bg-surface-1 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                {athletes.length} Atlet
              </p>
            </div>
            <div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
              {athletes.map((athlete) => {
                const isSelected = athlete.id === selectedAthlete?.id;
                const lastAssessment = athlete.assessments[athlete.assessments.length - 1];
                return (
                  <Link
                    key={athlete.id}
                    href={`/progress?athleteId=${athlete.id}`}
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
                      <div className="text-sm font-medium text-foreground truncate">
                        {athlete.fullName}
                      </div>
                      <div className="text-[11px] text-muted">
                        {athlete.assessments.length} sesi
                        {lastAssessment &&
                          ` · ${Number(lastAssessment.overallScore ?? 0).toFixed(0)}%`}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Right Panel: Chart + Table ────────────────────────────── */}
          {selectedAthlete && (
            <div className="space-y-4">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide">
                    Total Sesi
                  </p>
                  <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                    {assessments.length}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide">
                    Skor Terkini
                  </p>
                  <p className="font-display text-3xl font-bold text-foreground tabular-nums">
                    {assessments.length > 0
                      ? `${Number(
                          assessments[assessments.length - 1].overallScore ?? 0
                        ).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-1.5">
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide">
                    Tren vs Sesi Lalu
                  </p>
                  <div className="flex items-center gap-1.5">
                    {scoreDelta !== null ? (
                      <>
                        {scoreDelta > 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        ) : scoreDelta < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        ) : (
                          <Minus className="h-5 w-5 text-muted" />
                        )}
                        <span
                          className={`font-display text-3xl font-bold tabular-nums ${
                            scoreDelta > 0
                              ? "text-emerald-400"
                              : scoreDelta < 0
                              ? "text-red-400"
                              : "text-muted"
                          }`}
                        >
                          {scoreDelta > 0 ? "+" : ""}
                          {scoreDelta.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted">Belum cukup data</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <div className="rounded-xl border border-border bg-surface-1 p-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-sm font-semibold text-foreground">
                    Tren Skor Keseluruhan — {selectedAthlete.fullName}
                  </h2>
                  <Link
                    href={`/assessments/new?athleteId=${selectedAthlete.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-accent hover:opacity-80 transition"
                  >
                    + Sesi Baru
                  </Link>
                </div>
                <p className="text-xs text-muted mb-4">
                  Garis putus hijau = standar Grade A (90%) · Garis putus biru = standar Grade B+ (80%)
                </p>

                {assessments.length >= 2 ? (
                  <ProgressLineChart
                    assessments={assessments}
                    athleteName={selectedAthlete.fullName}
                  />
                ) : assessments.length === 1 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Baru 1 sesi tes tercatat
                    </p>
                    <p className="text-xs text-muted max-w-xs">
                      Diperlukan minimal 2 sesi assessment untuk menampilkan grafik tren. Lakukan sesi berikutnya.
                    </p>
                    <Link
                      href={`/assessments/new?athleteId=${selectedAthlete.id}`}
                      className="mt-2 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition"
                    >
                      + Assessment Berikutnya
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Belum ada assessment
                    </p>
                    <p className="text-xs text-muted">
                      Lakukan assessment fisik pertama untuk atlet ini.
                    </p>
                    <Link
                      href={`/assessments/new?athleteId=${selectedAthlete.id}`}
                      className="mt-2 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition"
                    >
                      Mulai Assessment
                    </Link>
                  </div>
                )}
              </div>

              {/* Assessment History Table */}
              {assessments.length > 0 && (
                <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h2 className="font-display text-sm font-semibold text-foreground">
                      Riwayat Semua Sesi Assessment
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-surface-2/50">
                        <tr>
                          <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px]">
                            Sesi
                          </th>
                          <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px]">
                            Tanggal
                          </th>
                          <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-center">
                            Skor
                          </th>
                          <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-center">
                            Grade
                          </th>
                          <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-center">
                            Delta
                          </th>
                          <th className="px-5 py-3 font-medium text-muted uppercase tracking-wide text-[11px] text-right">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {/* Tampilkan dari terbaru ke terlama */}
                        {[...assessments].reverse().map((a, idx) => {
                          const currScore = Number(a.overallScore ?? 0);
                          // Sesi sebelumnya dalam urutan reversed = idx+1, yang dalam ascending = assessments[len-2-idx]
                          const prevEntry =
                            assessments.length - 2 - idx >= 0
                              ? assessments[assessments.length - 2 - idx]
                              : null;
                          const prevScore = prevEntry
                            ? Number(prevEntry.overallScore ?? 0)
                            : null;
                          const delta =
                            prevScore !== null ? currScore - prevScore : null;

                          return (
                            <tr
                              key={a.id}
                              className="hover:bg-surface-2/30 transition-colors"
                            >
                              <td className="px-5 py-3 font-mono text-muted tabular-nums">
                                #{assessments.length - idx}
                              </td>
                              <td className="px-5 py-3 text-foreground">
                                {formatDate(a.assessmentDate)}
                              </td>
                              <td className="px-5 py-3 text-center font-mono font-bold text-foreground tabular-nums">
                                {currScore.toFixed(1)}%
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
                              <td className="px-5 py-3 text-center">
                                {delta !== null ? (
                                  <span
                                    className={`font-mono font-bold ${
                                      delta > 0
                                        ? "text-emerald-400"
                                        : delta < 0
                                        ? "text-red-400"
                                        : "text-muted"
                                    }`}
                                  >
                                    {delta > 0 ? "+" : ""}
                                    {delta.toFixed(1)}%
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
