"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Activity,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Layers,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressDeltaBadge } from "./progress-delta-badge";
import { ProgressShareDialog } from "@/features/reports/components/progress-share-dialog";
import type { ShareSafeProgressDTO } from "@/features/reports/utils/whatsapp-formatter";
import type {
  AthleteDetailedProgressResult,
  TestItemPersonalBest,
  DetailedTimelineEntry,
} from "@/features/analytics/queries";
import { formatDateID } from "@/lib/date-utils";

const gradeColorMap: Record<string, string> = {
  A: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  "B+": "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  B: "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  "C+": "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  C: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  D: "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
};

interface AthleteProgressTimelineProps {
  data: AthleteDetailedProgressResult;
}

export function AthleteProgressTimeline({ data }: AthleteProgressTimelineProps) {
  const { athlete, personalBests, timeline } = data;
  const [selectedItemId, setSelectedItemId] = useState<string | "ALL">("ALL");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Construct share-safe DTO from timeline data
  const shareSafeData: ShareSafeProgressDTO | null = useMemo(() => {
    if (timeline.length === 0) return null;
    const latest = timeline[0];
    const previous = timeline[1];

    let trend: ShareSafeProgressDTO["overview"]["trend"] = "INSUFFICIENT_DATA";
    let deltaPercentage: number | null = null;

    if (latest.overallScore != null && previous?.overallScore != null) {
      const diff = latest.overallScore - previous.overallScore;
      deltaPercentage = Number(diff.toFixed(1));
      if (diff >= 0.5) trend = "IMPROVING";
      else if (diff <= -0.5) trend = "DECLINING";
      else trend = "STABLE";
    }

    const keyImprovements = latest.items
      .filter((it) => it.trend === "IMPROVED" && it.delta != null)
      .map((it) => ({
        testItemName: it.testItemName,
        deltaValue: it.delta!,
        unit: it.unit,
        percentChange: it.percentChange,
      }));

    return {
      athlete: {
        id: athlete.id,
        fullName: athlete.fullName,
        age: 15, // fallback age
        jerseyNumber: athlete.jerseyNumber,
        position: athlete.position !== "UNSPECIFIED" ? athlete.position.replace(/_/g, " ") : null,
      },
      period: {
        label: "Asesmen Terkini",
        assessmentDate: formatDateID(latest.assessmentDate),
        totalAssessments: timeline.length,
      },
      overview: {
        overallScore: latest.overallScore,
        overallGrade: latest.overallGrade,
        trend,
        deltaPercentage,
      },
      personalBests: personalBests.map((pb) => ({
        testItemName: pb.testItemName,
        rawValue: pb.pbValue,
        unit: pb.unit,
        achievedDate: formatDateID(pb.achievedDate),
      })),
      keyImprovements,
      goals: [],
      focusAreas: latest.bestComponent ? [latest.bestComponent.replace(/_/g, " ")] : [],
      recommendation: null,
      reportUrl: null,
      latestAssessmentId: latest.assessmentId,
    };
  }, [athlete, personalBests, timeline]);

  if (timeline.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-surface-1 p-8 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 mx-auto">
          <Activity className="h-6 w-6 text-muted" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Belum Ada Riwayat Assessment Selesai</h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Lakukan asesmen fisik untuk atlet ini untuk mulai membaca garis waktu perkembangan dan rekor terbaik.
        </p>
      </div>
    );
  }

  // Filter timeline items if a specific test item is selected in filter tabs
  const filteredTimeline = timeline.map((entry) => {
    if (selectedItemId === "ALL") return entry;
    return {
      ...entry,
      items: entry.items.filter((it) => it.testItemId === selectedItemId),
    };
  }).filter((entry) => entry.items.length > 0);

  return (
    <div className="space-y-6" role="region" aria-label={`Garis Waktu Perkembangan Atlet ${athlete.fullName}`}>
      {/* Header with Share Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <span>Linimasa Perkembangan &amp; Rekor Atlet</span>
          </h2>
          <p className="text-xs text-muted">
            Evaluasi kemajuan metrik fisik dan histori capaian terbaik secara longitudinal.
          </p>
        </div>

        {shareSafeData && (
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent hover:bg-accent/90 px-3.5 py-2 text-xs font-bold text-white transition shadow-sm self-start sm:self-auto min-h-[40px]"
            aria-label="Buka Dialog Bagikan Perkembangan Atlet"
          >
            <Share2 className="h-4 w-4" />
            <span>Bagikan Progress</span>
          </button>
        )}
      </div>

      {/* Share Dialog Modal */}
      {shareSafeData && (
        <ProgressShareDialog
          data={shareSafeData}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
      {/* 1. PERSONAL BEST (PB) HUB */}
      {personalBests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Rekor Terbaik Pribadi (Personal Best)</span>
            </h3>
            <span className="text-xs text-muted">
              {personalBests.length} item tes tercatat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {personalBests.map((pb) => (
              <div
                key={pb.testItemId}
                className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/50 via-surface-1 to-surface-1 dark:from-amber-950/20 dark:border-amber-900/40 p-4 space-y-2 relative overflow-hidden transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted block">
                      {pb.physicalComponent || "Fisik"}
                    </span>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{pb.testItemName}</h4>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300">
                    <Trophy className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="pt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-foreground font-mono tracking-tight">
                    {pb.pbValue}
                  </span>
                  <span className="text-xs font-medium text-muted">{pb.unit}</span>
                </div>

                <div className="text-[11px] text-muted flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 opacity-70" />
                    <span>{formatDateID(pb.achievedDate)}</span>
                  </span>
                  <span>{pb.totalAttempts}x tes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TIMELINE HISTORY FILTER & HEADER */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <span>Garis Waktu Perkembangan (Longitudinal History)</span>
            </h3>
            <p className="text-xs text-muted">
              Evaluasi adaptasi fisik kronologis dengan delta perubahan dan tren terarah.
            </p>
          </div>

          {/* Test Item Filter Chips */}
          {personalBests.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setSelectedItemId("ALL")}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                  selectedItemId === "ALL"
                    ? "bg-foreground text-background"
                    : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                Semua Tes
              </button>
              {personalBests.map((pb) => (
                <button
                  key={pb.testItemId}
                  type="button"
                  onClick={() => setSelectedItemId(pb.testItemId)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition shrink-0 flex items-center gap-1 ${
                    selectedItemId === pb.testItemId
                      ? "bg-accent text-white font-semibold"
                      : "bg-surface-2 text-muted hover:text-foreground"
                  }`}
                >
                  <span>{pb.testItemName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. TIMELINE ENTRIES (Latest first in visual order) */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60 before:hidden sm:before:block">
          {[...filteredTimeline].reverse().map((entry, index) => {
            const isLatest = index === 0;
            const hasPB = entry.items.some((it) => it.isPersonalBest);

            return (
              <div
                key={entry.assessmentId}
                className="relative sm:pl-10 space-y-3"
              >
                {/* Timeline dot marker (desktop) */}
                <div
                  className={`hidden sm:flex absolute left-1.5 top-4 h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-surface-1 ${
                    hasPB
                      ? "border-amber-500 text-amber-500"
                      : isLatest
                      ? "border-accent text-accent"
                      : "border-muted text-muted"
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      hasPB ? "bg-amber-500" : isLatest ? "bg-accent" : "bg-muted"
                    }`}
                  />
                </div>

                <div className="rounded-xl border border-border/80 bg-surface-1 overflow-hidden shadow-sm hover:border-accent/40 transition">
                  {/* Assessment Session Bar */}
                  <div className="p-3.5 sm:p-4 bg-surface-2/40 border-b border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted" />
                        <span>{formatDateID(entry.assessmentDate)}</span>
                      </div>
                      {isLatest && (
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          Terbaru
                        </span>
                      )}
                      {hasPB && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                          <Trophy className="h-2.5 w-2.5 text-amber-600" />
                          <span>Rekor Pribadi Baru</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {entry.overallScore != null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted">Skor Keseluruhan:</span>
                          <span className="text-xs font-bold font-mono text-foreground">
                            {entry.overallScore.toFixed(1)}%
                          </span>
                          {entry.overallGrade && (
                            <span
                              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                gradeColorMap[entry.overallGrade] ?? "text-muted bg-surface-2"
                              }`}
                            >
                              {entry.overallGrade}
                            </span>
                          )}
                        </div>
                      )}

                      <Link
                        href={`/assessments/${entry.assessmentId}`}
                        className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-0.5 ml-1"
                      >
                        <span>Lihat Rapor</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Test Items Table / List */}
                  <div className="p-3.5 sm:p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {entry.items.map((item) => (
                        <div
                          key={item.testItemId}
                          className={`p-3 rounded-lg border text-xs space-y-2 transition ${
                            item.isPersonalBest
                              ? "border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900"
                              : "border-border/70 bg-surface-2/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-foreground line-clamp-1">
                              {item.testItemName}
                            </span>
                            {item.score != null && (
                              <span className="text-[10px] font-mono font-bold text-muted shrink-0">
                                {item.score.toFixed(0)} pts
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black font-mono text-foreground">
                                {item.rawValue}
                              </span>
                              <span className="text-[11px] text-muted">{item.unit}</span>
                            </div>

                            {/* Authoritative Progress Delta Badge */}
                            <ProgressDeltaBadge
                              trend={item.trend}
                              delta={item.delta}
                              percentChange={item.percentChange}
                              unit={item.unit}
                              isPersonalBest={item.isPersonalBest}
                              scoreDirection={item.scoreDirection}
                            />
                          </div>

                          {/* Previous Value Reference */}
                          {item.previousRawValue !== null && (
                            <div className="text-[10px] text-muted flex items-center justify-between pt-1 border-t border-border/40">
                              <span>Sebelumnya: {item.previousRawValue} {item.unit}</span>
                              <span className="font-medium">
                                {item.trend === "IMPROVED" ? "Membaik" : item.trend === "DECLINING" ? "Menurun" : "Stabil"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
