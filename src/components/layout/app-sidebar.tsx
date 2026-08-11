"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  SlidersHorizontal,
  TrendingUp,
  GitCompare,
  FileText,
  Settings,
  Activity,
  Calendar,
  Dumbbell,
  ClipboardCheck,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Jadwal Latihan", icon: Calendar },
  { href: "/training-plans", label: "Program Latihan", icon: Dumbbell },
  { href: "/session-logs", label: "Catatan Sesi", icon: ClipboardCheck },
  { href: "/athletes", label: "Atlet", icon: Users },
  { href: "/assessments/new", label: "Assessment", icon: ClipboardList },
  { href: "/benchmarks", label: "Benchmark", icon: SlidersHorizontal },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/compare", label: "Komparasi", icon: GitCompare },
  { href: "/reports", label: "Laporan", icon: FileText },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 flex flex-col min-h-screen border-r border-border bg-surface-1">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))" }}
        >
          <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
        </div>
        <div className="overflow-hidden">
          <span className="block font-display text-[12px] font-extrabold tracking-wider text-foreground uppercase leading-none truncate">
            POWER UP
          </span>
          <span className="block text-[9px] text-accent font-semibold leading-tight mt-0.5 truncate">
            Private Training
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-secondary hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-accent" : "text-muted group-hover:text-secondary"
                }`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-[11px] text-muted">Measure. Analyze. Improve.</p>
        <p className="text-[10px] text-muted/60 mt-0.5">v1.0 · Kinetiq</p>
      </div>
    </aside>
  );
}
