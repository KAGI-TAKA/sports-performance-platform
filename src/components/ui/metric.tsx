import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string | number;
    trend: "improving" | "stable" | "declining" | "neutral";
    label?: string;
  };
  isPB?: boolean;
  pbDate?: string;
  kicker?: string;
  icon?: React.ElementType;
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  isPB = false,
  pbDate,
  kicker,
  icon: Icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-surface-1 p-4 sm:p-5 shadow-2xs transition-all",
        isPB && "border-accent/30 bg-surface-featured",
        className
      )}
      {...props}
    >
      {/* Header / Label */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {kicker && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent shrink-0">
              {kicker} •
            </span>
          )}
          <span className="text-xs font-semibold text-muted truncate uppercase tracking-wider">
            {label}
          </span>
        </div>
        {isPB && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-accent-bg px-2 py-0.5 text-[10px] font-extrabold text-accent border border-accent/20 shrink-0">
            <Sparkles className="h-3 w-3" />
            PB
          </span>
        )}
        {Icon && !isPB && (
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-2 text-muted shrink-0">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Main Metric Value (Space Grotesk) */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-muted">
            {unit}
          </span>
        )}
      </div>

      {/* Delta / Footer status */}
      {(delta || pbDate) && (
        <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
          {delta && (
            <div className="flex items-center gap-1">
              <MetricDeltaIndicator trend={delta.trend} value={delta.value} />
              {delta.label && (
                <span className="text-muted text-[11px] ml-1">{delta.label}</span>
              )}
            </div>
          )}
          {pbDate && (
            <span className="text-[10px] text-muted ml-auto">
              Tercapai: {pbDate}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function MetricDeltaIndicator({
  trend,
  value,
  className,
}: {
  trend: "improving" | "stable" | "declining" | "neutral";
  value: string | number;
  className?: string;
}) {
  if (trend === "improving") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-bold text-success text-[11px]",
          className
        )}
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
        {value}
      </span>
    );
  }

  if (trend === "declining") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-bold text-warning text-[11px]",
          className
        )}
      >
        <ArrowDownRight className="h-3.5 w-3.5" />
        {value}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-semibold text-secondary text-[11px]",
        className
      )}
    >
      <Minus className="h-3.5 w-3.5" />
      {value}
    </span>
  );
}

export function MetricGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-3 sm:gap-4", colClass, className)}>
      {children}
    </div>
  );
}
