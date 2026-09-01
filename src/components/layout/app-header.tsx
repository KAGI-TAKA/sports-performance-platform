"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  LogOut,
  ChevronRight,
  Menu,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getBreadcrumbTitle } from "@/lib/navigation";

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
  orgName?: string;
  role?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobile?: () => void;
  onOpenCommandPalette?: () => void;
}

export function AppHeader({
  userName,
  orgName,
  role,
  collapsed = false,
  onToggleCollapse,
  onOpenMobile,
  onOpenCommandPalette,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Build readable breadcrumbs from pathname using centralized resolver
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments
    .map((seg) => {
      if (/^[0-9a-f-]{20,}$/i.test(seg) || /^[c-z0-9]{24,}$/i.test(seg)) return null;
      return getBreadcrumbTitle(seg);
    })
    .filter(Boolean) as string[];

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CZ";

  const isAssistant = (role || "").toLowerCase() === "assistant_coach";
  const roleLabel = isAssistant ? "Assistant Coach" : "Owner / Head Coach";

  // Contextual Primary Action
  const getContextualAction = () => {
    if (pathname === "/athletes") {
      return (
        <Link
          href="/athletes/new"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Atlet</span>
        </Link>
      );
    }
    if (pathname === "/assessments") {
      return (
        <Link
          href="/assessments/new"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90 transition shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Asesmen Baru</span>
        </Link>
      );
    }
    return null;
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4 sm:px-6 gap-3 select-none">
      {/* Left: Collapse Toggle + Mobile Trigger + Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-secondary hover:text-foreground lg:hidden focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-1 text-muted hover:text-foreground hover:bg-surface-2 transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
            title={collapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
          <span className="font-medium text-secondary">Coach Zulfi Hub</span>
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

      {/* Right: Contextual Action + Quick Search (Command Palette Trigger) + Profile + Logout */}
      <div className="flex items-center gap-2.5 ml-auto">
        {getContextualAction()}

        {/* Quick Search Button (Triggers Global Command Palette) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenCommandPalette) {
              onOpenCommandPalette();
            } else {
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  ctrlKey: true,
                  bubbles: true,
                })
              );
            }
          }}
          className="flex h-8 w-36 sm:w-56 items-center justify-between rounded-lg border border-border bg-surface-2/70 px-2.5 text-xs text-muted hover:bg-surface-2 hover:text-foreground hover:border-accent/40 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/40"
          title="Buka Command Palette (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate text-[11px] font-normal">Cari apa saja…</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-surface-1 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted shadow-2xs">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-border pl-2.5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-foreground leading-tight">
              {userName ?? "Coach Zulfi"}
            </div>
            <div className="text-[10px] text-accent font-semibold leading-tight">
              {roleLabel}
            </div>
          </div>

          <Avatar fallback={initials} size="sm" alt={userName ?? "Coach Zulfi"} />

          <button
            onClick={handleSignOut}
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
