import Link from "next/link";
import {
  PlayCircle,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle2,
  CalendarX,
  CalendarCheck,
  Eye,
} from "lucide-react";
import { requireOrgContext } from "@/lib/auth-context";
import { toLocalDateStr } from "@/features/schedule/utils";
import {
  listScheduleSessions,
  listCoachesForOrg,
  listActiveAthletesForOrg,
} from "@/features/schedule/queries";
import {
  resolveEffectiveScheduleFilters,
  resolveDefaultScope,
  getQuickFilterEmptyState,
} from "@/features/schedule/quick-filter-engine";
import { ScheduleDialogForm } from "@/features/schedule/components/schedule-dialog-form";
import { ScheduleContainer } from "@/features/schedule/components/schedule-container";
import { ExportCSVButton } from "@/features/export/components/export-csv-button";
import type { ScheduleStatus } from "@prisma/client";

import { listTrainingPlans } from "@/features/training-plans/queries";

interface SchedulePageProps {
  searchParams?: Promise<{
    date?: string;
    coachId?: string;
    status?: string;
    view?: string;
    scope?: string;
    period?: string;
  }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const ctx = await requireOrgContext();
  const resolvedParams = searchParams ? await searchParams : {};

  // Resolve Quick Filters & Role Defaults (Zero Client Filter Heavy Load)
  const filters = resolveEffectiveScheduleFilters({
    role: ctx.role,
    memberId: ctx.memberId,
    searchParams: resolvedParams,
  });

