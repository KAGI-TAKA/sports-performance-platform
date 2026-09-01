"use client";

import { useState } from "react";
import { UserCheck, AlertTriangle, CheckCheck, Search } from "lucide-react";
import type { AttendanceStatus } from "@prisma/client";
import type { SessionExecutionAthleteData } from "../types";

interface AttendanceChecklistSectionProps {
  athletes: SessionExecutionAthleteData[];
  attendanceState: Record<string, { status: AttendanceStatus; notes?: string }>;
  onAttendanceChange: (athleteId: string, status: AttendanceStatus, notes?: string) => void;
  onMarkAllPresent?: () => void;
  isReadOnly: boolean;
}

const STATUS_OPTIONS: {
  status: AttendanceStatus;
  label: string;
  shortLabel: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    status: "PRESENT",
    label: "Hadir",
    shortLabel: "Hadir",
    activeClass: "bg-success text-white font-bold shadow-xs border-success",
    inactiveClass: "bg-surface-1 text-secondary border-border hover:bg-success-bg hover:text-success",
  },
  {
    status: "LATE",
    label: "Terlambat",
    shortLabel: "Telat",
    activeClass: "bg-warning text-white font-bold shadow-xs border-warning",
    inactiveClass: "bg-surface-1 text-secondary border-border hover:bg-warning-bg hover:text-warning",
  },
  {
    status: "EXCUSED",
    label: "Izin",
    shortLabel: "Izin",
    activeClass: "bg-info text-white font-bold shadow-xs border-info",
    inactiveClass: "bg-surface-1 text-secondary border-border hover:bg-info-bg hover:text-info",
  },
  {
    status: "ABSENT",
    label: "Alpa",
    shortLabel: "Alpa",
    activeClass: "bg-danger text-white font-bold shadow-xs border-danger",
    inactiveClass: "bg-surface-1 text-secondary border-border hover:bg-danger-bg hover:text-danger",
  },
  {
    status: "RESCHEDULED",
    label: "Reschedule",
    shortLabel: "Resch",
    activeClass: "bg-surface-3 text-foreground font-bold shadow-xs border-border-strong",
    inactiveClass: "bg-surface-1 text-secondary border-border hover:bg-surface-2 hover:text-foreground",
  },
];

export function AttendanceChecklistSection({
  athletes,
  attendanceState,
  onAttendanceChange,
  onMarkAllPresent,
  isReadOnly,
}: AttendanceChecklistSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Summary counts
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let absentCount = 0;
  let unmarkedCount = 0;

  athletes.forEach((a) => {
    const st = attendanceState[a.id]?.status ?? "UNMARKED";
    if (st === "PRESENT") presentCount++;
    else if (st === "LATE") lateCount++;
    else if (st === "EXCUSED") excusedCount++;
    else if (st === "ABSENT") absentCount++;
    else unmarkedCount++;
  });

  const handleMarkAll = () => {
    if (isReadOnly || unmarkedCount === 0) return;

    if (onMarkAllPresent) {
      onMarkAllPresent();
      return;
    }

    athletes.forEach((a) => {
      const current = attendanceState[a.id]?.status ?? "UNMARKED";
      if (current === "UNMARKED") {
        onAttendanceChange(a.id, "PRESENT", attendanceState[a.id]?.notes);
      }
    });
  };

  const filteredAthletes = athletes.filter((a) => {
    if (!searchQuery.trim()) return true;
    const clean = searchQuery.toLowerCase();
    const matchName = a.fullName.toLowerCase().includes(clean);
    const matchJersey = a.jerseyNumber !== null && String(a.jerseyNumber).includes(clean);
    return matchName || matchJersey;
  });

  return (
    <section className="rounded-2xl border border-border bg-surface-1 shadow-2xs overflow-hidden space-y-0">
      {/* Section Header & Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-2/30">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-accent shrink-0" />
          <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wide">
            Presensi Atlet ({athletes.length} Peserta)
          </h2>
        </div>

        {/* Action Controls & Counter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Counter Pills */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-success-bg text-success border border-success/20">
              {presentCount} Hadir
            </span>
            {lateCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-warning-bg text-warning border border-warning/20">
                {lateCount} Telat
              </span>
            )}
            {excusedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-info-bg text-info border border-info/20">
                {excusedCount} Izin
              </span>
            )}
            {absentCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-danger-bg text-danger border border-danger/20">
                {absentCount} Alpa
              </span>
            )}
            {unmarkedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-surface-2 text-muted border border-border">
                {unmarkedCount} Belum
              </span>
            )}
          </div>

          {/* 1-Tap Attendance Button */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unmarkedCount === 0}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                unmarkedCount > 0
                  ? "bg-accent text-white hover:bg-accent/90 active:scale-95 cursor-pointer"
                  : "bg-surface-2 text-muted border border-border cursor-not-allowed"
              }`}
              title={
                unmarkedCount > 0
                  ? `Tandai ${unmarkedCount} atlet yang belum diabsen sebagai Hadir`
                  : "Semua atlet telah memiliki status presensi"
              }
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>
                {unmarkedCount > 0 ? `Tandai Semua Hadir (${unmarkedCount})` : "Semua Telah Ditandai"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Filter (if roster > 4 athletes) */}
      {athletes.length > 4 && (
        <div className="px-5 py-2.5 bg-surface-2/40 border-b border-border flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atlet atau nomor jersey di sesi ini…"
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] text-muted hover:text-foreground px-1.5"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Athlete Attendance Rows */}
      <div className="divide-y divide-border/60">
        {filteredAthletes.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            Tidak ada atlet yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredAthletes.map((athlete) => {
            const currentStatus = attendanceState[athlete.id]?.status ?? "UNMARKED";
            const currentNotes = attendanceState[athlete.id]?.notes ?? "";
            const hasInjury = athlete.activeInjuries && athlete.activeInjuries.length > 0;

            return (
              <div
                key={athlete.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-2/40 transition-colors"
              >
                {/* Left: Athlete Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{athlete.fullName}</span>
                    {athlete.jerseyNumber !== null && (
                      <span className="text-[10px] font-mono font-bold text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                        #{athlete.jerseyNumber}
                      </span>
                    )}
                    {hasInjury && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-danger bg-danger-bg px-2 py-0.5 rounded-full border border-danger/20">
                        <AlertTriangle className="h-3 w-3" />
                        Cedera Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary">
                    Posisi: <strong className="text-foreground font-medium">{athlete.position || "Umum"}</strong>
                  </p>
                </div>

                {/* Right: Large Segmented Touch Buttons (min-height 44px) */}
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = currentStatus === opt.status;
                    return (
                      <button
                        key={opt.status}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => onAttendanceChange(athlete.id, opt.status, currentNotes)}
                        className={`min-h-[44px] min-w-[56px] sm:min-w-[68px] px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-center ${
                          isSelected ? opt.activeClass : opt.inactiveClass
                        } ${isReadOnly ? "opacity-80 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                        aria-pressed={isSelected}
                      >
                        <span className="hidden sm:inline">{opt.label}</span>
                        <span className="sm:hidden">{opt.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
