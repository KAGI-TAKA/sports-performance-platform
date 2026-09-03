"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ScheduleStatus } from "@prisma/client";
import type { ScheduleSessionItem } from "./schedule-agenda-view";
import type { CoachOption, AthleteOption } from "./schedule-dialog-form";
import { ScheduleDialogForm } from "./schedule-dialog-form";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  PlayCircle,
  Eye,
  Copy,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AttendanceSessionDialog } from "@/features/attendance/components/attendance-session-dialog";
import { CloneScheduleDialog } from "./clone-schedule-dialog";
import { toLocalDateStr } from "@/features/schedule/utils";

interface ScheduleWeeklyMatrixViewProps {
  sessions: ScheduleSessionItem[];
  coaches: CoachOption[];
  athletes: AthleteOption[];
  userRole?: string;
}

const DEFAULT_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

// Find Monday of the current week (Senin)
function getMondayOfWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // If Sunday (0), go back 6 days to Monday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function ScheduleWeeklyMatrixView({
  sessions,
  coaches,
  athletes,
  userRole = "head_coach",
}: ScheduleWeeklyMatrixViewProps) {
  const canManagePlanning = userRole === "admin" || userRole === "head_coach";
  const [selectedSession, setSelectedSession] = useState<ScheduleSessionItem | null>(null);
  const [editingSession, setEditingSession] = useState<ScheduleSessionItem | null>(null);
  const [cloneSession, setCloneSession] = useState<{ id: string; status: ScheduleStatus } | null>(null);
  const [attendanceSessionId, setAttendanceSessionId] = useState<string | null>(null);
  const [createSlotData, setCreateSlotData] = useState<{ startTime: Date; endTime: Date } | null>(null);

  // Active week anchor (Senin / Monday 00:00:00)
  const [activeWeekMonday, setActiveWeekMonday] = useState<Date>(() => getMondayOfWeek());

  // Generate 7 days of the active week with exact dates & labels (Senin s/d Minggu)
  const weekDays = useMemo(() => {
    const days = [];
    const todayStr = toLocalDateStr(new Date());

    const ID_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(activeWeekMonday);
      d.setDate(activeWeekMonday.getDate() + i);
      const dateStr = toLocalDateStr(d);
      const dayIndex = d.getDay();
      const formattedDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const isToday = dateStr === todayStr;

      days.push({
        date: d,
        dateStr,
        dayIndex,
        dayNameId: ID_DAYS[dayIndex],
        dayNameEn: EN_DAYS[dayIndex],
        formattedDate,
        isToday,
      });
    }
    return days;
  }, [activeWeekMonday]);

  // Navigate between weeks
  const handlePrevWeek = () => {
    const prev = new Date(activeWeekMonday);
    prev.setDate(activeWeekMonday.getDate() - 7);
    setActiveWeekMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(activeWeekMonday);
    next.setDate(activeWeekMonday.getDate() + 7);
    setActiveWeekMonday(next);
  };

  const handleTodayWeek = () => {
    setActiveWeekMonday(getMondayOfWeek());
  };

  // Dynamically compute all active hours needed for sessions + standard hours
  const timeSlots = useMemo(() => {
    const sessionHours = sessions.map((s) => new Date(s.startTime).getHours());
    const allHours = Array.from(new Set([...DEFAULT_HOURS, ...sessionHours])).sort((a, b) => a - b);
    return allHours.map((h) => `${String(h).padStart(2, "0")}:00`);
  }, [sessions]);

  // Helper to construct a date on this specific column day for slotTime "08:00"
  const getSlotDate = (columnDate: Date, slotTime: string) => {
    const targetDate = new Date(columnDate);
    const [h, m] = slotTime.split(":").map(Number);
    targetDate.setHours(h, m || 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(targetDate.getHours() + 1, targetDate.getMinutes());
    return { startTime: targetDate, endTime: endDate };
  };

  // Match sessions for an exact date and hour slot
  const getSessionsForSlot = (dateStr: string, slotTime: string) => {
    const slotHour = parseInt(slotTime.split(":")[0], 10);

    return sessions.filter((s) => {
      const sDateStr = toLocalDateStr(new Date(s.startTime));
      if (sDateStr !== dateStr) return false;

      const sHour = new Date(s.startTime).getHours();
      return sHour === slotHour;
    });
  };

  // Determine availability color based on session status & notes
  const getSlotColorClass = (session: ScheduleSessionItem) => {
    if (session.status === "CANCELLED" || session.status === "NO_SHOW") {
      return "bg-rose-500 text-white border-rose-600 hover:bg-rose-600";
    }
    const notesLower = (session.notes || "").toLowerCase();
    if (notesLower.includes("off") || notesLower.includes("tutup") || notesLower.includes("full")) {
      return "bg-rose-500 text-white border-rose-600 hover:bg-rose-600";
    }
    if (notesLower.includes("fleksibel") || notesLower.includes("reschedule") || notesLower.includes("tentative") || notesLower.includes("60%")) {
      return "bg-sky-400 text-slate-950 border-sky-500 hover:bg-sky-300 font-semibold";
    }
    return "bg-emerald-400 text-slate-950 border-emerald-500 hover:bg-emerald-300 font-semibold";
  };

  const weekEndSunday = new Date(activeWeekMonday);
  weekEndSunday.setDate(activeWeekMonday.getDate() + 6);

  const rangeTitle = `${weekDays[0]?.formattedDate} – ${weekDays[6]?.formattedDate} ${weekEndSunday.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* ── HEADER & WEEK NAVIGATION ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-border shadow-xs">
        <div>
          <h2 className="font-display text-base font-bold text-foreground tracking-tight">
            Peta Jadwal Mingguan (Weekly Timetable)
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Rentang Kalender: <strong>{rangeTitle}</strong>
          </p>
        </div>

        {/* Week Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-3 text-xs font-semibold text-secondary transition shadow-2xs"
            title="Lihat Minggu Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Minggu Lalu</span>
          </button>

          <button
            type="button"
            onClick={handleTodayWeek}
            className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition shadow-2xs"
          >
            Minggu Ini
          </button>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-3 text-xs font-semibold text-secondary transition shadow-2xs"
            title="Lihat Minggu Berikutnya"
          >
            <span className="hidden sm:inline">Minggu Depan</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── TIMETABLE MATRIX GRID ───────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-xs min-w-[780px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-display">
              <th className="p-2.5 text-center border-r border-slate-300 w-20 font-bold">
                Time
              </th>
              {weekDays.map((d) => (
                <th
                  key={d.dateStr}
                  className={`p-2.5 text-center border-r border-slate-300 last:border-r-0 font-bold transition ${
                    d.isToday ? "bg-indigo-50/80 text-indigo-950" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{d.dayNameId}</span>
                    {d.isToday && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white shadow-2xs">
                        HARI INI
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 mt-0.5">
                    {d.formattedDate}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {timeSlots.map((slot) => (
              <tr key={slot} className="hover:bg-slate-50/50 transition-colors">
                {/* Time Column */}
                <td className="p-2.5 text-center font-mono font-bold text-slate-700 bg-slate-50 border-r border-slate-300">
                  {slot}
                </td>

                {/* Day Columns */}
                {weekDays.map((d) => {
                  const matchingSessions = getSessionsForSlot(d.dateStr, slot);

                  return (
                    <td
                      key={d.dateStr}
                      className={`p-1.5 border-r border-slate-200 last:border-r-0 align-top h-14 min-h-[56px] ${
                        d.isToday ? "bg-indigo-50/20" : ""
                      }`}
                    >
                      {matchingSessions.length > 0 ? (
                        <div className="space-y-1.5">
                          {matchingSessions.map((s) => {
                            const isPast = new Date(s.endTime) < new Date();
                            const isAssigned = s.coachId === coaches[0]?.id;

                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSelectedSession(s)}
                                className={`w-full text-left p-2 rounded-xl transition-all shadow-xs block text-xs space-y-1 ${
                                  s.status === "COMPLETED"
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : s.status === "CANCELLED"
                                    ? "bg-slate-200 text-slate-600 hover:bg-slate-300 line-through"
                                    : isPast
                                    ? "bg-amber-600 text-white hover:bg-amber-700"
                                    : isAssigned
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                                    : "bg-sky-600 text-white hover:bg-sky-700"
                                }`}
                              >
                                <div className="font-bold leading-tight line-clamp-1">{s.title}</div>
                                <div className="text-[10.5px] opacity-95 flex items-center gap-1 font-mono">
                                  <span>⏰</span>
                                  <span>
                                    {new Date(s.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                                    {new Date(s.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                {s.location && (
                                  <div className="text-[10px] opacity-90 truncate">
                                    📍 {s.location}
                                  </div>
                                )}
                                {s.athletes.length > 0 && (
                                  <div className="text-[9.5px] opacity-90 truncate">
                                    👥 {s.athletes.length} Atlet
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : canManagePlanning ? (
                        <button
                          type="button"
                          onClick={() => setCreateSlotData(getSlotDate(d.date, slot))}
                          className="group h-full w-full rounded flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50/70 transition"
                          title={`Jadwalkan sesi ${d.dayNameId} (${d.formattedDate}) pukul ${slot}`}
                        >
                          <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── LIST SUMMARY SESI MINGGU INI ─────────────────────────────── */}
      {sessions.length > 0 && (
        <div className="rounded-2xl border border-border bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>Daftar Sesi Terjadwal Minggu Ini ({sessions.length})</span>
            </h3>
            <span className="text-xs text-muted">
              Klik salah satu sesi untuk melihat detail atau memulai presensi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sessions.map((s) => {
              const isPast = new Date(s.endTime) < new Date();
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className="rounded-xl border border-border bg-surface-1 p-3 hover:border-indigo-400 hover:bg-surface-2 transition cursor-pointer space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-foreground line-clamp-1">{s.title}</h4>
                    <Badge variant="accent" className="text-[10px] shrink-0">{s.status}</Badge>
                  </div>

                  <div className="space-y-1 text-[11px] text-muted font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-indigo-500 shrink-0" />
                      <span>
                        {new Date(s.startTime).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })},{" "}
                        {new Date(s.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(s.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {s.location && (
                      <div className="flex items-center gap-1.5 text-secondary">
                        <MapPin className="h-3 w-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{s.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Users className="h-3 w-3 text-indigo-500 shrink-0" />
                      <span>{s.athletes.length} Atlet Terdaftar</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SESSION DETAIL MODAL ────────────────────────────────────── */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted">Detail Sesi Terpilih</span>
                <h3 className="font-display text-base font-bold text-foreground">
                  {selectedSession.title}
                </h3>
              </div>
              <Badge variant="accent">{selectedSession.status}</Badge>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>
                  {new Date(selectedSession.startTime).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {new Date(selectedSession.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(selectedSession.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {selectedSession.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span>{selectedSession.location}</span>
                </div>
              )}

              <div className="flex items-start gap-2 pt-1 border-t border-border">
                <Users className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-foreground">Atlet Terdaftar ({selectedSession.athletes.length}):</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSession.athletes.map((item) => (
                      <span key={item.athlete.id} className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-medium border border-border">
                        {item.athlete.fullName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="pt-1 border-t border-border text-[11px] text-slate-600 italic">
                  Catatan: {selectedSession.notes}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-2 text-secondary transition min-h-[44px]"
              >
                Tutup
              </button>

              {selectedSession.status === "SCHEDULED" ? (
                <Link
                  href={`/schedule/${selectedSession.id}/execute`}
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-2xs flex items-center gap-1.5 min-h-[44px]"
                  title="Buka Workspace Eksekusi Sesi di Lapangan"
                >
                  <PlayCircle className="h-4 w-4" />
                  Eksekusi Sesi
                </Link>
              ) : selectedSession.status === "COMPLETED" ? (
                <Link
                  href={`/schedule/${selectedSession.id}/execute`}
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 transition shadow-2xs flex items-center gap-1.5 min-h-[44px]"
                  title="Lihat Hasil Eksekusi & Presensi Sesi"
                >
                  <Eye className="h-4 w-4" />
                  Lihat Hasil
                </Link>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  const s = selectedSession;
                  setSelectedSession(null);
                  setAttendanceSessionId(s.id);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-2xs flex items-center gap-1.5 min-h-[44px]"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Presensi Sesi
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = selectedSession;
                  setSelectedSession(null);
                  setCloneSession({ id: s.id, status: s.status });
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition shadow-2xs flex items-center gap-1.5 min-h-[44px]"
                title={selectedSession.status === "CANCELLED" || selectedSession.status === "NO_SHOW" ? "Jadwalkan Ulang Sesi" : "Duplikasi Sesi"}
              >
                {selectedSession.status === "CANCELLED" || selectedSession.status === "NO_SHOW" ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Jadwalkan Ulang
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Duplikasi Sesi
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = selectedSession;
                  setSelectedSession(null);
                  setEditingSession(s);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/90 transition shadow-2xs min-h-[44px]"
              >
                ✏️ Edit Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE SESSION DIALOG ─────────────────────────────────── */}
      <AttendanceSessionDialog
        sessionId={attendanceSessionId}
        open={!!attendanceSessionId}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAttendanceSessionId(null);
        }}
        onSaved={() => {
          window.location.reload();
        }}
      />

      {/* ── CLONE SCHEDULE DIALOG ─────────────────────────────────────── */}
      <CloneScheduleDialog
        sessionId={cloneSession?.id ?? null}
        sessionStatus={cloneSession?.status}
        open={!!cloneSession}
        onOpenChange={(isOpen) => {
          if (!isOpen) setCloneSession(null);
        }}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* ── EDIT SESSION DIALOG ─────────────────────────────────────── */}
      {editingSession && (
        <ScheduleDialogForm
          coaches={coaches}
          athletes={athletes}
          initialSession={{
            id: editingSession.id,
            title: editingSession.title,
            coachId: editingSession.coachId,
            athleteIds: editingSession.athletes.map((a) => a.athlete.id),
            startTime: editingSession.startTime,
            endTime: editingSession.endTime,
            location: editingSession.location ?? null,
            notes: editingSession.notes ?? null,
            status: editingSession.status,
          }}
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditingSession(null);
          }}
        />
      )}

      {/* ── CREATE SLOT SESSION DIALOG ─────────────────────────────── */}
      {createSlotData && (
        <ScheduleDialogForm
          coaches={coaches}
          athletes={athletes}
          initialSession={{
            id: "",
            title: "",
            coachId: coaches[0]?.id ?? "",
            athleteIds: [],
            startTime: createSlotData.startTime,
            endTime: createSlotData.endTime,
            location: "Power Up Training Hub",
            notes: "",
            status: "SCHEDULED",
          }}
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) setCreateSlotData(null);
          }}
        />
      )}
    </div>
  );
}
