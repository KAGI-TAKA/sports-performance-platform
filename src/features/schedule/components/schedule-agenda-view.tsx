"use client";

import { useTransition } from "react";
import { updateScheduleStatus, deleteScheduleSession } from "../actions";
import { ScheduleStatusBadge } from "./schedule-status-badge";
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
} from "lucide-react";

interface ScheduleSessionItem {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  location: string | null;
  notes: string | null;
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

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const formattedDate = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isToday) return `Hari Ini — ${formattedDate}`;
  if (isTomorrow) return `Besok — ${formattedDate}`;
  return formattedDate;
}

function formatTimeRange(start: Date, end: Date): string {
  const s = new Date(start).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const e = new Date(end).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${s} - ${e}`;
}

export function ScheduleAgendaView({
  sessions,
}: {
  sessions: ScheduleSessionItem[];
}) {
  const [isPending, startTransition] = useTransition();

  // Group sessions by Date (YYYY-MM-DD)
  const grouped: Record<string, ScheduleSessionItem[]> = {};
  sessions.forEach((s) => {
    const key = new Date(s.startTime).toISOString().split("T")[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  const sortedDates = Object.keys(grouped).sort();

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

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 py-12 text-center">
        <CalendarIcon className="h-10 w-10 text-muted/50 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">
          Belum Ada Jadwal Sesi Latihan
        </h3>
        <p className="mt-1 text-xs text-muted max-w-sm">
          Klik tombol "Tambah Jadwal Sesi" di atas untuk menambahkan jadwal sesi
          private 1-on-1 atau grup kecil.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const daySessions = grouped[dateKey];
        return (
          <div key={dateKey} className="space-y-3">
            {/* Header Tanggal */}
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <CalendarIcon className="h-4 w-4 text-accent" />
              <h2 className="font-display text-sm font-bold text-foreground">
                {formatDateHeader(dateKey)}
              </h2>
              <span className="ml-auto text-xs text-muted font-mono">
                {daySessions.length} sesi
              </span>
            </div>

            {/* List Sesi pada Hari Ini */}
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {daySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-surface-1 p-4 shadow-sm hover:border-accent/40 transition"
                >
                  <div className="space-y-3">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                        {session.title}
                      </h3>
                      <ScheduleStatusBadge status={session.status} />
                    </div>

                    {/* Time & Location */}
                    <div className="space-y-1 text-xs text-muted">
                      <div className="flex items-center gap-1.5 text-foreground font-mono font-medium">
                        <Clock className="h-3.5 w-3.5 text-accent" />
                        {formatTimeRange(session.startTime, session.endTime)}
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span className="truncate">{session.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted shrink-0" />
                        <span>Pelatih: {session.coach.user.name}</span>
                      </div>
                    </div>

                    {/* Daftar Atlet */}
                    <div className="rounded-lg bg-surface-2/60 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Atlet ({session.athletes.length})
                        </span>
                        <span className="text-[10px] text-accent">
                          {session.athletes.length === 1
                            ? "1-on-1 Private"
                            : `Grup ${session.athletes.length} Anak`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {session.athletes.map(({ athlete }) => (
                          <div
                            key={athlete.id}
                            className="inline-flex items-center gap-1 rounded-md bg-surface-1 border border-border px-2 py-1 text-xs font-medium text-foreground"
                          >
                            <span>{athlete.fullName}</span>
                            {athlete.jerseyNumber != null && (
                              <span className="text-[10px] text-muted font-mono">
                                #{athlete.jerseyNumber}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Catatan Sesi */}
                    {session.notes && (
                      <p className="text-[11px] text-muted italic line-clamp-2 bg-surface-2/30 p-2 rounded">
                        "{session.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      {session.status !== "COMPLETED" && (
                        <button
                          disabled={isPending}
                          onClick={() =>
                            handleStatusChange(session.id, "COMPLETED")
                          }
                          className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                          title="Tandai Selesai"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Selesai
                        </button>
                      )}
                      {session.status !== "CANCELLED" && (
                        <button
                          disabled={isPending}
                          onClick={() =>
                            handleStatusChange(session.id, "CANCELLED")
                          }
                          className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-muted bg-surface-2 hover:bg-surface-3 transition"
                          title="Tandai Dibatalkan"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Batal
                        </button>
                      )}
                      {session.status !== "NO_SHOW" && (
                        <button
                          disabled={isPending}
                          onClick={() =>
                            handleStatusChange(session.id, "NO_SHOW")
                          }
                          className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
                          title="Tandai Tidak Hadir"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Absen
                        </button>
                      )}
                    </div>

                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(session.id, session.title)}
                      className="p-1 rounded text-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Hapus Sesi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
