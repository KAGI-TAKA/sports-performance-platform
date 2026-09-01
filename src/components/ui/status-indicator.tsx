import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "active"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "improving"
  | "stable"
  | "attention"
  | "neutral";

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant | string;
  label?: string;
  dotOnly?: boolean;
}

const statusConfig: Record<
  StatusVariant,
  { dot: string; text: string; bg: string; border: string; defaultLabel: string }
> = {
  active: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success-bg",
    border: "border-success/20",
    defaultLabel: "Aktif",
  },
  scheduled: {
    dot: "bg-accent",
    text: "text-accent",
    bg: "bg-accent-bg",
    border: "border-accent/20",
    defaultLabel: "Terjadwal",
  },
  completed: {
    dot: "bg-secondary",
    text: "text-secondary",
    bg: "bg-surface-2",
    border: "border-border",
    defaultLabel: "Selesai",
  },
  cancelled: {
    dot: "bg-danger",
    text: "text-danger",
    bg: "bg-danger-bg",
    border: "border-danger/20",
    defaultLabel: "Dibatalkan",
  },
  improving: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success-bg",
    border: "border-success/20",
    defaultLabel: "Meningkat",
  },
  stable: {
    dot: "bg-secondary",
    text: "text-secondary",
    bg: "bg-surface-2",
    border: "border-border",
    defaultLabel: "Stabil",
  },
  attention: {
    dot: "bg-warning",
    text: "text-warning",
    bg: "bg-warning-bg",
    border: "border-warning/20",
    defaultLabel: "Perlu Perhatian",
  },
  neutral: {
    dot: "bg-muted",
    text: "text-muted",
    bg: "bg-surface-2",
    border: "border-border",
    defaultLabel: "Draft",
  },
};

export function StatusIndicator({
  status,
  label,
  dotOnly = false,
  className,
  ...props
}: StatusIndicatorProps) {
  const variant = (status.toLowerCase() in statusConfig
    ? status.toLowerCase()
    : "neutral") as StatusVariant;
  const cfg = statusConfig[variant];
  const displayLabel = label || cfg.defaultLabel;

  if (dotOnly) {
    return (
      <span
        title={displayLabel}
        className={cn("inline-block h-2 w-2 rounded-full", cfg.dot, className)}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold border",
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {displayLabel}
    </span>
  );
}
