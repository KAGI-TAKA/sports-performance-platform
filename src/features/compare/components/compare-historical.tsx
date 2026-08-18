"use client";

import { useState } from "react";
import { DualRadarChart } from "@/features/assessments/components/dual-radar-chart";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

type AthleteOption = {
  id: string;
  fullName: string;
  position: string;
  assessments: Array<{
    id: string;
    assessmentDate: Date;
    overallScore: unknown;
    overallGrade: string | null;
  }>;
};

type AssessmentDetail = {
  id: string;
  athleteId: string;
  assessmentDate: Date;
  overallScore: unknown;
  overallGrade: string | null;
  resultItems: Array<{
    id: string;
    rawValue: unknown;
    score: unknown;
    testItem: {
      id: string;
      name: string;
      unit: string;
      physicalComponent: string | null;
      scoreDirection: string;
    };
  }>;
  analysis: {
    componentScores: Record<string, number> | string | null | unknown;
    bestComponent: string | null;
    weakestComponents: string[];
    insightText?: string | null;
    recommendationText?: string | null;
  } | null;
};

export function CompareHistorical({
  athletes,
  assessmentDetailsMap,
}: {
  athletes: AthleteOption[];
  assessmentDetailsMap: Record<string, AssessmentDetail>;
}) {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id ?? ""
  );

  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId);
  const athleteAssessments = currentAthlete?.assessments ?? [];

  // Base Assessment (Tes Lama) & Comparison Assessment (Tes Baru)
  const [assessmentIdA, setAssessmentIdA] = useState<string>(
    athleteAssessments[athleteAssessments.length - 1]?.id ?? ""
  );
  const [assessmentIdB, setAssessmentIdB] = useState<string>(
    athleteAssessments[0]?.id ?? ""
  );

  // Fallback active IDs if athlete changed
  const activeIdA = athleteAssessments.some((a) => a.id === assessmentIdA)
    ? assessmentIdA
    : (athleteAssessments[athleteAssessments.length - 1]?.id ?? "");

  const activeIdB = athleteAssessments.some((a) => a.id === assessmentIdB)
    ? assessmentIdB
    : (athleteAssessments[0]?.id ?? "");

  const detailA = activeIdA ? assessmentDetailsMap[activeIdA] : null;
  const detailB = activeIdB ? assessmentDetailsMap[activeIdB] : null;

  const scoreA = detailA ? Number(detailA.overallScore) : 0;
  const scoreB = detailB ? Number(detailB.overallScore) : 0;
  const deltaOverall = scoreB - scoreA;

  // Parse component scores
  const compScoresA: Record<string, number> = detailA?.analysis?.componentScores
    ? typeof detailA.analysis.componentScores === "string"
      ? JSON.parse(detailA.analysis.componentScores)
      : detailA.analysis.componentScores
    : {};

  const compScoresB: Record<string, number> = detailB?.analysis?.componentScores
    ? typeof detailB.analysis.componentScores === "string"
      ? JSON.parse(detailB.analysis.componentScores)
      : detailB.analysis.componentScores
    : {};

  // Build items map
  const itemsMap: Record<
    string,
    {
      name: string;
      component: string | null;
      unit: string;
      valA: number | null;
      scoreA: number | null;
      valB: number | null;
      scoreB: number | null;
    }
  > = {};

  detailA?.resultItems.forEach((r) => {
    itemsMap[r.testItem.id] = {
      name: r.testItem.name,
      component: r.testItem.physicalComponent,
      unit: r.testItem.unit,
      valA: Number(r.rawValue),
      scoreA: Number(r.score ?? 0),
      valB: null,
      scoreB: null,
    };
  });

  detailB?.resultItems.forEach((r) => {
    if (!itemsMap[r.testItem.id]) {
      itemsMap[r.testItem.id] = {
        name: r.testItem.name,
        component: r.testItem.physicalComponent,
        unit: r.testItem.unit,
        valA: null,
        scoreA: null,
        valB: Number(r.rawValue),
        scoreB: Number(r.score ?? 0),
      };
    } else {
      itemsMap[r.testItem.id].valB = Number(r.rawValue);
      itemsMap[r.testItem.id].scoreB = Number(r.score ?? 0);
    }
  });

  const itemList = Object.values(itemsMap);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Pickers Header */}
      <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="w-full sm:w-72">
            <label className="block text-xs font-medium text-muted mb-1">
              Pilih Atlet
            </label>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-accent focus:outline-none"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} ({a.position.replace(/_/g, " ")})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Tes A (Lama) */}
            <div className="flex-1 sm:w-52">
              <label className="block text-xs font-medium text-muted mb-1">
                Tes A (Sebelum / Basis)
              </label>
              <select
                value={activeIdA}
                onChange={(e) => setAssessmentIdA(e.target.value)}
                className="w-full rounded-md border border-blue-500/40 bg-surface-2 px-2.5 py-2 text-xs font-semibold text-foreground focus:outline-none"
              >
                {athleteAssessments.map((ass) => (
                  <option key={ass.id} value={ass.id}>
                    {formatDate(ass.assessmentDate)} ({Number(ass.overallScore).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>

            <span className="text-muted mt-5">→</span>

            {/* Tes B (Baru) */}
            <div className="flex-1 sm:w-52">
              <label className="block text-xs font-medium text-muted mb-1">
                Tes B (Sesudah / Evaluasi)
              </label>
              <select
                value={activeIdB}
                onChange={(e) => setAssessmentIdB(e.target.value)}
                className="w-full rounded-md border border-emerald-500/40 bg-surface-2 px-2.5 py-2 text-xs font-semibold text-foreground focus:outline-none"
              >
                {athleteAssessments.map((ass) => (
                  <option key={ass.id} value={ass.id}>
                    {formatDate(ass.assessmentDate)} ({Number(ass.overallScore).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delta Card */}
        {detailA && detailB && (
          <div className="pt-3 border-t border-border flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted" />
              <span className="text-xs text-muted">
                Perbandingan: <strong>{formatDate(detailA.assessmentDate)}</strong> vs{" "}
                <strong>{formatDate(detailB.assessmentDate)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">Perkembangan Skor:</span>
              <span className="font-mono text-base font-bold text-foreground">
                {scoreA.toFixed(1)}% → {scoreB.toFixed(1)}%
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                  deltaOverall >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {deltaOverall >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {deltaOverall >= 0 ? "+" : ""}
                {deltaOverall.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dual Radar Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-1 p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-1">
            Radar Perubahan Fisik Atlet
          </h3>
          <p className="text-xs text-muted mb-3">
            Overlay grafik radar: Biru (Sebelum / {detailA ? formatDate(detailA.assessmentDate) : ""}) vs{" "}
            Hijau (Sesudah / {detailB ? formatDate(detailB.assessmentDate) : ""}).
          </p>

          <DualRadarChart
            nameA={`Sebelum (${detailA ? formatDate(detailA.assessmentDate) : "Tes A"})`}
            scoresA={compScoresA}
            colorA="#3b82f6"
            nameB={`Sesudah (${detailB ? formatDate(detailB.assessmentDate) : "Tes B"})`}
            scoresB={compScoresB}
            colorB="#10b981"
          />
        </div>

        {/* Insight Box */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Evaluasi Perkembangan
            </h3>

            {detailA && detailB ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-2/60 space-y-1">
                  <div className="text-muted font-medium">Status Tren Fisik:</div>
                  <div className="font-semibold text-foreground">
                    {deltaOverall > 2
                      ? "📈 Mengalami peningkatan performa yang signifikan."
                      : deltaOverall < -2
                      ? "📉 Terjadi penurunan kondisi fisik, perlu evaluasi program latihan."
                      : "➡️ Kondisi fisik stabil / tidak banyak berubah."}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-2/60 space-y-1">
                  <div className="text-muted font-medium">Rekomendasi Terkini:</div>
                  <p className="text-secondary leading-relaxed">
                    {detailB.analysis?.recommendationText ?? "Lanjutkan program rutin."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted py-4">Pilih 2 sesi tes untuk evaluasi.</p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Delta Perubahan Per Item Tes Fisik
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2/50">
              <tr>
                <th className="px-4 py-3 font-medium text-muted uppercase tracking-wide">Item Tes</th>
                <th className="px-4 py-3 font-medium text-muted uppercase tracking-wide">Komponen</th>
                <th className="px-4 py-3 font-medium text-blue-400 uppercase tracking-wide text-right">
                  Tes A (Sebelum)
                </th>
                <th className="px-4 py-3 font-medium text-emerald-400 uppercase tracking-wide text-right">
                  Tes B (Sesudah)
                </th>
                <th className="px-4 py-3 font-medium text-muted uppercase tracking-wide text-right">
                  Perubahan Delta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {itemList.map((item) => {
                const scoreA = item.scoreA ?? 0;
                const scoreB = item.scoreB ?? 0;
                const deltaScore = scoreB - scoreA;
                const deltaVal =
                  item.valA != null && item.valB != null
                    ? item.valB - item.valA
                    : null;

                return (
                  <tr key={item.name} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-muted capitalize">
                      {item.component ? item.component.replace(/_/g, " ").toLowerCase() : "general"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                      {item.valA != null ? `${item.valA} ${item.unit}` : "—"}{" "}
                      <span className="text-[10px] text-muted">({scoreA}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {item.valB != null ? `${item.valB} ${item.unit}` : "—"}{" "}
                      <span className="text-[10px] text-muted">({scoreB}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deltaVal != null ? (
                        <div
                          className={`inline-flex items-center gap-1 font-mono font-bold ${
                            deltaScore > 0
                              ? "text-emerald-400"
                              : deltaScore < 0
                              ? "text-red-400"
                              : "text-muted"
                          }`}
                        >
                          {deltaScore > 0 ? "+" : ""}
                          {deltaScore}%{" "}
                          <span className="text-[10px] text-muted">
                            ({deltaVal > 0 ? "+" : ""}
                            {deltaVal.toFixed(1)} {item.unit})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
