import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardStats } from "../types";

interface UpcomingSessionsCardProps {
  sessions: DashboardStats["upcomingSessions"];
}

const statusBadgeConfig = {
  SCHEDULED: { label: "Terjadwal", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Selesai", className: "bg-slate-100 text-slate-700 border-slate-200" },
  CANCELLED: { label: "Dibatalkan", className: "bg-rose-50 text-rose-700 border-rose-200" },
  NO_SHOW: { label: "Absen", className: "bg-amber-50 text-amber-700 border-amber-200" },
} as const;

export function UpcomingSessionsCard({ sessions }: UpcomingSessionsCardProps) {
  return (
    <Card className="h-full flex flex-col border border-border bg-surface-1 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Agenda Sesi Latihan Mendatang
          </CardTitle>
        </div>
        <Link
          href="/schedule"
          className="flex items-center gap-1 text-xs text-muted hover:text-accent font-medium transition-colors"
        >
          Semua Jadwal
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-between">
        {sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Tidak Ada Sesi Terjadwal"
            description="Belum ada sesi latihan yang dijadwalkan untuk hari ini atau mendatang."
            action={
              <Link
                href="/schedule"
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition-colors shadow-2xs"
              >
                + Buat Sesi Latihan
              </Link>
            }
            className="border-0 bg-transparent py-8"
          />
        ) : (
          <div className="divide-y divide-border/60">
            {sessions.map((s) => {
              const startStr = new Date(s.startTime).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = new Date(s.startTime).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });
              const badge = statusBadgeConfig[s.status as keyof typeof statusBadgeConfig] ?? statusBadgeConfig.SCHEDULED;

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3.5 hover:bg-surface-2/40 transition-colors"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {s.title}
                      </span>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-muted/70" />
                        {dateStr}, {startStr} WIB
                      </span>
                      {s.location && (
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="h-3 w-3 text-muted/70" />
                          {s.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted/70" />
                        {s.athleteCount} Atlet
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/schedule`}
                    className="shrink-0 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    Buka Sesi
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
