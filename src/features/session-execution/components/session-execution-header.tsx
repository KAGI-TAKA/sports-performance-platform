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
import { Badge } from "@/components/ui/badge";

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
      <Badge variant="success" size="default" className="gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Sesi Selesai</span>
      </Badge>
    );
  }
  if (status === "CANCELLED") {
    return (
      <Badge variant="default" size="default" className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        <span>Dibatalkan</span>
      </Badge>
    );
  }
  if (status === "NO_SHOW") {
    return (
      <Badge variant="danger" size="default" className="gap-1.5">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Tidak Hadir (No Show)</span>
      </Badge>
    );
  }
  return (
    <Badge variant="amber" size="default" className="gap-1.5">
      <Clock className="h-3.5 w-3.5" />
      <span>Sesi Aktif / Terjadwal</span>
    </Badge>
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
    <header className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Top Nav & Breadcrumb */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-foreground transition-colors min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali ke Jadwal</span>
        </Link>
        {getStatusBadge(status)}
      </div>

      {/* Main Title & Session Metadata */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-accent tracking-wider block">
          Field Execution Cockpit
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-black text-foreground leading-tight">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-secondary pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted" />
            <span>{formatSessionDate(startTime)}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted" />
            <span>{formatSessionTimeRange(startTime, endTime)}</span>
          </div>

          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted" />
              <span>{location}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted" />
            <span>Pelatih: <strong className="text-foreground font-semibold">{coachName}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted" />
            <span>Peserta: <strong className="text-foreground font-semibold">{athleteCount} Atlet</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
