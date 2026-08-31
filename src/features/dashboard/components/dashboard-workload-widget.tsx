import Link from "next/link";
import { Clock, CheckCircle2, User, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CoachingWorkloadSummary } from "@/features/coaching-intelligence/types";

interface DashboardWorkloadWidgetProps {
  workloadSummary: CoachingWorkloadSummary | null;
  isAssistant: boolean;
  isUnavailable?: boolean;
}

export function DashboardWorkloadWidget({
  workloadSummary,
  isAssistant,
  isUnavailable = false,
}: DashboardWorkloadWidgetProps) {
  if (!workloadSummary || isUnavailable) {
    return (
      <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  {isAssistant ? "Jam Melatih Saya" : "Distribusi Jam Melatih Tim"}
                </CardTitle>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Sementara Tidak Tersedia
            </span>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-2/60 border border-border text-xs text-secondary">
              <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-xs text-foreground">Data Jam Melatih Tidak Dapat Dimuat</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Informasi alokasi dan jam melatih staf pelatih sementara tidak dapat diambil. Silakan muat ulang halaman.
                </p>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
          <span>Jam aktual dihitung murni dari sesi berstatus COMPLETED</span>
          <Link href="/schedule" className="font-semibold text-accent hover:underline">
            Jadwal Lengkap →
          </Link>
        </div>
      </Card>
    );
  }

  const {
    periodLabel,
    totalAssistants,
    totalCompletedSessions,
    totalDeliveredHours,
    totalPlannedSessions,
    totalPlannedHours,
    assistants,
  } = workloadSummary;

  return (
    <Card className="h-full border border-border bg-surface-1 shadow-2xs flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {isAssistant ? "Jam Melatih Saya" : "Distribusi Jam Melatih Tim"}
              </CardTitle>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
            {periodLabel}
          </span>
        </CardHeader>

        <CardContent className="p-3.5 space-y-3">
          {/* Workload Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-lg bg-surface-2/60 border border-border">
            <div>
              <span className="text-[10px] text-muted block">Sesi Terlaksana</span>
              <span className="text-xs font-bold text-foreground">{totalCompletedSessions} Sesi</span>
            </div>
            <div>
              <span className="text-[10px] text-muted block">Jam Aktual (Delivered)</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {totalDeliveredHours} Jam
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted block">Sesi Terjadwal</span>
              <span className="text-xs font-bold text-foreground">{totalPlannedSessions} Sesi</span>
            </div>
            <div>
              <span className="text-[10px] text-muted block">Jam Rencana (Planned)</span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                {totalPlannedHours} Jam
              </span>
            </div>
          </div>

          {/* Assistant List (Managers) or Personal Details (Assistant Coach) */}
          {assistants.length === 0 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-2/40 border border-border text-xs text-muted">
              <CheckCircle2 className="h-4 w-4 text-muted shrink-0" />
              <p className="text-[11px]">Belum ada sesi yang terselesaikan pada periode ini.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                {isAssistant ? "Rangkuman Aktivitas Lapangan" : `Daftar Staf Pelatih (${totalAssistants} Asisten)`}
              </span>

              <div className="divide-y divide-border/60 border border-border rounded-lg overflow-hidden bg-surface-2/30">
                {assistants.map((asst) => (
                  <div
                    key={asst.coachId}
                    className="flex items-center justify-between p-2.5 hover:bg-surface-2/70 transition text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-foreground font-bold text-[11px]">
                        <User className="h-3.5 w-3.5 text-muted" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{asst.coachName}</span>
                        <span className="text-[10px] text-muted">
                          {asst.completedSessions} selesai · {asst.plannedSessions} terjadwal
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          {asst.deliveredHours} Jam
                        </span>
                        <span className="text-[9px] text-muted uppercase">Aktual</span>
                      </div>
                      <div className="border-l border-border pl-3">
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 block">
                          {asst.plannedHours} Jam
                        </span>
                        <span className="text-[9px] text-muted uppercase">Rencana</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-3 border-t border-border/50 bg-surface-2/30 rounded-b-xl flex items-center justify-between text-[11px] text-muted">
        <span>Jam aktual dihitung murni dari sesi berstatus COMPLETED</span>
        <Link href="/schedule" className="font-semibold text-accent hover:underline">
          Jadwal Lengkap →
        </Link>
      </div>
    </Card>
  );
}
