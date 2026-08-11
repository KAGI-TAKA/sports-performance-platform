"use client";

import type { ScheduleStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  SCHEDULED: {
    label: "Terjadwal",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  COMPLETED: {
    label: "Selesai",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  CANCELLED: {
    label: "Dibatalkan",
    bg: "bg-surface-3",
    text: "text-muted",
    border: "border-border",
  },
  NO_SHOW: {
    label: "Tidak Hadir",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

export function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
