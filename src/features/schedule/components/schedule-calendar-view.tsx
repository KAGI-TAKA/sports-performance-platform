"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateScheduleStatus, deleteScheduleSession } from "../actions";
import { ScheduleStatusBadge } from "./schedule-status-badge";
import { ScheduleDialogForm, type CoachOption, type AthleteOption } from "./schedule-dialog-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import type { ScheduleStatus } from "@prisma/client";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Edit2,
  FileText,
  UserCheck,
  PlayCircle,
  Eye,
  Copy,
  RotateCcw,
  Send,
} from "lucide-react";
import type { ScheduleSessionItem } from "./schedule-agenda-view";
import { AttendanceSessionDialog } from "@/features/attendance/components/attendance-session-dialog";
import { CloneScheduleDialog } from "./clone-schedule-dialog";
import { RescheduleRequestDialog } from "@/features/reschedule-requests/components/reschedule-request-dialog";
import {
  getCalendarDaysForMonth,
  formatMonthHeader,
  formatDateHeader,
  formatTimeRange,
  toLocalDateStr,
  getZonedParts,
  parseLocalDateTimeToUTC,
} from "../utils";

interface ScheduleCalendarViewProps {
  sessions: ScheduleSessionItem[];
  coaches: CoachOption[];
  athletes: AthleteOption[];
  currentDateFilter?: string;
  currentCoachFilter?: string;
  currentStatusFilter?: string;
  userRole?: string;
}

const WEEKDAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function ScheduleCalendarView({
  sessions,
  coaches,
  athletes,
  currentDateFilter,
  currentCoachFilter,
  currentStatusFilter,
  userRole,
}: ScheduleCalendarViewProps) {
  const canManagePlanning = userRole === "admin" || userRole === "head_coach";
  const isAssistantCoach = userRole === "assistant_coach";
  const todayDateStr = toLocalDateStr(new Date());
  const [isPending, startTransition] = useTransition();

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<ScheduleSessionItem | null>(null);

  // Clone Modal State
  const [cloneSession, setCloneSession] = useState<{ id: string; status: ScheduleStatus } | null>(null);

  // Attendance Modal State
  const [attendanceSessionId, setAttendanceSessionId] = useState<string | null>(null);

  // Reschedule Request Modal State
  const [rescheduleSession, setRescheduleSession] = useState<{
    id: string;
    title: string;
    date: string;
    existingRequest?: {
      status: "PENDING" | "APPROVED" | "REJECTED";
      reason: string;
    } | null;
  } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(currentStatusFilter ?? "ALL");
  const [coachFilter, setCoachFilter] = useState<string>(currentCoachFilter ?? "ALL");

  // Current Month State (default to current date or currentDateFilter's month)
  const initialZoned = getZonedParts(
    currentDateFilter ? parseLocalDateTimeToUTC(`${currentDateFilter}T00:00`) : new Date()
  );
  const [currentYear, setCurrentYear] = useState(initialZoned.year);
  const [currentMonth, setCurrentMonth] = useState(initialZoned.month - 1);

  // Selected Date State (defaults to today or currentDateFilter)
  const todayIso = toLocalDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(currentDateFilter ?? todayIso);

  // Filter Sessions
  const filteredSessions = sessions.filter((s) => {
    // Coach Filter
    if (coachFilter !== "ALL" && s.coachId !== coachFilter) return false;
    // Status Filter
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchLocation = s.location?.toLowerCase().includes(q);
      const matchCoach = s.coach.user.name.toLowerCase().includes(q);
      const matchAthlete = s.athletes.some((a) =>
        a.athlete.fullName.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchLocation && !matchCoach && !matchAthlete) return false;
    }
    return true;
  });

  // Map sessions by date (YYYY-MM-DD)
  const sessionsByDate: Record<string, ScheduleSessionItem[]> = {};
  filteredSessions.forEach((s) => {
    const key = toLocalDateStr(s.startTime);
    if (!sessionsByDate[key]) sessionsByDate[key] = [];
    sessionsByDate[key].push(s);
  });

  // Month Navigation Handlers
  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleToday() {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayIso);
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
  }

  async function handleStatusChange(sessionId: string, status: ScheduleStatus) {
    startTransition(async () => {
      const res = await updateScheduleStatus(sessionId, status);
      if (res.success) {
        toast.success("Status sesi diperbarui");
      } else {
        toast.error(res.error ?? "Gagal memperbarui status");
      }
    });
  }

  async function handleDelete(sessionId: string, title: string) {
    if (!confirm(`Hapus sesi jadwal "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteScheduleSession(sessionId);
      if (res.success) {
        toast.success("Jadwal sesi dihapus");
      } else {
        toast.error(res.error ?? "Gagal menghapus jadwal");
      }
    });
  }

  const calendarDays = getCalendarDaysForMonth(currentYear, currentMonth);
  const selectedDaySessions = sessionsByDate[selectedDate] ?? [];

  return (
    <div className="space-y-6">
      {/* Month Navigation & Operational Filters */}
      <Card className="p-4 bg-surface-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Month Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <h2 className="font-display text-sm sm:text-base font-bold text-foreground min-w-36 text-center">
              {formatMonthHeader(currentYear, currentMonth)}
            </h2>

            <Button
              variant="outline"
              size="xs"
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant={selectedDate === todayIso ? "default" : "outline"}
              size="xs"
              onClick={handleToday}
              className={
                selectedDate === todayIso
                  ? "bg-accent text-white hover:bg-accent/90 border-transparent"
                  : ""
              }
            >
              Hari Ini
            </Button>
          </div>

          {/* Right: Coach & Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-muted" />
              <Select
                value={coachFilter}
                onChange={(e) => setCoachFilter(e.target.value)}
                className="w-36 text-xs h-7 py-0"
              >
                <option value="ALL">Semua Pelatih</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36 text-xs h-7 py-0"
            >
              <option value="ALL">Semua Status</option>
              <option value="SCHEDULED">Terjadwal</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="NO_SHOW">Tidak Hadir</option>
            </Select>

            <Input
              type="text"
              placeholder="Cari sesi/atlet…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-44 text-xs h-7 py-0"
            />
          </div>
        </div>
      </Card>

      {/* Edit Session Modal */}
      {canManagePlanning && editingSession && (
        <ScheduleDialogForm
          key={editingSession.id}
          coaches={coaches}
          athletes={athletes}
          initialSession={{
            id: editingSession.id,
            title: editingSession.title,
            startTime: editingSession.startTime,
            endTime: editingSession.endTime,
            status: editingSession.status,
            location: editingSession.location,
            notes: editingSession.notes,
            coachId: editingSession.coachId,
            athleteIds: editingSession.athletes.map((a) => a.athlete.id),
          }}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingSession(null);
          }}
        />
      )}

      {/* ── MOBILE HORIZONTAL DATE STRIP (< sm) ── */}
      <div className="block sm:hidden space-y-2 bg-surface-1 p-3 rounded-2xl border border-border">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold font-display text-foreground">
            {formatMonthHeader(currentYear, currentMonth)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg border border-border text-secondary hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg border border-border text-secondary hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scrollable date pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {calendarDays
            .filter((d) => d.isCurrentMonth)
            .map((d) => {
              const isSelected = d.dateStr === selectedDate;
              const hasSessions = (sessionsByDate[d.dateStr] ?? []).length > 0;
              const dateObj = new Date(d.dateStr);
              const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "short" });

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => handleSelectDate(d.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-1 rounded-xl border text-center transition shrink-0 ${
                    isSelected
                      ? "bg-accent text-white border-accent shadow-xs"
                      : "bg-surface-2 border-border/80 text-foreground hover:bg-surface-3"
                  }`}
                >
                  <span className="text-[10px] font-medium opacity-80 uppercase">{dayName}</span>
                  <span className="text-sm font-extrabold">{d.dayNumber}</span>
                  <span
                    className={`h-1 w-1 rounded-full mt-0.5 ${
                      hasSessions ? (isSelected ? "bg-white" : "bg-accent") : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
        </div>
      </div>

      {/* ── DESKTOP MONTH CALENDAR GRID (>= sm) ── */}
      <Card className="hidden sm:block p-3 sm:p-4 bg-surface-1 overflow-hidden border border-border">
        {/* Weekday Header Row */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-muted uppercase tracking-wider">
          {WEEKDAY_NAMES.map((dayName) => (
            <div key={dayName} className="py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((day) => {
            const daySessions = sessionsByDate[day.dateStr] ?? [];
            const isSelected = day.dateStr === selectedDate;
            const hasSessions = daySessions.length > 0;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => handleSelectDate(day.dateStr)}
                className={`min-h-[64px] sm:min-h-[90px] p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-1 focus:ring-accent ${
                  !day.isCurrentMonth
                    ? "bg-surface-2/30 border-border/40 text-muted/40"
                    : isSelected
                    ? "bg-accent/10 border-accent text-foreground shadow-sm ring-1 ring-accent/30"
                    : "bg-surface-2/60 border-border/60 hover:border-border-strong text-foreground"
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold ${
                      day.isToday
                        ? "bg-accent text-white font-black"
                        : isSelected
                        ? "text-accent font-extrabold"
                        : !day.isCurrentMonth
                        ? "text-muted/40"
                        : "text-foreground"
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {hasSessions && (
                    <span className="text-[10px] font-mono font-bold text-muted bg-surface-3 px-1 rounded">
                      {daySessions.length}
                    </span>
                  )}
                </div>

                {/* Session Indicators */}
                <div className="w-full space-y-1 mt-1">
                  <div className="flex flex-col gap-0.5 max-h-[50px] overflow-hidden">
                    {daySessions.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className={`truncate text-[10px] px-1 py-0.5 rounded font-medium ${
                          s.status === "SCHEDULED"
                            ? "bg-amber-400/15 text-amber-400 border border-amber-400/20"
                            : s.status === "COMPLETED"
                            ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20"
                            : s.status === "CANCELLED"
                            ? "bg-slate-400/15 text-slate-400 border border-slate-400/20"
                            : "bg-rose-400/15 text-rose-400 border border-rose-400/20"
                        }`}
                      >
                        {new Date(s.startTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {s.title}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <span className="text-[9.5px] text-muted font-medium pl-0.5">
                        +{daySessions.length - 2} sesi lagi
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Agenda Details View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-accent" />
            <h3 className="font-display text-sm font-bold text-foreground">
              Jadwal Sesi: {formatDateHeader(selectedDate)}
            </h3>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {selectedDaySessions.length} Sesi Terjadwal
          </Badge>
        </div>

        {selectedDaySessions.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title={
              isAssistantCoach && selectedDate === todayIso
                ? "TIDAK ADA SESI HARI INI"
                : isAssistantCoach
                ? "Tidak Ada Sesi Terjadwal"
                : "Tidak Ada Sesi Latihan"
            }
            description={
              isAssistantCoach && selectedDate === todayIso
                ? "Tidak ada sesi latihan yang ditugaskan kepada Anda hari ini."
                : isAssistantCoach
                ? "Tidak ada sesi latihan yang ditugaskan kepada Anda pada periode ini."
                : `Belum ada sesi latihan terjadwal untuk tanggal ${formatDateHeader(selectedDate)}.`
            }
            action={canManagePlanning ? <ScheduleDialogForm coaches={coaches} athletes={athletes} /> : undefined}
            className="bg-surface-1 py-8"
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {selectedDaySessions.map((session) => (
              <Card
                key={session.id}
                className="flex flex-col justify-between hover:border-border-strong transition-colors"
              >
                <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-bold text-foreground leading-snug">
                        {session.title}
                      </h4>
                      <ScheduleStatusBadge status={session.status} />
                    </div>

                    {/* Time, Location & Coach Metadata */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-accent">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {formatTimeRange(session.startTime, session.endTime)}
                      </div>

                      {session.location && (
                        <div className="flex items-center gap-1.5 text-muted">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                          <span className="truncate">{session.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted">
                        <User className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                        <span>
                          Pelatih:{" "}
                          <strong className="text-foreground font-medium">
                            {session.coach.user.name}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Athlete List Box */}
                    <div className="rounded-md bg-surface-2/60 p-2.5 space-y-1.5 border border-border/40">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Peserta ({session.athletes.length})
                        </span>
                        <span className="text-[10px] text-accent font-medium">
                          {session.athletes.length === 1
                            ? "Private 1-on-1"
                            : `Grup ${session.athletes.length} Anak`}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {session.athletes.map(({ athlete }) => (
                          <Badge
                            key={athlete.id}
                            variant="default"
                            className="text-[10.5px] py-0.2 px-2 bg-surface-1 border-border font-medium"
                          >
                            {athlete.fullName}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {session.notes && (
                      <p className="text-[11px] text-muted italic line-clamp-2 bg-surface-2/30 p-2 rounded border border-border/30">
                        &quot;{session.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Operational Actions Footer */}
                  <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs mt-3">
                    {/* Quick Status Buttons - Admin & Head Coach Only */}
                    {canManagePlanning && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {session.status !== "COMPLETED" && (
                          <button
                            disabled={isPending}
                            onClick={() => handleStatusChange(session.id, "COMPLETED")}
                            className="flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-semibold text-success bg-success-bg hover:bg-success/20 transition-colors"
                            title="Tandai Selesai"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Selesai
                          </button>
                        )}

                        {session.status !== "CANCELLED" && (
                          <button
                            disabled={isPending}
                            onClick={() => handleStatusChange(session.id, "CANCELLED")}
                            className="flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-semibold text-secondary bg-surface-2 hover:bg-surface-3 transition-colors"
                            title="Tandai Dibatalkan"
                          >
                            <XCircle className="h-3 w-3" />
                            Batal
                          </button>
                        )}

                        {session.status !== "NO_SHOW" && (
                          <button
                            disabled={isPending}
                            onClick={() => handleStatusChange(session.id, "NO_SHOW")}
                            className="flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-semibold text-danger bg-danger-bg hover:bg-danger/20 transition-colors"
                            title="Tandai Tidak Hadir"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Absen
                          </button>
                        )}
                      </div>
                    )}

                    {/* Primary Execution CTA & Action Links */}
                    <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                      <Link
                        href={`/schedule/${session.id}`}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-muted hover:text-foreground hover:bg-surface-2 border border-border/60 transition-colors"
                        title="Lihat Detail Sesi & Atlet"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detail</span>
                      </Link>

                      {session.status === "SCHEDULED" ? (() => {
                        const sessionDateStr = toLocalDateStr(session.startTime);
                        const isOverdue = sessionDateStr < todayDateStr;
                        const isToday = sessionDateStr === todayDateStr;
                        const isFuture = sessionDateStr > todayDateStr;

                        if (isOverdue && isAssistantCoach) {
                          const pendingReq = session.rescheduleRequests?.find((r) => r.status === "PENDING");
                          const rejectedReq = session.rescheduleRequests?.find((r) => r.status === "REJECTED");

                          if (pendingReq) {
                            return (
                              <button
                                type="button"
                                onClick={() => setRescheduleSession({
                                  id: session.id,
                                  title: session.title,
                                  date: new Date(session.startTime).toLocaleDateString("id-ID", {
                                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                                    timeZone: "Asia/Jakarta",
                                  }),
                                  existingRequest: pendingReq,
                                })}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 transition-colors"
                                title="Permintaan reschedule sedang menunggu peninjauan Head Coach"
                              >
                                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span>⏳ Menunggu Reschedule</span>
                              </button>
                            );
                          } else if (rejectedReq) {
                            return (
                              <button
                                type="button"
                                onClick={() => setRescheduleSession({
                                  id: session.id,
                                  title: session.title,
                                  date: new Date(session.startTime).toLocaleDateString("id-ID", {
                                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                                    timeZone: "Asia/Jakarta",
                                  }),
                                  existingRequest: rejectedReq,
                                })}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                                title="Permintaan sebelumnya ditolak, klik untuk meminta ulang"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Minta Ulang Reschedule</span>
                              </button>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => setRescheduleSession({
                                id: session.id,
                                title: session.title,
                                date: new Date(session.startTime).toLocaleDateString("id-ID", {
                                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                                  timeZone: "Asia/Jakarta",
                                }),
                                existingRequest: null,
                              })}
                              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                              title="Minta Head Coach untuk menjadwalkan ulang sesi ini"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Minta Reschedule</span>
                            </button>
                          );
                        } else if (isToday || (isFuture && !isAssistantCoach)) {
                          return (
                            <Link
                              href={`/schedule/${session.id}/execute`}
                              className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs active:scale-95"
                              title="Buka Workspace Eksekusi Sesi di Lapangan"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                              <span>Mulai Sesi</span>
                            </Link>
                          );
                        } else if (isFuture && isAssistantCoach) {
                          return null;
                        } else {
                          return (
                            <Link
                              href={`/schedule/${session.id}/execute`}
                              className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs active:scale-95"
                              title="Buka Workspace Eksekusi Sesi di Lapangan"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                              <span>Mulai Sesi</span>
                            </Link>
                          );
                        }
                      })() : session.status === "COMPLETED" ? (
                        <Link
                          href={`/schedule/${session.id}/execute`}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 transition-colors"
                          title="Lihat Hasil Eksekusi & Presensi Sesi"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Hasil</span>
                        </Link>
                      ) : null}

                      {(session.status !== "COMPLETED" || canManagePlanning) && (
                        <button
                          onClick={() => setAttendanceSessionId(session.id)}
                          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
                          title="Buka Presensi Sesi Cepat"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Presensi
                        </button>
                      )}

                      {session.status === "COMPLETED" && (
                        <Link
                          href="/session-logs"
                          className="p-1 rounded text-accent hover:bg-accent-bg transition-colors"
                          title="Catat Sesi / Sesi Log"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      {/* Clone, Edit, Delete Actions - Admin & Head Coach Only */}
                      {canManagePlanning && (
                        <div className="flex items-center gap-1 border-l border-border/60 pl-1.5">
                          {session.status === "CANCELLED" || session.status === "NO_SHOW" ? (
                            <button
                              onClick={() => setCloneSession({ id: session.id, status: session.status })}
                              className="flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                              title="Jadwalkan Ulang Sesi Ini"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Jadwalkan Ulang
                            </button>
                          ) : (
                            <button
                              onClick={() => setCloneSession({ id: session.id, status: session.status })}
                              className="p-1 rounded text-secondary hover:text-indigo-600 hover:bg-surface-2 transition-colors"
                              title="Duplikasi Sesi"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setEditingSession(session)}
                            className="p-1 rounded text-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
                            title="Edit Sesi"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            disabled={isPending}
                            onClick={() => handleDelete(session.id, session.title)}
                            className="p-1 rounded text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Session Dialog */}
      <AttendanceSessionDialog
        sessionId={attendanceSessionId}
        open={!!attendanceSessionId}
        onOpenChange={(open) => {
          if (!open) setAttendanceSessionId(null);
        }}
        onSaved={() => {
          window.location.reload();
        }}
      />

      {/* Clone Schedule Dialog */}
      <CloneScheduleDialog
        sessionId={cloneSession?.id ?? null}
        sessionStatus={cloneSession?.status}
        open={!!cloneSession}
        onOpenChange={(open) => {
          if (!open) setCloneSession(null);
        }}
        onSuccess={() => {
          // No-op or toast handled by parent/dialog
        }}
      />

      {/* Reschedule Request Dialog — Assistant Coach only */}
      {rescheduleSession && (
        <RescheduleRequestDialog
          sessionId={rescheduleSession.id}
          sessionTitle={rescheduleSession.title}
          sessionDate={rescheduleSession.date}
          existingRequest={rescheduleSession.existingRequest}
          onClose={() => setRescheduleSession(null)}
        />
      )}
    </div>
  );
}
