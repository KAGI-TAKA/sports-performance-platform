import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { listAssessments, REPORTS_PER_PAGE } from "@/features/assessments/queries";
import { Pagination } from "@/components/ui/pagination";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import { WhatsAppShareButton } from "@/features/reports/components/whatsapp-share-button";
import { ProgressComparisonToggle } from "@/features/reports/components/progress-comparison-toggle";

const GRADE_COLORS: Record<string, string> = {
  A: "text-emerald-400 bg-emerald-500/10",
  "B+": "text-blue-400 bg-blue-500/10",
  B: "text-blue-400 bg-blue-500/10",
  "C+": "text-amber-400 bg-amber-500/10",
  C: "text-amber-400 bg-amber-500/10",
  D: "text-red-400 bg-red-500/10",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; compare?: string }>;
}) {
  const { page: pageParam, compare } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const ctx = await requireOrgContext();
  const { assessments, total } = await listAssessments(ctx.organizationId, page);
  const totalPages = Math.ceil(total / REPORTS_PER_PAGE);

  const start = (page - 1) * REPORTS_PER_PAGE + 1;
  const end = Math.min(page * REPORTS_PER_PAGE, total);

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Laporan Assessment Physical (PDF &amp; WA)
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Unduh laporan PDF resmi atau kirimkan ringkasan instan langsung ke WhatsApp Orang Tua/Atlet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportCSVButton endpoint="/api/export/assessments" label="Export CSV Assessment" />
          <ProgressComparisonToggle />
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-lg border border-border bg-surface-1">
        {/* Table meta bar */}
        {total > 0 && (
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs text-muted">
              Menampilkan <span className="font-medium text-foreground">{start}–{end}</span> dari{" "}
              <span className="font-medium text-foreground">{total}</span> laporan
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2 text-muted uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5">Atlet</th>
                <th className="px-4 py-2.5">Tanggal Assessment</th>
                <th className="px-4 py-2.5 text-center">Skor</th>
                <th className="px-4 py-2.5 text-center">Grade</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted">
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
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-muted">
                        {new Date(a.assessmentDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3 text-center font-mono font-bold text-accent">
                        {a.overallScore != null ? `${Number(a.overallScore).toFixed(1)}%` : "—"}
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-3 text-center">
                        {a.overallGrade ? (
                          <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${gradeClass}`}>
                            {a.overallGrade}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
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
          <div className="border-t border-border px-4 py-3">
            <Pagination page={page} totalPages={totalPages} path="/reports" />
          </div>
        )}
      </div>
    </div>
  );
}
