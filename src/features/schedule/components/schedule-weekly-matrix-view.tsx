"use client";

import { useState } from "react";
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
} from "lucide-react";
import { AttendanceSessionDialog } from "@/features/attendance/components/attendance-session-dialog";
import { CloneScheduleDialog } from "./clone-schedule-dialog";

interface ScheduleWeeklyMatrixViewProps {
  sessions: ScheduleSessionItem[];
  coaches: CoachOption[];
  athletes: AthleteOption[];
  userRole?: string;
}

const TIME_SLOTS = [
  "08:00",
  "09:15",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const DAYS_OF_WEEK = [
  { key: 1, nameEn: "Monday", nameId: "Senin" },
  { key: 2, nameEn: "Tuesday", nameId: "Selasa" },
  { key: 3, nameEn: "Wednesday", nameId: "Rabu" },
  { key: 4, nameEn: "Thursday", nameId: "Kamis" },
  { key: 5, nameEn: "Friday", nameId: "Jumat" },
  { key: 6, nameEn: "Saturday", nameId: "Sabtu" },
  { key: 0, nameEn: "Sunday", nameId: "Minggu" },
];

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

  // Helper to construct a date on the current week for a given dayKey (0=Sun..6=Sat) and slotTime "08:00"
  const getSlotDate = (dayKey: number, slotTime: string) => {
    const now = new Date();
    const currentDay = now.getDay();
    const distance = (dayKey + 7 - currentDay) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + distance);
    const [h, m] = slotTime.split(":").map(Number);
    targetDate.setHours(h, m || 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(targetDate.getHours() + 1, targetDate.getMinutes());
    return { startTime: targetDate, endTime: endDate };
  };

  // Group sessions by day of week (0=Sun..6=Sat) and find matching hour slot
  const getSessionsForSlot = (dayKey: number, slotTime: string) => {
    const [slotHour, slotMin] = slotTime.split(":").map(Number);

    return sessions.filter((s) => {
      const sessionDate = new Date(s.startTime);
      const sessionDay = sessionDate.getDay();
      if (sessionDay !== dayKey) return false;

      const sHour = sessionDate.getHours();
      const sMin = sessionDate.getMinutes();

      // Toleransi slot matching: within 45 mins of slot start
      const slotTotalMinutes = slotHour * 60 + (slotMin || 0);
      const sessionTotalMinutes = sHour * 60 + sMin;
      return (
        sessionTotalMinutes >= slotTotalMinutes - 15 &&
        sessionTotalMinutes <= slotTotalMinutes + 45
      );
    });
  };

  // Determine availability color based on session status & notes
  const getSlotColorClass = (session: ScheduleSessionItem) => {
    if (session.status === "CANCELLED" || session.status === "NO_SHOW") {
      return "bg-rose-500 text-white border-rose-600 hover:bg-rose-600";
    }
    // Check if notes indicate flexibility or off-schedule
    const notesLower = (session.notes || "").toLowerCase();
    if (notesLower.includes("off") || notesLower.includes("tutup") || notesLower.includes("full")) {
      return "bg-rose-500 text-white border-rose-600 hover:bg-rose-600";
    }
    if (notesLower.includes("fleksibel") || notesLower.includes("reschedule") || notesLower.includes("tentative") || notesLower.includes("60%")) {
      return "bg-sky-400 text-slate-950 border-sky-500 hover:bg-sky-300 font-semibold";
    }
    // Default high-certainty schedule (Green)
    return "bg-emerald-400 text-slate-950 border-emerald-500 hover:bg-emerald-300 font-semibold";
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & LEGEND ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground tracking-tight">
            Peta Jadwal Mingguan (Weekly Timetable)
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Peta ketersediaan slot &amp; jadwal sesi mingguan tim kepelatihan
          </p>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span className="font-semibold text-emerald-900 text-[11px]">
              90% Bisa Dijadwalkan (Pasti)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
            <span className="h-3 w-3 rounded-full bg-sky-400 inline-block shrink-0" />
            <span className="font-semibold text-sky-900 text-[11px]">
              60% Bisa Dijadwalkan (Fleksibel)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block shrink-0" />
            <span className="font-semibold text-rose-900 text-[11px]">
              Off Jadwal / Terkunci
            </span>
          </div>
        </div>
      </div>

      {/* ── TIMETABLE MATRIX GRID ───────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-display">
              <th className="p-3 text-center border-r border-slate-300 w-20 font-bold">
                Time
              </th>
              {DAYS_OF_WEEK.map((d) => (
                <th
                  key={d.key}
                  className="p-3 text-center border-r border-slate-300 last:border-r-0 font-bold"
                >
                  <div>{d.nameEn}</div>
                  <div className="text-[10px] text-slate-500 font-normal">({d.nameId})</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {TIME_SLOTS.map((slot) => (
              <tr key={slot} className="hover:bg-slate-50/50 transition-colors">
                {/* Time Column */}
                <td className="p-2.5 text-center font-mono font-bold text-slate-700 bg-slate-50 border-r border-slate-300">
                  {slot}
                </td>

                {/* Day Columns */}
                {DAYS_OF_WEEK.map((d) => {
                  const matchingSessions = getSessionsForSlot(d.key, slot);

                  return (
                    <td
                      key={d.key}
                      className="p-1.5 border-r border-slate-200 last:border-r-0 align-top h-14 min-h-[56px]"
                    >
                      {matchingSessions.length > 0 ? (
                        <div className="space-y-1">
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
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                    : s.status === "CANCELLED"
                                    ? "bg-slate-200 text-slate-600 hover:bg-slate-300 line-through"
                                    : isPast
                                    ? "bg-amber-500 text-white hover:bg-amber-600"
                                    : isAssigned
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                                    : "bg-sky-600 text-white hover:bg-sky-700"
                                }`}
                              >
                                <div className="font-bold leading-tight line-clamp-1">{s.title}</div>
                                {s.location && (
                                  <div className="text-[10px] opacity-90 truncate">
                                    📍 {s.location}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : canManagePlanning ? (
                        <button
                          type="button"
                          onClick={() => setCreateSlotData(getSlotDate(d.key, slot))}
                          className="group h-full w-full rounded flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50/70 transition"
                          title={`Jadwalkan sesi ${d.nameId} pukul ${slot}`}
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
