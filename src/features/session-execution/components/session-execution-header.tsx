"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { ScheduleStatus } from "@prisma/client";

interface SessionExecutionHeaderProps {
  title: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  coachName: string;
  athleteCount: number;
  status: ScheduleStatus;
}

function formatSessionDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSessionTimeRange(start: Date, end: Date): string {
  const startStr = new Date(start).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endStr = new Date(end).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startStr} – ${endStr} WIB`;
}

function getStatusBadge(status: ScheduleStatus) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        Sesi Selesai
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <XCircle className="h-3.5 w-3.5 text-slate-500" />
        Dibatalkan
      </span>
    );
  }
  if (status === "NO_SHOW") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
        Tidak Hadir (No Show)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
      <Clock className="h-3.5 w-3.5 text-indigo-600" />
      Terjadwal (Sedang / Siap Berlangsung)
    </span>
  );
}

export function SessionExecutionHeader({
  title,
  startTime,
  endTime,
  location,
  coachName,
  athleteCount,
  status,
}: SessionExecutionHeaderProps) {
  return (
    <header className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Nav & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali ke Jadwal</span>
        </Link>
        {getStatusBadge(status)}
      </div>

      {/* Main Title & Session Metadata */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
          Workspace Eksekusi Sesi Latihan
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatSessionDate(startTime)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatSessionTimeRange(startTime, endTime)}</span>
          </div>

          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{location}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Pelatih: <strong className="text-slate-800 font-semibold">{coachName}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Peserta: <strong className="text-slate-800 font-semibold">{athleteCount} Atlet</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
