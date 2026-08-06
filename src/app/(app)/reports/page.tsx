import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { listAssessments } from "@/features/assessments/queries";

export default async function ReportsPage() {
  const ctx = await requireOrgContext();
  const assessments = await listAssessments(ctx.organizationId, 20);

  return (
    <div className="p-7 space-y-6">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">
          Laporan Assessment Physical (PDF)
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          Unduh dan cetak laporan hasil tes fisik resmi untuk dibagikan kepada pelatih, manajemen, atau orang tua atlet.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2 text-muted uppercase">
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
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Belum ada laporan assessment yang tersedia.
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {a.athlete.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(a.assessmentDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-accent">
                      {a.overallScore != null ? `${Number(a.overallScore).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold uppercase text-emerald-400">
                      {a.overallGrade || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/api/assessments/${a.id}/pdf`}
                        target="_blank"
                        className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white hover:opacity-90 transition"
                      >
                        📄 Download PDF
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
