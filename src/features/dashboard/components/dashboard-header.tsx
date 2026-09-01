import Link from "next/link";
import { Plus, Calendar, Activity, BookOpen } from "lucide-react";

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
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border select-none">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Command Center
          </h1>
          {orgName && (
            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {orgName}
            </span>
          )}
          <span className="text-[11px] font-medium text-muted">
            · {todayFormatted}
          </span>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Pusat komando pembinaan fisik terstruktur — <em>Youth Athletic Development &amp; Strength &amp; Conditioning</em>.
        </p>
        <p className="text-[11px] text-muted italic">
          &ldquo;Every Athlete Has Different Needs. Build the Athlete Before Chasing Performance.&rdquo;
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface-2 transition shadow-2xs"
        >
          <Calendar className="h-3.5 w-3.5 text-muted" />
          <span>Jadwal Sesi</span>
        </Link>
        <Link
          href="/training-plans"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface-2 transition shadow-2xs"
        >
          <BookOpen className="h-3.5 w-3.5 text-muted" />
          <span>Program Latihan</span>
        </Link>
        <Link
          href="/assessments/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <Activity className="h-3.5 w-3.5" />
          <span>Asesmen Baru</span>
        </Link>
      </div>
    </div>
  );
}
