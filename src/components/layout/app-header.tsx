"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, LogOut, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  athletes: "Atlet",
  assessments: "Assessment",
  benchmarks: "Benchmark",
  progress: "Progress",
  reports: "Laporan",
  settings: "Pengaturan",
  new: "Baru",
  edit: "Edit",
};

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
  orgName?: string;
}

export function AppHeader({ userName, userEmail, orgName }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Build readable breadcrumb from pathname segments
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg) => {
    // UUID-like segments (dynamic routes) — skip labeling
    if (/^[0-9a-f-]{20,}$/.test(seg)) return null;
    return BREADCRUMB_MAP[seg] ?? seg;
  }).filter(Boolean) as string[];

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

  // User initials for avatar
  const initials = userName
    ? userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-5 gap-4">
      {/* Breadcrumb */}
      <nav className="hidden sm:flex items-center gap-1 text-xs text-muted select-none">
        <span className="font-medium text-secondary">Kinetiq</span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted/50" />
            <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : "text-secondary"}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative w-56 ml-auto">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari atlet…"
          className="w-full rounded-md border border-border bg-surface-2 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition"
        />
      </form>

      {/* User area */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden md:block">
          <div className="text-xs font-semibold text-foreground leading-tight">
            {userName ?? "Coach"}
          </div>
          {orgName && (
            <div className="text-[10px] text-muted leading-tight truncate max-w-[120px]">
              {orgName}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white select-none"
          style={{ background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))" }}
          title={userName}
        >
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          title="Keluar"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger-bg transition"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