  const [sessionsRaw, coachesRaw, athletesRaw, plansRaw] = await Promise.all([
    listScheduleSessions(ctx.organizationId, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      coachId: filters.effectiveCoachId,
      status: filters.status,
    }),
    listCoachesForOrg(ctx.organizationId),
    listActiveAthletesForOrg(ctx.organizationId),
    listTrainingPlans(ctx.organizationId),
  ]);

  const coaches = coachesRaw.map((c) => ({
    id: c.id,
    name: c.user.name,
  }));

  const athletes = athletesRaw.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    jerseyNumber: a.jerseyNumber,
    position: a.position,
  }));

  const trainingPlans = plansRaw.map((p) => ({
    id: p.id,
    title: p.title,
    athleteId: p.athleteId,
  }));

  const sessions = sessionsRaw.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    location: s.location,
    notes: s.notes,
    coachId: s.coachId,
    coach: {
      user: {
        name: s.coach.user.name,
        email: s.coach.user.email,
        image: s.coach.user.image,
      },
    },
    athletes: s.athletes.map((a) => ({
      athlete: {
        id: a.athlete.id,
        fullName: a.athlete.fullName,
        jerseyNumber: a.athlete.jerseyNumber,
        position: a.athlete.position,
        photoUrl: a.athlete.photoUrl,
      },
    })),
    rescheduleRequests: s.rescheduleRequests?.map((r) => ({
      id: r.id,
      status: r.status,
      reason: r.reason,
      requestedByMemberId: r.requestedByMemberId,
    })) ?? [],
  }));

  const isAssistant = ctx.role === "assistant_coach";
  const todayDateStr = toLocalDateStr(new Date());

  // Filter sessions assigned to current Assistant Coach
  const assignedSessions = isAssistant
    ? sessions.filter((s) => s.coachId === ctx.memberId)
    : sessions;

  // Find sessions specifically for TODAY
  const todaySessions = assignedSessions.filter(
    (s) => toLocalDateStr(s.startTime) === todayDateStr
  );
  const activeTodaySession = todaySessions.find((s) => s.status === "SCHEDULED");
  const completedTodaySession = todaySessions.find((s) => s.status === "COMPLETED");

  // Find next future session (strictly after today)
  const nextFutureSession = assignedSessions
    .filter((s) => toLocalDateStr(s.startTime) > todayDateStr && s.status === "SCHEDULED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Assistant Coach Mobile Field App Hero (TODAY-FIRST) */}
      {isAssistant && (
        <div className="rounded-2xl bg-surface-1 border border-border text-foreground p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <div className="text-[11px] font-mono font-bold tracking-wider text-accent uppercase">
                Field Execution App · Assistant Coach
              </div>
              <h2 className="text-lg sm:text-xl font-display font-black text-foreground mt-0.5">
                Selamat Bertugas, {ctx.userName}
              </h2>
            </div>
            <div>
              {activeTodaySession ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sesi Siap Dijalankan Hari Ini
                </div>
              ) : completedTodaySession ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                  Sesi Hari Ini Selesai
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-secondary text-xs font-semibold">
                  <CalendarX className="h-3.5 w-3.5 text-muted" />
                  Tidak Ada Sesi Hari Ini
                </div>
              )}
            </div>
          </div>

          {/* CASE 1: ACTIVE TODAY SESSION */}
          {activeTodaySession ? (
            <div className="space-y-3">
              <div className="text-xs font-mono font-semibold text-accent uppercase tracking-wide flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5" />
                Sesi Hari Ini (Today):
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {activeTodaySession.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 bg-surface-2 px-3 py-2 rounded-lg border border-border">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <span className="font-mono font-medium text-foreground">
                    {new Date(activeTodaySession.startTime).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })}{" "}
                    -{" "}
                    {new Date(activeTodaySession.endTime).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })}{" "}
                    WIB
                  </span>
                </div>

                {activeTodaySession.location && (
                  <div className="flex items-center gap-2 bg-surface-2 px-3 py-2 rounded-lg border border-border truncate">
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span className="truncate text-secondary">{activeTodaySession.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-surface-2 px-3 py-2 rounded-lg border border-border">
                  <Users className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-secondary">
                    {activeTodaySession.athletes.length}{" "}
                    {activeTodaySession.athletes.length === 1 ? "Atlet (Private)" : "Atlet Peserta"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                <Link
                  href={`/schedule/${activeTodaySession.id}/execute`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-accent/20 transition-all active:scale-95"
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>Mulai Sesi Lapangan (Live Cockpit)</span>
                </Link>

                <Link
                  href={`/schedule/${activeTodaySession.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-surface-2 hover:bg-surface-3 px-4 py-3 text-xs font-semibold text-foreground border border-border transition"
                >
                  <span>Detail &amp; Roster Sesi</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : completedTodaySession ? (
            /* CASE 2: COMPLETED TODAY SESSION */
            <div className="space-y-3">
              <div className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                Sesi Hari Ini Telah Diselesaikan
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {completedTodaySession.title}
              </h3>
              <p className="text-xs text-muted">
                ✓ Sesi lapangan selesai · Session Log telah dikirimkan ke Head Coach.
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <Link
                  href={`/schedule/${completedTodaySession.id}/execute`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-2 hover:bg-surface-3 px-4 py-2.5 text-xs font-bold text-foreground border border-border transition"
                >
                  <Eye className="h-4 w-4" />
                  <span>Lihat Ringkasan Hasil</span>
                </Link>
                <Link
                  href="/session-logs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-2 hover:bg-surface-3 px-4 py-2.5 text-xs font-semibold text-muted hover:text-foreground border border-border transition"
                >
                  <span>Riwayat Log Sesi</span>
                </Link>
              </div>
            </div>
          ) : (
            /* CASE 3: NO SESSION TODAY */
            <div className="rounded-xl bg-surface-2/60 border border-border/60 p-4 text-center space-y-1.5">
              <div className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                TODAY&apos;S SESSION
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Tidak ada sesi latihan hari ini.
              </h4>
              <p className="text-xs text-secondary max-w-md mx-auto">
                Semua sesi berikutnya akan muncul sesuai agenda jadwal yang telah ditugaskan oleh Head Coach.
              </p>
            </div>
          )}

          {/* NEXT FUTURE SESSION (OPTIONAL PREVIEW) */}
          {nextFutureSession && !activeTodaySession && (
            <div className="border-t border-border/60 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-secondary uppercase">
                  Sesi Terjadwal Berikutnya (Upcoming):
                </span>
                <span className="text-[10px] font-bold text-muted bg-surface-2 px-2 py-0.5 rounded-full border border-border">
                  Belum Waktunya
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-2/40 border border-border/50">
                <div className="space-y-1">
                  <div className="font-semibold text-xs text-foreground">
                    {nextFutureSession.title}
                  </div>
                  <div className="text-[11px] text-muted flex items-center gap-2 flex-wrap">
                    <span className="font-mono">
                      {new Date(nextFutureSession.startTime).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Jakarta",
                      })}
                    </span>
                    <span>·</span>
                    <span className="font-mono">
                      {new Date(nextFutureSession.startTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Jakarta",
                      })}{" "}
                      WIB
                    </span>
                    {nextFutureSession.location && (
                      <>
                        <span>·</span>
                        <span>{nextFutureSession.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  href={`/schedule/${nextFutureSession.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground bg-surface-1 hover:bg-surface-2 border border-border transition shrink-0"
                >
                  <span>Lihat Detail Sesi</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            {isAssistant ? "Agenda Sesi Latihan Lapangan" : "Jadwal Sesi Latihan"}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {isAssistant
              ? "Daftar sesi yang ditugaskan kepada Anda untuk presensi, evaluasi tes, dan pelaporan."
              : "Kelola agenda operasional private training 1-on-1 dan grup kecil atlet & pelatih."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportCSVButton endpoint="/api/export/schedule" label="Export CSV" />
          {(ctx.role === "admin" || ctx.role === "head_coach") && (
            <ScheduleDialogForm coaches={coaches} athletes={athletes} trainingPlans={trainingPlans} />
          )}
        </div>
      </div>

      {/* Schedule Dual View (Calendar + Agenda + Timetable) */}
      <ScheduleContainer
        sessions={sessions}
        coaches={coaches}
        athletes={athletes}
        currentDateFilter={resolvedParams.date}
        currentCoachFilter={filters.effectiveCoachId}
        currentStatusFilter={filters.status}
        activeQuickFilter={filters.activeQuickFilter}
        userRole={ctx.role}
        defaultScope={resolveDefaultScope(ctx.role)}
      />
    </div>
  );
}
