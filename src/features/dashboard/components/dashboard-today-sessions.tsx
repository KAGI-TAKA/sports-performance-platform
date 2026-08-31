import Link from "next/link";
import { Calendar, Play, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { SessionHealthItem } from "@/features/coaching-intelligence/types";
import type { DashboardStats } from "../types";

interface DashboardTodaySessionsProps {
  todaySessions: SessionHealthItem[] | null;
  upcomingSessionsFallback?: DashboardStats["upcomingSessions"];
  isUnavailable?: boolean;
}

export function DashboardTodaySessions({
  todaySessions,
  upcomingSessionsFallback = [],
  isUnavailable = false,
}: DashboardTodaySessionsProps) {
  if (isUnavailable || (todaySessions === null && upcomingSessionsFallback.length === 0)) {
    return (
      <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Sesi Latihan Hari Ini
              </CardTitle>
            </div>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Sementara Tidak Tersedia
            </span>
          </CardHeader>

          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-2/60 border border-border text-xs text-secondary">
              <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-xs text-foreground">Agenda Sesi Tidak Dapat Dimuat</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Informasi agenda sesi latihan hari ini sementara tidak dapat diambil. Silakan muat ulang halaman.
                </p>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
          <span>Eksekusi latihan lapangan</span>
          <Link href="/schedule" className="font-semibold text-accent hover:underline">
            Buka Kalender Sesi →
          </Link>
        </div>
      </Card>
    );
  }

  const safeTodaySessions = todaySessions || [];
  const hasTodaySessions = safeTodaySessions.length > 0;
  const displayItems = hasTodaySessions
    ? safeTodaySessions
    : upcomingSessionsFallback.map((s) => ({
        sessionId: s.id,
        sessionTitle: s.title,
        coachId: "",
        coachName: s.coachName || "Pelatih",
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
        startTimeFormatted: new Date(s.startTime).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }),
        endTimeFormatted: new Date(s.endTime).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }),
        status: s.status,
        healthType: "TODAY_UPCOMING" as const,
        severity: "INFO" as const,
        title: s.title,
        description: "",
        affectedAthleteNames: s.athleteCount > 0 ? [`${s.athleteCount} Atlet`] : [],
        ctaLabel: "Buka Workspace",
        ctaUrl: `/schedule/${s.id}/execute`,
      }));

  return (
    <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sky-500" />
            <CardTitle className="text-sm font-semibold text-foreground">
              {hasTodaySessions ? "Sesi Latihan Hari Ini" : "Sesi Terdekat Mendatang"}
            </CardTitle>
          </div>
          <Link
            href="/schedule"
            className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-3.5 space-y-2.5">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted border border-dashed border-border/80 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-muted/60 mb-2" />
              <p className="text-xs font-semibold text-foreground">Tidak Ada Sesi Terjadwal</p>
              <p className="text-[11px] text-muted max-w-[260px] mt-0.5">
                Tidak ada agenda latihan untuk hari ini. Gunakan waktu untuk evaluasi data atlet atau persiapan materi program.
              </p>
              <Link
                href="/schedule"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-foreground rounded-lg border border-border transition"
              >
                Jadwalkan Sesi Baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {displayItems.slice(0, 4).map((sess) => (
                <div
                  key={sess.sessionId}
                  className="flex flex-col justify-between p-3 rounded-lg border border-border bg-surface-2/40 hover:bg-surface-2/80 transition group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                        <Clock className="h-3 w-3" />
                        {sess.startTimeFormatted} – {sess.endTimeFormatted} WIB
                      </span>
                      <span className="text-[10px] font-medium text-muted uppercase">
                        {sess.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground line-clamp-1">
                      {sess.sessionTitle}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-muted">
                      <span>Pelatih: {sess.coachName}</span>
                      {sess.affectedAthleteNames.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted/70" />
                          {sess.affectedAthleteNames.length} Atlet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted truncate max-w-[120px]">
                      {sess.affectedAthleteNames.slice(0, 2).join(", ")}
                      {sess.affectedAthleteNames.length > 2 ? ` +${sess.affectedAthleteNames.length - 2}` : ""}
                    </span>
                    <Link
                      href={sess.ctaUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Eksekusi</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
        <span>Eksekusi latihan lapangan tercatat otomatis ke log harian</span>
        <Link href="/schedule" className="font-semibold text-accent hover:underline">
          Kalender Latihan →
        </Link>
      </div>
    </Card>
  );
}
