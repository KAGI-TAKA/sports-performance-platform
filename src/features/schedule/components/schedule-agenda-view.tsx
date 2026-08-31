"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { formatDateHeader, formatTimeRange, toLocalDateStr, getStartOfDay } from "../utils";
import { AttendanceSessionDialog } from "@/features/attendance/components/attendance-session-dialog";

export interface ScheduleSessionItem {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  location: string | null;
  notes: string | null;
  coachId: string;
  coach: {
    user: {
      name: string;
      email: string;
      image: string | null;
    };
  };
  athletes: {
    athlete: {
      id: string;
      fullName: string;
      jerseyNumber: number | null;
      position: string;
      photoUrl: string | null;
    };
  }[];
}

interface ScheduleAgendaViewProps {
  sessions: ScheduleSessionItem[];
  coaches: CoachOption[];
  athletes: AthleteOption[];
  currentDateFilter?: string;
  currentCoachFilter?: string;
  currentStatusFilter?: string;
}

export function ScheduleAgendaView({
  sessions,
  coaches,
  athletes,
  currentDateFilter,
  currentCoachFilter,
  currentStatusFilter,
}: ScheduleAgendaViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<ScheduleSessionItem | null>(null);

  // Attendance Modal State
  const [attendanceSessionId, setAttendanceSessionId] = useState<string | null>(null);

  // Client Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(currentStatusFilter ?? "ALL");
  const [coachFilter, setCoachFilter] = useState<string>(currentCoachFilter ?? "ALL");

  // Date Navigation State
  const todayIso = toLocalDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    currentDateFilter ?? null
  );

  function navigateDay(offset: number) {
    const base = getStartOfDay(selectedDate ?? undefined);
    const target = new Date(base.getTime() + offset * 24 * 60 * 60 * 1000);
    const newDateStr = toLocalDateStr(target);
    setSelectedDate(newDateStr);

    const params = new URLSearchParams(window.location.search);
    params.set("date", newDateStr);
    router.push(`/schedule?${params.toString()}`);
  }

  function handleDatePick(val: string) {
    if (!val) {
      setSelectedDate(null);
      const params = new URLSearchParams(window.location.search);
      params.delete("date");
      router.push(`/schedule?${params.toString()}`);
      return;
    }
    setSelectedDate(val);
    const params = new URLSearchParams(window.location.search);
    params.set("date", val);
    router.push(`/schedule?${params.toString()}`);
  }

  function handleTodayShortcut() {
    setSelectedDate(todayIso);
    const params = new URLSearchParams(window.location.search);
    params.set("date", todayIso);
    router.push(`/schedule?${params.toString()}`);
  }

  function handleAllDatesShortcut() {
    setSelectedDate(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("date");
    router.push(`/schedule?${params.toString()}`);
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

  // Filter Sessions
  const filteredSessions = sessions.filter((s) => {
    // 1. Date Filter
    if (selectedDate) {
      const sDateStr = toLocalDateStr(s.startTime);
      if (sDateStr !== selectedDate) return false;
    }
    // 2. Coach Filter
    if (coachFilter !== "ALL" && s.coachId !== coachFilter) {
      return false;
    }
    // 3. Status Filter
    if (statusFilter !== "ALL" && s.status !== statusFilter) {
      return false;
    }
    // 4. Search Query
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

  // Group filtered sessions by Date (YYYY-MM-DD)
  const grouped: Record<string, ScheduleSessionItem[]> = {};
  filteredSessions.forEach((s) => {
    const key = toLocalDateStr(s.startTime);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {/* Date Navigation & Operational Filters */}
      <Card className="p-4 bg-surface-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Date Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigateDay(-1)}
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant={selectedDate === todayIso ? "default" : "outline"}
              size="xs"
              onClick={handleTodayShortcut}
              className={selectedDate === todayIso ? "bg-accent text-white hover:bg-accent/90 border-transparent" : ""}
            >
              Hari Ini
            </Button>

            <Button
              variant={selectedDate === null ? "default" : "outline"}
              size="xs"
              onClick={handleAllDatesShortcut}
              className={selectedDate === null ? "bg-accent text-white hover:bg-accent/90 border-transparent" : ""}
            >
              Semua Hari
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={() => navigateDay(1)}
              title="Hari Berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            <Input
              type="date"
              value={selectedDate ?? ""}
              onChange={(e) => handleDatePick(e.target.value)}
              className="w-36 text-xs h-7 py-0"
            />
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

      {/* Edit Session Modal Trigger Holder */}
      {editingSession && (
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

      {/* Main Agenda List View */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Tidak Ada Sesi Latihan"
          description={
            selectedDate
              ? `Belum ada sesi latihan terjadwal untuk tanggal ${formatDateHeader(selectedDate)}.`
              : "Belum ada sesi latihan yang cocok dengan kriteria filter."
          }
          action={
            <ScheduleDialogForm coaches={coaches} athletes={athletes} />
          }
          className="bg-surface-1 py-12"
        />
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateKey) => {
            const daySessions = grouped[dateKey];
            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <CalendarIcon className="h-4 w-4 text-accent" />
                  <h2 className="font-display text-sm font-bold text-foreground">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                    {daySessions.length} Sesi
                  </Badge>
                </div>

                {/* Grid of Session Cards for the Date */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {daySessions.map((session) => (
                    <Card
                      key={session.id}
                      className="flex flex-col justify-between hover:border-border-strong transition-colors"
                    >
                      <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          {/* Title & Status */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                              {session.title}
                            </h3>
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
                              <span>Pelatih: <strong className="text-foreground font-medium">{session.coach.user.name}</strong></span>
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
                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-1 text-xs mt-3">
                          {/* Quick Status Buttons */}
                          <div className="flex items-center gap-1">
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

                          {/* Edit & Session Log Links */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setAttendanceSessionId(session.id)}
                              className="flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
                              title="Buka Presensi Sesi"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Presensi
                            </button>

                            {session.status === "COMPLETED" && (
                              <Link
                                href="/session-logs"
                                className="p-1 rounded text-accent hover:bg-accent-bg transition-colors"
                                title="Catat Sesi / Sesi Log"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Link>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance Session Dialog */}
      <AttendanceSessionDialog
        sessionId={attendanceSessionId}
        open={!!attendanceSessionId}
        onOpenChange={(open) => {
          if (!open) setAttendanceSessionId(null);
        }}
        onSaved={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
