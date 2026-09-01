"use client";

import React from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from "lucide-react";
import type { ComparedAthleteDTO, ComparedTestItemRow } from "../types";

interface CompareMetricsTableProps {
  athletes: ComparedAthleteDTO[];
  comparisonTable: ComparedTestItemRow[];
}

export function CompareMetricsTable({
  athletes,
  comparisonTable,
}: CompareMetricsTableProps) {
  if (comparisonTable.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-8 text-center text-xs text-muted">
        Tidak ada item tes yang tersedia untuk diperbandingkan pada asesmen terpilih.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-1 overflow-hidden space-y-0">
      <div className="px-5 py-4 border-b border-border bg-surface-2/30 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <span>Perbandingan Detail Hasil Tes Fisik</span>
          </h3>
          <p className="text-xs text-muted">
            Nilai mentah lapangan (detik, cm, reps) beserta skor ternormalisasi (0–100%) berdasarkan norma kelompok usia.
          </p>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs" role="table">
          <thead className="border-b border-border bg-surface-2/60">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold text-muted uppercase tracking-wide">
                Item Tes
              </th>
              <th scope="col" className="px-3 py-3 font-bold text-muted uppercase tracking-wide">
                Komponen / Arah
              </th>
              {athletes.map((ath) => (
                <th
                  key={ath.id}
                  scope="col"
                  className="px-4 py-3 font-bold uppercase tracking-wide text-right"
                  style={{ color: ath.color }}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: ath.color }}
                    />
                    <span>{ath.fullName}</span>
                  </div>
                  <span className="text-[10px] text-muted normal-case block font-normal">
                    {ath.age} thn ({ath.gender})
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comparisonTable.map((row) => (
              <tr
                key={row.testItemId}
                className="hover:bg-surface-2/40 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-foreground">
                  <div className="font-bold">{row.testItemName}</div>
                  <span className="text-[10px] text-muted">Satuan: {row.unit}</span>
                </td>
                <td className="px-3 py-3 text-muted">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium capitalize">
                    {row.physicalComponent
                      ? row.physicalComponent.replace(/_/g, " ").toLowerCase()
                      : "Umum"}
                  </span>
                  <span className="block text-[10px] opacity-75">
                    {row.scoreDirection === "LOWER_IS_BETTER"
                      ? "↓ Lebih Cepat Lebih Baik"
                      : "↑ Lebih Tinggi Lebih Baik"}
                  </span>
                </td>
                {athletes.map((ath) => {
                  const val = row.athleteValues[ath.id];
                  if (!val || val.isNotTested || val.rawValue === null) {
                    return (
                      <td
                        key={ath.id}
                        className="px-4 py-3 text-right text-muted italic font-mono text-[11px]"
                      >
                        — (Belum Diuji)
                      </td>
                    );
                  }

                  return (
                    <td
                      key={ath.id}
                      className="px-4 py-3 text-right font-mono"
                    >
                      <div className="font-bold text-foreground text-xs">
                        {val.rawValue} {row.unit}
                      </div>
                      {val.score != null && (
                        <div
                          className="text-[11px] font-semibold"
                          style={{ color: ath.color }}
                        >
                          {val.score.toFixed(0)}%
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (320px - 639px) */}
      <div className="block sm:hidden divide-y divide-border">
        {comparisonTable.map((row) => (
          <div key={row.testItemId} className="p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-foreground">{row.testItemName}</h4>
                <span className="text-[10px] text-muted">
                  {row.physicalComponent?.replace(/_/g, " ").toLowerCase() || "Umum"} •{" "}
                  {row.scoreDirection === "LOWER_IS_BETTER" ? "↓ Waktu Lebih Singkat" : "↑ Nilai Lebih Besar"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                {row.unit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {athletes.map((ath) => {
                const val = row.athleteValues[ath.id];
                const isTested = val && !val.isNotTested && val.rawValue !== null;

                return (
                  <div
                    key={ath.id}
                    className="p-2.5 rounded-lg bg-surface-2/50 border border-border/60 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: ath.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ath.color }} />
                      <span className="truncate">{ath.fullName}</span>
                    </div>

                    {isTested ? (
                      <div className="flex items-baseline justify-between font-mono">
                        <span className="font-bold text-foreground">{val.rawValue} {row.unit}</span>
                        {val.score != null && (
                          <span className="text-[10px] font-bold" style={{ color: ath.color }}>
                            {val.score.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted italic">Belum diuji</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
