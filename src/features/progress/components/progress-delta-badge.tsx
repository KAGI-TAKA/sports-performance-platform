import React from "react";
import { TrendingUp, TrendingDown, Minus, Trophy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ProgressTrendType = "IMPROVED" | "STABLE" | "DECLINING" | "BASELINE" | "INSUFFICIENT_DATA";

interface ProgressDeltaBadgeProps {
  trend: ProgressTrendType;
  delta?: number | null;
  percentChange?: number | null;
  unit?: string;
  isPersonalBest?: boolean;
  scoreDirection?: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  className?: string;
}

export function ProgressDeltaBadge({
  trend,
  delta,
  percentChange,
  unit = "",
  isPersonalBest = false,
  scoreDirection,
  className = "",
}: ProgressDeltaBadgeProps) {
  if (trend === "BASELINE" || trend === "INSUFFICIENT_DATA" || delta === null || delta === undefined) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-muted font-medium ${className}`}>
        <Minus className="h-3 w-3" />
        <span>Baseline</span>
      </span>
    );
  }

  // Format sign prefix (+ or -)
  const formattedDelta = delta > 0 ? `+${delta}` : `${delta}`;
  const formattedPct =
    percentChange !== null && percentChange !== undefined
      ? `${percentChange > 0 ? `+${percentChange.toFixed(1)}` : percentChange.toFixed(1)}%`
      : null;

  if (trend === "IMPROVED") {
    const ariaText = `Peningkatan: ${formattedDelta} ${unit}${formattedPct ? ` (${formattedPct})` : ""}`;
    return (
      <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800"
          aria-label={ariaText}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{formattedDelta} {unit}</span>
          {formattedPct && <span className="text-[10px] opacity-80">({formattedPct})</span>}
        </span>
        {isPersonalBest && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700"
            aria-label="Rekor Pribadi Baru"
          >
            <Trophy className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
            <span>PB</span>
          </span>
        )}
      </div>
    );
  }

  if (trend === "DECLINING") {
    const ariaText = `Penurunan: ${formattedDelta} ${unit}${formattedPct ? ` (${formattedPct})` : ""}`;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 ${className}`}
        aria-label={ariaText}
      >
        <TrendingDown className="h-3.5 w-3.5" />
        <span>{formattedDelta} {unit}</span>
        {formattedPct && <span className="text-[10px] opacity-80">({formattedPct})</span>}
      </span>
    );
  }

  // STABLE
  const ariaText = `Stabil: ${formattedDelta} ${unit}`;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 ${className}`}
      aria-label={ariaText}
    >
      <Minus className="h-3 w-3" />
      <span>Stabil ({formattedDelta} {unit})</span>
    </span>
  );
}
