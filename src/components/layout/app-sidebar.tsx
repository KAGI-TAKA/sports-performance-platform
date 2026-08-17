"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  SlidersHorizontal,
  FileText,
  Settings,
  Calendar,
  Dumbbell,
  ClipboardCheck,
  Zap,
  X,
  TrendingUp,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Jadwal Latihan", icon: Calendar },
  { href: "/training-plans", label: "Program Latihan", icon: Dumbbell },
  { href: "/session-logs", label: "Catatan Sesi", icon: ClipboardCheck },
  { href: "/athletes", label: "Atlet", icon: Users },
  { href: "/assessments", label: "Assessment", icon: ClipboardList },
  { href: "/benchmarks", label: "Benchmark", icon: SlidersHorizontal },
  { href: "/reports", label: "Laporan", icon: FileText },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/progress", label: "Progress Analytics", icon: TrendingUp },
  { href: "/compare", label: "Head-to-Head", icon: GitCompare },
];

interface AppSidebarProps {
  onCloseMobile?: () => void;
  className?: string;
}

export function AppSidebar({ onCloseMobile, className }: AppSidebarProps) {
  const pathname = usePathname();

  function isItemActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className={cn(
        "flex h-full w-[230px] shrink-0 flex-col border-r border-border bg-surface-1 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-1"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--signature)))",
            }}
          >
            <Zap className="h-4 w-4 fill-white text-white" />
          </div>
          <div className="overflow-hidden">
            <span className="block font-display text-[12px] font-extrabold tracking-wider text-foreground uppercase leading-none truncate group-hover:text-accent transition-colors">
              POWER UP
            </span>
            <span className="block text-[9.5px] text-accent font-semibold leading-tight mt-0.5 truncate">
              Private Training
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface-2 lg:hidden"
            aria-label="Tutup navigasi"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <nav
        aria-label="Navigasi Utama"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
      >
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
            Menu Utama
          </div>
          <ul className="space-y-0.5">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent",
                      active
                        ? "bg-accent-bg text-accent font-semibold"
                        : "text-secondary hover:bg-surface-2 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active
                          ? "text-accent"
                          : "text-muted group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Secondary / Exploratory Tools */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
            Analisis Tambahan
          </div>
          <ul className="space-y-0.5">
            {SECONDARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-[12.5px] font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent",
                      active
                        ? "bg-surface-2 text-foreground font-semibold"
                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors",
                        active ? "text-accent" : "text-muted group-hover:text-secondary"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-border p-4 bg-surface-2/40">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-[11px] font-medium text-foreground">
            Sistem Aktif
          </span>
        </div>
        <p className="text-[10px] text-muted mt-1 leading-tight">
          Measure. Analyze. Improve.
        </p>
        <p className="text-[9.5px] text-muted/60 mt-0.5">v1.0 · Powered by Kinetiq</p>
      </div>
    </aside>
  );
}
