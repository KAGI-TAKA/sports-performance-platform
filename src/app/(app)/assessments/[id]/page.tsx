import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getAssessmentById, getPreviousAssessment } from "@/features/assessments/queries";
import { AssessmentRadarChart } from "@/features/assessments/components/radar-chart";
import { PhysicalComponent } from "@prisma/client";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const assessment = await getAssessmentById(ctx.organizationId, id);
  if (!assessment) notFound();

  const prevAssessment = await getPreviousAssessment(
    ctx.organizationId,
    assessment.athleteId,
    assessment.assessmentDate
  );

  const currentScore = Number(assessment.overallScore ?? 0);
  const prevScore = prevAssessment ? Number(prevAssessment.overallScore ?? 0) : null;
  const scoreDelta = prevScore != null ? currentScore - prevScore : null;

  // Parse componentScores JSON from analysis
  let componentScores: Record<string, number> = {};
  if (assessment.analysis?.componentScores) {
    try {
      componentScores = typeof assessment.analysis.componentScores === "string"
        ? JSON.parse(assessment.analysis.componentScores)
        : (assessment.analysis.componentScores as Record<string, number>);
    } catch (e) {
      componentScores = {};
    }
  }

  const bestComponent = assessment.analysis?.bestComponent;
  const weakestComponents = assessment.analysis?.weakestComponents ?? [];

  return (
    <div className="mx-auto max-w-5xl p-7 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="text-xs text-muted mb-1">
            <Link href="/athletes" className="hover:underline">
              Atlet
            </Link>{" "}
            /{" "}
            <Link href={`/athletes?athleteId=${assessment.athleteId}`} className="hover:underline">
              {assessment.athlete.fullName}
            </Link>{" "}
            / Assessment
          </div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Hasil Assessment Fisik — {assessment.athlete.fullName}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Tanggal Tes:{" "}
            {new Date(assessment.assessmentDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/api/assessments/${assessment.id}/pdf`}
            target="_blank"
            className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition shadow-sm"
          >
            📄 Generate PDF
          </Link>
          <Link
            href={`/athletes?athleteId=${assessment.athleteId}`}
            className="rounded-md border border-border px-4 py-2 text-xs font-medium text-secondary hover:bg-surface-2"
          >
            Simpan
          </Link>
        </div>
      </div>

      {/* Top Stat Cards (Wireframe 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-indigo-950/40 p-5 border-indigo-800/40">
          <div className="text-xs text-indigo-300 font-medium">Skor Keseluruhan</div>
          <div className="font-mono text-4xl font-extrabold text-white mt-2">
            {assessment.overallScore != null ? `${Number(assessment.overallScore).toFixed(2)}%` : "—"}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-emerald-950/40 p-5 border-emerald-800/40">
          <div className="text-xs text-emerald-300 font-medium">Grade</div>
          <div className="font-mono text-4xl font-extrabold text-emerald-400 mt-2 uppercase">
            {assessment.overallGrade || "—"}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <div className="text-xs text-muted font-medium">Dibanding Assessment Lalu</div>
          <div className="mt-2 flex items-baseline gap-2">
            {scoreDelta != null ? (
              <>
                <span
                  className={`font-mono text-2xl font-bold ${
                    scoreDelta >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} poin
                </span>
                <span className="text-xs text-muted">
                  ({scoreDelta >= 0 ? "meningkat" : "penurunan"})
                </span>
              </>
            ) : (
              <span className="text-sm text-muted">Assessment Pertama</span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Grid: Radar Chart + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface-1 p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2">
            Radar Chart 7 Komponen Fisik
          </h3>
          <AssessmentRadarChart componentScores={componentScores} />
        </div>

        {/* Highlights Right Column */}
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 p-5">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Komponen Terbaik
            </div>
            <div className="mt-2 text-base font-bold text-foreground capitalize">
              {bestComponent ? bestComponent.replace(/_/g, " ").toLowerCase() : "—"}
            </div>
            <div className="mt-1 text-xs text-emerald-300/80">
              Performa fisik paling menonjol pada sesi tes ini.
            </div>
          </div>

          <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-5">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Perlu Perhatian
            </div>
            <div className="mt-2 text-base font-bold text-foreground capitalize">
              {weakestComponents.length > 0
                ? weakestComponents.map((w) => w.replace(/_/g, " ").toLowerCase()).join(", ")
                : "—"}
            </div>
            <div className="mt-1 text-xs text-amber-300/80">
              Perlu porsi latihan khusus untuk ditingkatkan.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Automated Insight & Recommendation Box */}
      <div className="rounded-lg border border-border bg-surface-1 p-6 space-y-3">
        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          <span>🤖</span> Insight Otomatis & Rekomendasi Program
        </h3>

        <div className="rounded-md bg-surface-2 p-4 text-xs text-secondary space-y-2 leading-relaxed">
          <p>{assessment.analysis?.insightText || "Belum ada analisis otomatis untuk assessment ini."}</p>
          <p className="font-semibold text-foreground">
            {assessment.analysis?.recommendationText || "Lanjutkan program latihan rutin."}
          </p>
        </div>
      </div>

      {/* Detailed Result Items Table */}
      <div className="rounded-lg border border-border bg-surface-1 p-6">
        <h3 className="font-display text-sm font-semibold text-foreground mb-4">
          Detail Hasil Tes Per Item
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2 text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5">Item Tes</th>
                <th className="px-4 py-2.5">Komponen Fisik</th>
                <th className="px-4 py-2.5 text-right">Nilai Mentah</th>
                <th className="px-4 py-2.5 text-right">Skor (0-100)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assessment.resultItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.testItem.name}
                  </td>
                  <td className="px-4 py-3 text-muted capitalize">
                    {item.testItem.physicalComponent.replace("_", " ").toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground font-semibold">
                    {item.rawValue != null
                      ? `${item.rawValue.toString()} ${item.testItem.unit.toLowerCase()}`
                      : item.qualitativeValue ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-accent font-bold">
                    {item.score?.toString() ?? "—"}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
