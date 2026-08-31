"use client";

import type { AttendanceStatus } from "../types";
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Calendar,
  HelpCircle,
} from "lucide-react";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
  size?: "sm" | "md";
}

export function AttendanceStatusBadge({
  status,
  className = "",
  size = "md",
}: AttendanceStatusBadgeProps) {
  const isSm = size === "sm";

  switch (status) {
    case "PRESENT":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 ${
            isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } ${className}`}
        >
          <CheckCircle2 className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          <span>Hadir</span>
        </span>
      );

    case "LATE":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 ${
            isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } ${className}`}
        >
          <Clock className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          <span>Terlambat</span>
        </span>
      );

    case "EXCUSED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 ${
            isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } ${className}`}
        >
          <FileText className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          <span>Izin</span>
        </span>
      );

    case "ABSENT":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 ${
            isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } ${className}`}
        >
          <XCircle className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          <span>Alpa</span>
        </span>
      );

    case "RESCHEDULED":
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20 ${
            isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } ${className}`}
        >
          <Calendar className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          <span>Jadwal Ulang</span>
        </span>
      );

    case "UNMARKED":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 ${
            isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          } ${className}`}
        >
          <HelpCircle className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
          <span>Belum Ditandai</span>
        </span>
      );
  }
}
