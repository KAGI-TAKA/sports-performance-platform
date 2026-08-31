import { Users, Calendar, ClipboardCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "../types";

interface DashboardStatGridProps {
  stats: DashboardStats | null;
  isUnavailable?: boolean;
}

export function DashboardStatGrid({ stats, isUnavailable = false }: DashboardStatGridProps) {
  if (!stats || isUnavailable) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
        {["Total Atlet Binaan", "Sesi Hari Ini", "Asesmen Bulan Ini", "Rata-rata Skor"].map((title) => (
          <Card key={title} className="border border-border bg-surface-1 shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-muted block">{title}</span>
              <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2 block">
                Data Tidak Tersedia
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
              {stats.upcomingSessions?.length ?? 0} jadwal
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
            <span className="text-[11px] text-muted">
              {stats.latestAssessments?.length ?? 0} tercatat
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Rata-rata Skor Fisik */}
      <Card className="border border-border bg-surface-1 shadow-2xs hover:border-border-strong transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">
              Rata-rata Skor Fisik
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-secondary">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {stats.avgScore !== null ? `${stats.avgScore}%` : "—"}
            </span>
            <span
              className={`text-[11px] font-medium ${
                (stats.avgScore ?? 0) >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : (stats.avgScore ?? 0) >= 60
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted"
              }`}
            >
              {(stats.avgScore ?? 0) >= 80 ? "Sangat Baik" : (stats.avgScore ?? 0) >= 60 ? "Cukup" : "Baseline"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
