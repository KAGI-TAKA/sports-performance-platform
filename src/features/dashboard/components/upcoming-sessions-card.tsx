import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardStats } from "../types";

interface UpcomingSessionsCardProps {
  sessions: DashboardStats["upcomingSessions"];
}

const statusVariant = {
  SCHEDULED: "accent",
  COMPLETED: "success",
  CANCELLED: "danger",
  NO_SHOW: "warning",
} as const;

const statusLabel = {
  SCHEDULED: "Terjadwal",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  NO_SHOW: "Absen",
} as const;

export function UpcomingSessionsCard({ sessions }: UpcomingSessionsCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold">Jadwal Sesi Operasional</CardTitle>
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
                className="inline-flex items-center gap-1 rounded-md bg-accent-bg px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
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

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 hover:bg-surface-2/40 transition-colors"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {s.title}
                      </span>
                      <Badge variant={statusVariant[s.status]} className="text-[9.5px]">
                        {statusLabel[s.status]}
                      </Badge>
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
                    href={`/schedule?id=${s.id}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:text-accent hover:bg-accent-bg transition-colors"
                    title="Lihat Detail Sesi"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
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
