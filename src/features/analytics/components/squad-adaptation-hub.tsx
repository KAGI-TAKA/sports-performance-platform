"use client";

import React from "react";
import {
  Users,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { SquadAdaptationSummaryDTO, SquadComponentAdaptation } from "../squad-adaptation-engine";

interface SquadAdaptationHubProps {
  data: SquadAdaptationSummaryDTO;
  className?: string;
}

export function SquadAdaptationHub({
  data,
  className = "",
}: SquadAdaptationHubProps) {
  const {
    periodLabel,
    totalAthletesCount,
    assessedAthletesCount,
    coveragePercentage,
    dataQualityStatus,
    components,
    strongestAdaptiveComponent,
    focusDevelopmentComponent,
    squadDistribution,
    actionableInsights,
  } = data;

  return (
    <div
      className={`rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 space-y-6 shadow-sm ${className}`}
      role="region"
      aria-label="Squad Adaptational Insight Hub"
    >
      {/* 1. Header & Period Snapshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Layers className="h-4 w-4" />
            </span>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground tracking-tight">
              Squad Adaptational Insight Hub
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Evaluasi respon adaptasi fisik seluruh atlet skuad ({periodLabel})
          </p>
        </div>

        {/* Coverage & Data Quality Gauge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-muted font-medium">Cakupan Asesmen</div>
            <div className="font-mono text-sm font-bold text-foreground">
              {coveragePercentage}% ({assessedAthletesCount}/{totalAthletesCount} Atlet)
            </div>
          </div>

          <div className="h-8 w-[1px] bg-border/60 hidden sm:block" />

          <div>
            {dataQualityStatus === "ROBUST_DATA" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Data Kuat (Robust)
              </span>
            )}
            {dataQualityStatus === "LOW_COVERAGE" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5" />
                Cakupan Rendah (&lt;50%)
              </span>
            )}
            {dataQualityStatus === "INSUFFICIENT_SAMPLE" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <HelpCircle className="h-3.5 w-3.5" />
                Sampel Terbatas (&lt;3 Atlet)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 7-Component Physical Adaptation Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            <span>Snapshot Adaptasi 7 Komponen Fisik</span>
          </h3>
          <span className="text-[11px] text-muted">Bobot 1:1 per atlet unik</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {components.map((comp) => {
            const hasData = comp.currentAverageScore !== null;
            const delta = comp.delta;

            return (
              <div
                key={comp.component}
                className="rounded-xl border border-border/80 bg-surface-2/40 p-3.5 space-y-2 relative transition-all hover:border-border"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-bold text-foreground line-clamp-1">
                    {comp.componentNameID}
                  </span>
                  {comp.trend === "IMPROVING" && (
                    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" /> Meningkat
                    </span>
                  )}
                  {comp.trend === "DECLINING" && (
                    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <ArrowDownRight className="h-3 w-3" /> Evaluasi
                    </span>
                  )}
                  {comp.trend === "STABLE" && (
                    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-surface-3 text-muted">
                      <Minus className="h-3 w-3" /> Stabil
                    </span>
                  )}
                  {comp.trend === "INSUFFICIENT_DATA" && (
                    <span className="text-[10px] text-muted italic">Belum Cukup Data</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="font-mono text-xl font-black text-foreground">
                      {hasData ? `${comp.currentAverageScore?.toFixed(1)}%` : "—"}
                    </span>
                    <span className="text-[10px] text-muted block">Rata-rata Skuad</span>
                  </div>

                  {delta !== null && (
                    <div className="text-right font-mono">
                      <span
                        className={`text-xs font-bold ${
                          delta > 0
                            ? "text-emerald-500"
                            : delta < 0
                            ? "text-rose-500"
                            : "text-muted"
                        }`}
                      >
                        {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-muted block">vs Periode Lalu</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Actionable Coaching Insight Card (WHAT, WHY, ACTION) */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-display text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
            Rekomendasi Kepelatihan Berbasis Adaptasi Tim
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-surface-1/80 border border-border/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
              [WHAT] Perubahan Terdeteksi
            </span>
            <p className="text-foreground leading-relaxed font-medium">
              {actionableInsights.what}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-1/80 border border-border/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
              [WHY] Bukti Data Skuad
            </span>
            <p className="text-foreground leading-relaxed">
              {actionableInsights.why}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-1/80 border border-border/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
              [ACTION] Rekomendasi Pelatih
            </span>
            <p className="text-foreground leading-relaxed font-medium">
              {actionableInsights.action}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
