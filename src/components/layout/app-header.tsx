"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, LogOut, ChevronRight, Menu } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  schedule: "Jadwal Latihan",
  "training-plans": "Program Latihan",
  "session-logs": "Catatan Sesi",
  athletes: "Atlet",
  assessments: "Assessment",
  benchmarks: "Benchmark",
  progress: "Progress",
  compare: "Komparasi",
  reports: "Laporan",
  settings: "Pengaturan",
  new: "Tambah Baru",
  edit: "Edit Data",
};

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
  orgName?: string;
  onOpenMobile?: () => void;
}

export function AppHeader({
  userName,
  orgName,
  onOpenMobile,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Build readable breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments
    .map((seg) => {
      if (/^[0-9a-f-]{20,}$/i.test(seg) || /^[c-z0-9]{24,}$/i.test(seg)) return null;
      return BREADCRUMB_MAP[seg] ?? seg;
    })
    .filter(Boolean) as string[];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/athletes?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "C";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4 sm:px-6 gap-3 select-none">
      {/* Left: Mobile Menu Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-2 text-secondary hover:text-foreground lg:hidden focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
          <span className="font-medium text-secondary">Platform</span>
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-muted/60" />
              <span
                className={
                  i === crumbs.length - 1
                    ? "text-foreground font-semibold"
                    : "text-secondary"
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: Search + Profile + Logout */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Quick Search */}
        <form onSubmit={handleSearch} className="relative w-36 sm:w-56">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari atlet…"
            className="w-full rounded-md border border-border bg-surface-2 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
        </form>

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-border/60 pl-3">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-foreground leading-tight">
              {userName ?? "Coach"}
            </div>
            {orgName && (
              <div className="text-[10px] text-muted leading-tight truncate max-w-[120px]">
                {orgName}
              </div>
            )}
          </div>

          <Avatar fallback={initials} size="sm" alt={userName ?? "Coach"} />

          <button
            onClick={handleSignOut}
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger-bg transition-colors focus:outline-none focus:ring-2 focus:ring-danger"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
