"use client";

import { UserCheck, AlertTriangle } from "lucide-react";
import type { AttendanceStatus } from "@prisma/client";
import type { SessionExecutionAthleteData } from "../types";

interface AttendanceChecklistSectionProps {
  athletes: SessionExecutionAthleteData[];
  attendanceState: Record<string, { status: AttendanceStatus; notes?: string }>;
  onAttendanceChange: (athleteId: string, status: AttendanceStatus, notes?: string) => void;
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
    activeClass: "bg-emerald-600 text-white font-bold shadow-xs border-emerald-700",
    inactiveClass: "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800",
  },
  {
    status: "LATE",
    label: "Terlambat",
    shortLabel: "Telat",
    activeClass: "bg-amber-500 text-white font-bold shadow-xs border-amber-600",
    inactiveClass: "bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800",
  },
  {
    status: "EXCUSED",
    label: "Izin",
    shortLabel: "Izin",
    activeClass: "bg-blue-600 text-white font-bold shadow-xs border-blue-700",
    inactiveClass: "bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-800",
  },
  {
    status: "ABSENT",
    label: "Alpa",
    shortLabel: "Alpa",
    activeClass: "bg-rose-600 text-white font-bold shadow-xs border-rose-700",
    inactiveClass: "bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-800",
  },
  {
    status: "RESCHEDULED",
    label: "Reschedule",
    shortLabel: "Resch",
    activeClass: "bg-slate-700 text-white font-bold shadow-xs border-slate-800",
    inactiveClass: "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900",
  },
];

export function AttendanceChecklistSection({
  athletes,
  attendanceState,
  onAttendanceChange,
  isReadOnly,
}: AttendanceChecklistSectionProps) {
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

  return (
    <section className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden space-y-0">
      {/* Section Header & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-indigo-600" />
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Presensi Atlet ({athletes.length} Peserta)
          </h2>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 text-[11px] font-semibold flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            {presentCount} Hadir
          </span>
          {lateCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              {lateCount} Terlambat
            </span>
          )}
          {excusedCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {excusedCount} Izin
            </span>
          )}
          {absentCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {absentCount} Alpa
            </span>
          )}
          {unmarkedCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {unmarkedCount} Belum
            </span>
          )}
        </div>
      </div>

      {/* Athlete Attendance Rows */}
      <div className="divide-y divide-slate-100">
        {athletes.map((athlete) => {
          const currentStatus = attendanceState[athlete.id]?.status ?? "UNMARKED";
          const currentNotes = attendanceState[athlete.id]?.notes ?? "";
          const hasInjury = athlete.activeInjuries && athlete.activeInjuries.length > 0;

          return (
            <div
              key={athlete.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
            >
              {/* Left: Athlete Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{athlete.fullName}</span>
                  {athlete.jerseyNumber !== null && (
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      #{athlete.jerseyNumber}
                    </span>
                  )}
                  {hasInjury && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <AlertTriangle className="h-3 w-3" />
                      Cedera Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Posisi: <strong className="text-slate-700 font-medium">{athlete.position || "Umum"}</strong>
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
        })}
      </div>
    </section>
  );
}
