import { Users, Calendar, ClipboardCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "../types";

interface DashboardStatGridProps {
  stats: DashboardStats;
}

export function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Atlet */}
      <Card className="hover:border-border-strong transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Total Atlet
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-bg text-accent">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              {stats.totalAthletes}
            </span>
            <Badge variant="accent" className="text-[10px]">
              Aktif
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted">Atlet terdaftar di organisasi</p>
        </CardContent>
      </Card>

      {/* 2. Sesi Hari Ini & Mendatang */}
      <Card className="hover:border-border-strong transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Sesi Hari Ini
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signature-bg text-signature">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              {stats.todaySessionsCount}
            </span>
            <Badge variant="signature" className="text-[10px]">
              {stats.upcomingSessions.length} Mendatang
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted">Jadwal latihan operasional</p>
        </CardContent>
      </Card>

      {/* 3. Assessment Bulan Ini */}
      <Card className="hover:border-border-strong transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Bulan Ini
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-bg text-success">
              <ClipboardCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              {stats.assessmentsThisMonth}
            </span>
            <Badge variant="success" className="text-[10px]">
              Selesai
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted">Pengujian fisik selesai</p>
        </CardContent>
      </Card>

      {/* 4. Rata-rata Skor Skuad */}
      <Card className="hover:border-border-strong transition-colors">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Rata-rata Skuad
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-bg text-warning">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              {stats.avgScore != null ? `${stats.avgScore}%` : "—"}
            </span>
            <Badge variant="warning" className="text-[10px]">
              {stats.avgScore != null ? "Performa" : "Belum Ada Data"}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {stats.topActiveAthlete
              ? `Teraktif: ${stats.topActiveAthlete.fullName} (${stats.topActiveAthlete.count}×)`
              : "Rata-rata kumulatif skor"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
