import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getSessionExecutionData } from "@/features/session-execution/queries";
import { InjuryAlertBanner } from "@/features/session-execution/components/injury-alert-banner";
import { ScheduleStatusBadge } from "@/features/schedule/components/schedule-status-badge";
import { formatTimeRange } from "@/features/schedule/utils";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Dumbbell,
  PlayCircle,
  Eye,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface AssignedSessionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Detail Sesi Latihan • Coach Zulfi Platform",
  description: "Informasi detail sesi latihan, daftar atlet peserta, dan persiapan eksekusi lapangan.",
};

export default async function AssignedSessionDetailPage({
  params,
}: AssignedSessionPageProps) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const sessionData = await getSessionExecutionData(
    ctx.organizationId,
    id,
    ctx.memberId,
    ctx.role
  );

  if (!sessionData) {
    notFound();
  }

  const isCompleted = sessionData.status === "COMPLETED";
  const isCancelled = sessionData.status === "CANCELLED";
  const isNoShow = sessionData.status === "NO_SHOW";
  const canStart = sessionData.status === "SCHEDULED";

  // Calculate session duration in minutes
  const durationMinutes = Math.round(
    (new Date(sessionData.endTime).getTime() - new Date(sessionData.startTime).getTime()) / 60000
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/70">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali ke Agenda Jadwal</span>
        </Link>
        <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
          Detail Sesi Lapangan
        </span>
      </div>

      {/* Hero Card / Session Identity */}
      <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <ScheduleStatusBadge status={sessionData.status} />
              <span className="text-xs font-mono font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                {sessionData.athletes.length === 1
                  ? "Sesi 1-on-1 Private"
                  : `Sesi Kelompok (${sessionData.athletes.length} Atlet)`}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {sessionData.title}
            </h1>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0">
            {canStart ? (
              <Link
                href={`/schedule/${sessionData.id}/execute`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-accent/25 transition hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <PlayCircle className="h-5 w-5" />
                <span>Mulai Sesi Lapangan</span>
              </Link>
            ) : isCompleted ? (
              <Link
                href={`/schedule/${sessionData.id}/execute`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3.5 shadow-sm transition w-full sm:w-auto"
              >
                <Eye className="h-5 w-5" />
                <span>Lihat Hasil Sesi</span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl bg-surface-2 text-muted px-4 py-2.5 text-xs font-semibold">
                <span>Sesi Tidak Aktif ({sessionData.status})</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border/60 text-xs">
          <div className="space-y-1">
            <span className="text-muted block font-medium">Waktu Sesi</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
              <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>{formatTimeRange(sessionData.startTime, sessionData.endTime)}</span>
            </div>
            <span className="text-[10px] text-muted">Durasi: {durationMinutes} Menit</span>
          </div>

          <div className="space-y-1">
            <span className="text-muted block font-medium">Lokasi Latihan</span>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{sessionData.location || "Lapangan Utama"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-muted block font-medium">Pelatih Bertugas</span>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <User className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{sessionData.coachName}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-muted block font-medium">Peserta Terdaftar</span>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Users className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>{sessionData.athletes.length} Orang Atlet</span>
            </div>
          </div>
        </div>

        {/* Notes if present */}
        {sessionData.notes && (
          <div className="pt-2 text-xs text-muted bg-surface-2/40 p-3 rounded-xl border border-border/40">
            <span className="font-semibold text-foreground block mb-0.5">Catatan Arahan:</span>
            <p className="italic leading-relaxed">{sessionData.notes}</p>
          </div>
        )}
      </div>

      {/* Injury Warning Alert Banner (if any athlete has active injury) */}
      <InjuryAlertBanner athletes={sessionData.athletes} />

      {/* Roster of Athletes */}
      <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            <h2 className="font-display text-base font-bold text-foreground">
              Daftar Atlet Peserta ({sessionData.athletes.length})
            </h2>
          </div>
          <span className="text-xs text-muted">Pastikan kondisi kesiapan fisik atlet</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          {sessionData.athletes.map((athlete) => {
            const hasInjury = athlete.activeInjuries.length > 0;
            return (
              <div
                key={athlete.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  hasInjury
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border bg-surface-2/40 hover:border-border-strong"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-surface-3 border border-border flex items-center justify-center font-bold text-accent shrink-0 overflow-hidden text-sm">
                    {athlete.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={athlete.photoUrl}
                        alt={athlete.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      athlete.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {athlete.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      {athlete.jerseyNumber !== null && (
                        <span className="font-mono font-medium">#{athlete.jerseyNumber}</span>
                      )}
                      {athlete.position && (
                        <span className="truncate">{athlete.position}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Injury Alert Pill */}
                {hasInjury && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Cedera Aktif</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned Training Plan (if available) */}
      {sessionData.trainingPlan && (
        <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-accent" />
              <h2 className="font-display text-base font-bold text-foreground">
                Rencana Latihan: {sessionData.trainingPlan.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-border/60">
                Assigned Plan (Read-Only)
              </span>
              <span className="text-xs text-muted">
                {sessionData.trainingPlan.exercises.length} Drill Terjadwal
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {sessionData.trainingPlan.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-2/40 border border-border/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-surface-3 flex items-center justify-center font-mono font-bold text-muted text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-foreground block">{ex.name}</span>
                    <span className="text-[10px] text-muted">{ex.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-muted text-[11px]">
                  <span>{ex.sets} Set</span>
                  <span>•</span>
                  <span>{ex.reps} Reps</span>
                  {ex.restSeconds && (
                    <>
                      <span>•</span>
                      <span>Rest {ex.restSeconds}s</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      {canStart && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-surface-1/95 backdrop-blur-md border-t border-border shadow-lg flex items-center justify-between max-w-4xl mx-auto rounded-t-2xl sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <span className="text-xs text-muted hidden sm:inline">
            Siap beraksi di lapangan? Tekan tombol untuk membuka Live Cockpit.
          </span>
          <Link
            href={`/schedule/${sessionData.id}/execute`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm px-7 py-3.5 shadow-md shadow-accent/25 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlayCircle className="h-5 w-5" />
            <span>Mulai Sesi Lapangan / Start Session</span>
          </Link>
        </div>
      )}
    </div>
  );
}
