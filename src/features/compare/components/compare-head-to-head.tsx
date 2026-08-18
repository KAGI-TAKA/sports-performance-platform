"use client";

import { useState } from "react";
import { DualRadarChart } from "@/features/assessments/components/dual-radar-chart";
import { Trophy, Minus } from "lucide-react";

type AthleteOption = {
  id: string;
  fullName: string;
  position: string;
  jerseyNumber: number | null;
  dateOfBirth: Date;
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
  athlete: {
    fullName: string;
    position: string;
    heightCm: unknown;
    weightKg: unknown;
  };
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
  } | null;
};

export function CompareHeadToHead({
  athletes,
  assessmentDetailsMap,
}: {
  athletes: AthleteOption[];
  assessmentDetailsMap: Record<string, AssessmentDetail>;
}) {
  const [athleteIdA, setAthleteIdA] = useState<string>(athletes[0]?.id ?? "");
  const [athleteIdB, setAthleteIdB] = useState<string>(
    athletes[1]?.id ?? athletes[0]?.id ?? ""
  );

  const athleteA = athletes.find((a) => a.id === athleteIdA);
  const athleteB = athletes.find((a) => a.id === athleteIdB);

  const latestAssessmentIdA = athleteA?.assessments[0]?.id;
  const latestAssessmentIdB = athleteB?.assessments[0]?.id;

  const detailA = latestAssessmentIdA
    ? assessmentDetailsMap[latestAssessmentIdA]
    : null;
  const detailB = latestAssessmentIdB
    ? assessmentDetailsMap[latestAssessmentIdB]
    : null;

  // Parse component scores JSON
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

  // Build combined item list for side-by-side comparison
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

  const comparisonList = Object.values(itemsMap);

  return (
    <div className="space-y-6">
      {/* Athlete Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Picker A */}
        <div className="rounded-xl border border-blue-500/30 bg-surface-1 p-4 space-y-2">
          <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wide">
            Atlet A (Sudut Biru)
          </label>
          <select
            value={athleteIdA}
            onChange={(e) => setAthleteIdA(e.target.value)}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-blue-500 focus:outline-none"
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} ({a.position.replace(/_/g, " ")}) —{" "}
                {a.assessments.length} assessment
              </option>
            ))}
          </select>

          {detailA && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted">Skor Terakhir:</span>{" "}
                <span className="font-mono text-base font-bold text-blue-400">
                  {Number(detailA.overallScore).toFixed(1)}%
                </span>
              </div>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                Grade {detailA.overallGrade}
              </span>
            </div>
          )}
        </div>

        {/* Picker B */}
        <div className="rounded-xl border border-amber-500/30 bg-surface-1 p-4 space-y-2">
          <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wide">
            Atlet B (Sudut Oranye)
          </label>
          <select
            value={athleteIdB}
            onChange={(e) => setAthleteIdB(e.target.value)}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-amber-500 focus:outline-none"
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} ({a.position.replace(/_/g, " ")}) —{" "}
                {a.assessments.length} assessment
              </option>
            ))}
          </select>

          {detailB && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted">Skor Terakhir:</span>{" "}
                <span className="font-mono text-base font-bold text-amber-400">
                  {Number(detailB.overallScore).toFixed(1)}%
                </span>
              </div>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                Grade {detailB.overallGrade}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dual Radar Chart & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface-1 p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-1">
            Radar Overlay Komponen Fisik
          </h3>
          <p className="text-xs text-muted mb-3">
            Perbandingan visual 7 komponen fisik antara {athleteA?.fullName} vs{" "}
            {athleteB?.fullName}.
          </p>

          <DualRadarChart
            nameA={athleteA?.fullName ?? "Atlet A"}
            scoresA={compScoresA}
            colorA="#3b82f6"
            nameB={athleteB?.fullName ?? "Atlet B"}
            scoresB={compScoresB}
            colorB="#f97316"
          />
        </div>

        {/* Head-to-Head Highlight Cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-1 p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Hasil Komparasi Skuad
            </h3>

            {detailA && detailB ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-2/60 space-y-1">
                  <div className="text-muted font-medium">Selisih Total Skor:</div>
                  <div className="font-mono text-lg font-bold text-foreground">
                    {Math.abs(
                      Number(detailA.overallScore) - Number(detailB.overallScore)
                    ).toFixed(1)}%
                  </div>
                  <div className="text-muted">
                    {Number(detailA.overallScore) > Number(detailB.overallScore)
                      ? `${athleteA?.fullName} lebih unggul`
                      : Number(detailA.overallScore) < Number(detailB.overallScore)
                      ? `${athleteB?.fullName} lebih unggul`
                      : "Kedua atlet seimbang"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-2/60 space-y-1">
                  <div className="text-muted font-medium">Keunggulan Utama Atlet A:</div>
                  <div className="font-semibold text-blue-400 capitalize">
                    {detailA.analysis?.bestComponent
                      ? detailA.analysis.bestComponent.replace(/_/g, " ").toLowerCase()
                      : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-2/60 space-y-1">
                  <div className="text-muted font-medium">Keunggulan Utama Atlet B:</div>
                  <div className="font-semibold text-amber-400 capitalize">
                    {detailB.analysis?.bestComponent
                      ? detailB.analysis.bestComponent.replace(/_/g, " ").toLowerCase()
                      : "—"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted py-4">Pilih atlet untuk membandingkan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Test Items Table */}
      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Perbandingan Detail Hasil Tes Per Item
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2/50">
              <tr>
                <th className="px-4 py-3 font-medium text-muted uppercase tracking-wide">Item Tes</th>
                <th className="px-4 py-3 font-medium text-muted uppercase tracking-wide">Komponen</th>
                <th className="px-4 py-3 font-medium text-blue-400 uppercase tracking-wide text-right">
                  {athleteA?.fullName}
                </th>
                <th className="px-4 py-3 font-medium text-amber-400 uppercase tracking-wide text-right">
                  {athleteB?.fullName}
                </th>
                <th className="px-4 py-3 font-medium text-muted uppercase tracking-wide text-center">
                  Unggul
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonList.map((item) => {
                const scoreA = item.scoreA ?? 0;
                const scoreB = item.scoreB ?? 0;

                const winner =
                  scoreA > scoreB
                    ? "A"
                    : scoreB > scoreA
                    ? "B"
                    : "DRAW";

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
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                      {item.valB != null ? `${item.valB} ${item.unit}` : "—"}{" "}
                      <span className="text-[10px] text-muted">({scoreB}%)</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {winner === "A" && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400">
                          <Trophy className="h-3 w-3" /> Atlet A
                        </span>
                      )}
                      {winner === "B" && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                          <Trophy className="h-3 w-3" /> Atlet B
                        </span>
                      )}
                      {winner === "DRAW" && (
                        <span className="inline-flex items-center gap-1 text-muted text-[11px]">
                          <Minus className="h-3 w-3" /> Imbang
                        </span>
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
