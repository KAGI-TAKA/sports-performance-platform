import Link from "next/link";
import { Plus, ClipboardCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            Dashboard Operasional
          </h1>
          {orgName && (
            <span className="hidden md:inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-secondary border border-border">
              {orgName}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {todayFormatted} · Ringkasan agenda harian dan statistik fisik skuad.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/schedule">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Jadwal</span> Latihan
          </Button>
        </Link>
        <Link href="/assessments/new">
          <Button variant="default" size="sm" className="gap-1.5 text-xs bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-3.5 w-3.5" />
            <ClipboardCheck className="h-3.5 w-3.5" />
            Assessment Baru
          </Button>
        </Link>
      </div>
    </div>
  );
}
