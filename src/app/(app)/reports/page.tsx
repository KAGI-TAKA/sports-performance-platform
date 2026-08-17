import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { listAssessments, REPORTS_PER_PAGE } from "@/features/assessments/queries";
import { getOrganizationAnalyticsOverview } from "@/features/analytics/queries";
import { Pagination } from "@/components/ui/pagination";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import { WhatsAppShareButton } from "@/features/reports/components/whatsapp-share-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Award,
  Activity,
  Dumbbell,
  ClipboardCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { PHYSICAL_COMPONENTS } from "@/features/analytics/types";

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-400 bg-emerald-500/10",
  "B+": "text-blue-400 bg-blue-500/10",
  B: "text-blue-400 bg-blue-500/10",
  "C+": "text-amber-400 bg-amber-500/10",
  C: "text-amber-400 bg-amber-500/10",
  D: "text-red-400 bg-red-500/10",
};

function componentNameID(comp: string): string {
  const names: Record<string, string> = {
    FLEXIBILITY: "Kelenturan",
    SPEED: "Kecepatan",
    POWER: "Daya Ledak",
    AGILITY: "Kelincahan",
    MUSCULAR_ENDURANCE: "Daya Tahan Otot",
    ANAEROBIC_ENDURANCE: "Daya Tahan Anaerobik",
    AEROBIC_ENDURANCE: "Daya Tahan Aerobik",
  };
  return names[comp] ?? comp;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; compare?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const ctx = await requireOrgContext();

  const [orgAnalytics, { assessments, total }] = await Promise.all([
    getOrganizationAnalyticsOverview(ctx.organizationId),
    listAssessments(ctx.organizationId, page),
  ]);

  const totalPages = Math.ceil(total / REPORTS_PER_PAGE);
  const start = (page - 1) * REPORTS_PER_PAGE + 1;
  const end = Math.min(page * REPORTS_PER_PAGE, total);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-accent" />
            Laporan Analitis &amp; Ringkasan Performa Organisasi
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Unduh laporan resmi (PDF &amp; CSV) dan analisis distribusi performa fisik seluruh atlet organisasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportCSVButton endpoint="/api/export/assessments" label="Export CSV Assessment" />
          <ExportCSVButton endpoint="/api/export/session-logs" label="Export CSV Sesi" />
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Total Assessment
              </span>
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground tabular-nums">
              {orgAnalytics.totalAssessments}
            </p>
            <p className="text-[11px] text-muted">
              {orgAnalytics.totalAssessedAthletes} atlet terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Rata-rata Skor Skuad
              </span>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground tabular-nums">
              {orgAnalytics.averageOverallScore.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted">Seluruh sesi fisik</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Program Latihan Aktif
              </span>
              <Dumbbell className="h-4 w-4 text-purple-400" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground tabular-nums">
              {orgAnalytics.trainingSummary.activePlansCount}
            </p>
            <p className="text-[11px] text-muted">Template &amp; program atlet</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Log Sesi Terlaksana
              </span>
              <ClipboardCheck className="h-4 w-4 text-blue-400" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground tabular-nums">
              {orgAnalytics.trainingSummary.completedSessionLogsCount}
            </p>
            <p className="text-[11px] text-muted">Catatan latihan harian</p>
          </CardContent>
        </Card>
      </div>

      {/* 7 Physical Component Organization Performance & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7 Component Averages */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Rata-rata 7 Komponen Fisik Organisasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PHYSICAL_COMPONENTS.map((comp) => {
                const avg = orgAnalytics.componentAverages[comp] ?? 0;
                return (
                  <div
                    key={comp}
                    className="p-3 rounded-lg border border-border bg-surface-2/40 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {componentNameID(comp)}
                    </span>
                    <span className="font-mono font-bold text-xs text-accent">
                      {avg.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution Breakdown */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              Distribusi Grade Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            {Object.entries(orgAnalytics.scoreDistribution).map(([gradeKey, count]) => {
              const labelMap: Record<string, string> = {
                gradeA: "Grade A (>=90%)",
                gradeBPlus: "Grade B+ (>=80%)",
                gradeB: "Grade B (>=70%)",
                gradeCPlus: "Grade C+ (>=60%)",
                gradeC: "Grade C (>=50%)",
                gradeD: "Grade D (<50%)",
              };
              return (
                <div key={gradeKey} className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted">{labelMap[gradeKey] ?? gradeKey}:</span>
                  <span className="font-mono font-bold text-foreground">{count} atlet</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Main Assessment History & PDF/WA Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Daftar Laporan Assessment Physical Atlet
            </CardTitle>
            {total > 0 && (
              <p className="text-xs text-muted">
                Menampilkan <span className="font-medium text-foreground">{start}–{end}</span> dari{" "}
                <span className="font-medium text-foreground">{total}</span> laporan
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-2 text-muted uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3">Atlet</th>
                  <th className="px-5 py-3">Tanggal Assessment</th>
                  <th className="px-5 py-3 text-center">Skor</th>
                  <th className="px-5 py-3 text-center">Grade</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      <p className="text-sm font-medium">Belum ada laporan assessment.</p>
                      <p className="mt-1 text-xs">Buat assessment baru untuk atlet terlebih dahulu.</p>
                    </td>
                  </tr>
                ) : (
                  assessments.map((a) => {
                    const gradeClass = a.overallGrade
                      ? (GRADE_COLORS[a.overallGrade] ?? "text-muted")
                      : "text-muted";

                    return (
                      <tr key={a.id} className="hover:bg-surface-2/50 transition-colors">
                        {/* Athlete */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            {a.athlete.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.athlete.photoUrl}
                                alt={a.athlete.fullName}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{ background: "hsl(230 85% 58%)" }}
                              >
                                {a.athlete.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                              </div>
                            )}
                            <span className="font-semibold text-foreground">{a.athlete.fullName}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3 text-muted">
                          {new Date(a.assessmentDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>

                        {/* Score */}
                        <td className="px-5 py-3 text-center font-mono font-bold text-accent">
                          {a.overallScore != null ? `${Number(a.overallScore).toFixed(1)}%` : "—"}
                        </td>

                        {/* Grade */}
                        <td className="px-5 py-3 text-center">
                          {a.overallGrade ? (
                            <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${gradeClass}`}>
                              {a.overallGrade}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <WhatsAppShareButton
                              summary={{
                                athleteName: a.athlete.fullName,
                                assessmentDate: a.assessmentDate,
                                overallScore: a.overallScore != null ? Number(a.overallScore) : null,
                                overallGrade: a.overallGrade,
                              }}
                            />
                            <Link
                              href={`/api/assessments/${a.id}/pdf`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 transition"
                            >
                              📄 Download PDF
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-5 py-3">
              <Pagination page={page} totalPages={totalPages} path="/reports" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
