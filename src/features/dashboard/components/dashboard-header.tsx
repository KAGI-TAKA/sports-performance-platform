import Link from "next/link";
import { Plus, Calendar, Activity } from "lucide-react";

interface DashboardHeaderProps {
  orgName?: string;
}

export function DashboardHeader({ orgName }: DashboardHeaderProps) {
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border select-none">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-bold text-foreground tracking-tight sm:text-xl">
            Command Center
          </h1>
          {orgName && (
            <span className="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-secondary border border-border">
              {orgName}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {todayFormatted} · Pusat komando agenda kepelatihan, pemantauan fisik, dan aksi operasional hari ini.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface-2 transition shadow-2xs"
        >
          <Calendar className="h-3.5 w-3.5 text-muted" />
          <span>Jadwal & Timetable</span>
        </Link>
        <Link
          href="/assessments/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <Activity className="h-3.5 w-3.5" />
          <span>Asesmen Baru</span>
        </Link>
      </div>
    </div>
  );
}
