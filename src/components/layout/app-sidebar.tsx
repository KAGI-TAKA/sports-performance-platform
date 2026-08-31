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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
      { href: "/schedule", label: "Jadwal & Timetable", icon: Calendar },
      { href: "/athletes", label: "Direktori Atlet", icon: Users },
    ],
  },
  {
    title: "Coaching",
    items: [
      { href: "/training-plans", label: "Program Latihan", icon: Dumbbell },
      { href: "/session-logs", label: "Catatan Sesi", icon: ClipboardCheck },
      { href: "/assessments", label: "Assessment Fisik", icon: ClipboardList },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/progress", label: "Analisis Progres", icon: TrendingUp },
      { href: "/compare", label: "Komparasi Atlet", icon: GitCompare },
      { href: "/reports", label: "Laporan & Ekspor", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/benchmarks", label: "Master Benchmark", icon: SlidersHorizontal },
      { href: "/settings", label: "Pengaturan & Staf", icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  className?: string;
}

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
  className,
}: AppSidebarProps) {
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
        "flex h-full flex-col border-r border-border bg-surface-1 select-none transition-all duration-200 ease-in-out",
        collapsed ? "w-[64px]" : "w-[220px]",
        className
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border px-3.5",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-1"
          title="Coach Zulfi Athletic Performance Hub"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-2xs font-bold text-xs">
            <Zap className="h-4 w-4 fill-white text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block font-display text-[11.5px] font-extrabold tracking-wider text-foreground uppercase leading-none truncate group-hover:text-accent transition-colors">
                COACH ZULFI
              </span>
              <span className="block text-[9px] text-accent font-semibold leading-tight mt-0.5 truncate tracking-wide">
                Performance Hub
              </span>
            </div>
          )}
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

      {/* Navigation Groups */}
      <nav
        aria-label="Navigasi Utama"
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <div className="px-2.5 text-[9.5px] font-bold uppercase tracking-wider text-muted/80 mb-1.5">
                {group.title}
              </div>
            ) : (
              <div className="my-1.5 border-t border-border/50" />
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      aria-label={item.label}
                      title={collapsed ? `${item.label} (${group.title})` : undefined}
                      className={cn(
                        "group relative flex items-center rounded-lg transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-accent",
                        collapsed
                          ? "h-10 w-10 mx-auto justify-center"
                          : "h-9 px-2.5 gap-2.5 text-xs font-medium",
                        active
                          ? "bg-accent text-white font-semibold shadow-2xs"
                          : "text-secondary hover:bg-surface-2 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-white"
                            : "text-muted group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate text-xs">{item.label}</span>
                      )}
                      {active && collapsed && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer & Collapse Trigger */}
      <div className="border-t border-border p-2 bg-surface-2/30">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex w-full items-center rounded-lg p-2 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-2 transition-colors",
              collapsed ? "justify-center" : "justify-between"
            )}
            title={collapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          >
            {!collapsed && (
              <span className="text-[11px] text-muted truncate">Perkecil Menu</span>
            )}
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-muted hover:text-foreground" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-muted" />
            )}
          </button>
        )}

        {!collapsed && (
          <div className="mt-2 px-2 pt-2 border-t border-border/40 text-[10px] text-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Sistem Aktif
            </span>
            <span className="font-mono text-[9px] opacity-75">v1.2</span>
          </div>
        )}
      </div>
    </aside>
  );
}
