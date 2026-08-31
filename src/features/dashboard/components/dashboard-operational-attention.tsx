import Link from "next/link";
import {
  AlertCircle,
  Clock,
  FileEdit,
  ClipboardCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { SessionHealthSummary, AthleteReTestSummary } from "@/features/coaching-intelligence/types";

interface DashboardOperationalAttentionProps {
  sessionHealth: SessionHealthSummary | null;
  reTestSummary: AthleteReTestSummary | null;
  activeInjuriesCount?: number;
  isUnavailable?: boolean;
}

export function DashboardOperationalAttention({
  sessionHealth,
  reTestSummary,
  activeInjuriesCount = 0,
  isUnavailable = false,
}: DashboardOperationalAttentionProps) {
  if (isUnavailable || (!sessionHealth && !reTestSummary)) {
    return (
      <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Aksi & Perhatian Operasional
              </CardTitle>
            </div>
            <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Sementara Tidak Tersedia
            </span>
          </CardHeader>

          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-2/60 border border-border text-xs text-secondary">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-xs text-foreground">Data Operasional Tidak Dapat Dimuat</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Informasi sesi dan evaluasi fisik sementara tidak dapat diambil. Silakan muat ulang halaman.
                </p>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
          <span>Pusat Komando Operasional</span>
          <Link href="/schedule" className="font-semibold text-accent hover:underline">
            Buka Jadwal Sesi →
          </Link>
        </div>
      </Card>
    );
  }

  const {
    anomalies = [],
    pastScheduledCount = 0,
    missingLogCount = 0,
    unmarkedAttendanceCount = 0,
  } = sessionHealth || {};

  const overdueCount = reTestSummary?.overdueCount ?? 0;
  const dueCount = reTestSummary?.dueCount ?? 0;
  const totalReTestActionable = overdueCount + dueCount;

  const totalActionCount =
    pastScheduledCount +
    missingLogCount +
    unmarkedAttendanceCount +
    (totalReTestActionable > 0 ? 1 : 0) +
    (activeInjuriesCount > 0 ? 1 : 0);

  const hasActionItems = totalActionCount > 0;

  return (
    <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Aksi & Perhatian Operasional
            </CardTitle>
          </div>
          {hasActionItems ? (
            <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {totalActionCount} Perlu Tindakan
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Kondisi Prima
            </span>
          )}
        </CardHeader>

        <CardContent className="p-3.5 space-y-2.5">
          {!hasActionItems ? (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-xs">Semua Operasional Terkendali</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  Semua sesi latihan difinalisasi dengan rapi dan seluruh evaluasi fisik atlet masih relevan.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* 1. Past Scheduled Sessions (Highest priority) */}
              {pastScheduledCount > 0 && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        {pastScheduledCount} Sesi Belum Difinalisasi
                      </span>
                    </div>
                    <Link
                      href="/schedule"
                      className="text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:underline inline-flex items-center gap-0.5"
                    >
                      Buka Jadwal <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {anomalies
                      .filter((a) => a.healthType === "PAST_SCHEDULED")
                      .slice(0, 2)
                      .map((sess) => (
                        <div
                          key={sess.sessionId}
                          className="flex items-center justify-between text-[11px] bg-surface-1/80 p-1.5 rounded border border-border/50"
                        >
                          <span className="truncate max-w-[160px] font-medium text-foreground">
                            {sess.sessionTitle} · {sess.coachName}
                          </span>
                          <Link
                            href={sess.ctaUrl}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline shrink-0"
                          >
                            Eksekusi <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 2. Completed Sessions Missing Required Logs */}
              {missingLogCount > 0 && (
                <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileEdit className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span className="text-xs font-semibold text-sky-900 dark:text-sky-200">
                        {missingLogCount} Catatan Sesi Belum Lengkap
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {anomalies
                      .filter((a) => a.healthType === "COMPLETED_MISSING_LOG")
                      .slice(0, 2)
                      .map((sess) => (
                        <div
                          key={sess.sessionId}
                          className="flex items-center justify-between text-[11px] bg-surface-1/80 p-1.5 rounded border border-border/50"
                        >
                          <div className="truncate max-w-[170px]">
                            <span className="font-medium text-foreground">{sess.sessionTitle}</span>
                            <span className="text-[10px] text-muted block truncate">
                              Atlet: {sess.affectedAthleteNames.join(", ")}
                            </span>
                          </div>
                          <Link
                            href={sess.ctaUrl}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
                          >
                            Lengkapi Log <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 3. Unmarked Attendance */}
              {unmarkedAttendanceCount > 0 && (
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                        {unmarkedAttendanceCount} Presensi Belum Ditandai
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {anomalies
                      .filter((a) => a.healthType === "UNMARKED_ATTENDANCE")
                      .slice(0, 2)
                      .map((sess) => (
                        <div
                          key={sess.sessionId}
                          className="flex items-center justify-between text-[11px] bg-surface-1/80 p-1.5 rounded border border-border/50"
                        >
                          <span className="truncate max-w-[160px] font-medium text-foreground">
                            {sess.sessionTitle} · {sess.coachName}
                          </span>
                          <Link
                            href={sess.ctaUrl}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                          >
                            Tandai <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 4. Assessment Overdue Action */}
              {totalReTestActionable > 0 && (
                <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    <div>
                      <span className="font-semibold text-rose-900 dark:text-rose-200 block">
                        {totalReTestActionable} Atlet Perlu Re-Test
                      </span>
                      <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80">
                        {overdueCount} sangat terlambat · {dueCount} jatuh tempo
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/assessments"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-400 hover:underline shrink-0"
                  >
                    Buka <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
        <span>Prioritas: Sesi Lampau → Log → Presensi → Re-Test</span>
        <Link href="/schedule" className="font-semibold text-accent hover:underline">
          Kelola Jadwal →
        </Link>
      </div>
    </Card>
  );
}
