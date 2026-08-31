import { Users, Calendar, ClipboardCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "../types";

interface DashboardStatGridProps {
  stats: DashboardStats;
}

export function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* 1. Total Atlet */}
      <Card className="border border-border bg-surface-1 shadow-2xs hover:border-border-strong transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">
              Total Atlet Binaan
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-secondary">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {stats.totalAthletes}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Aktif</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Sesi Hari Ini */}
      <Card className="border border-border bg-surface-1 shadow-2xs hover:border-border-strong transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">
              Sesi Hari Ini
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-secondary">
              <Calendar className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {stats.todaySessionsCount}
            </span>
            <span className="text-[11px] text-muted">
              {stats.upcomingSessions.length} jadwal
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Assessment Bulan Ini */}
      <Card className="border border-border bg-surface-1 shadow-2xs hover:border-border-strong transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">
              Asesmen Bulan Ini
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-secondary">
              <ClipboardCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {stats.assessmentsThisMonth}
            </span>
            <span className="text-[11px] text-muted">tes selesai</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Rata-rata Skor Skuad */}
      <Card className="border border-border bg-surface-1 shadow-2xs hover:border-border-strong transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">
              Rata-rata Skor Skuad
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-secondary">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {stats.avgScore != null ? `${stats.avgScore}%` : "—"}
            </span>
            <span className="text-[11px] text-muted">
              {stats.avgScore != null ? "evaluasi fisik" : "belum ada"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
