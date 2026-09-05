"use client";

import Link from "next/link";
import {
  Home,
  TrendingUp,
  Dumbbell,
  Trophy,
  MoreHorizontal,
  LogOut,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { APP_CONFIG } from "@/lib/constants";

export type YapTab = "home" | "progress" | "train" | "pb" | "more";

interface YapSidebarProps {
  activeTab: YapTab;
  onSelectTab: (tab: YapTab) => void;
  athleteName: string;
  sportCategory?: string | null;
  photoUrl?: string | null;
  age?: number | null;
  onOpenAthleteSelector?: () => void;
}

export function YapSidebar({
  activeTab,
  onSelectTab,
  athleteName,
  sportCategory,
  photoUrl,
  age,
  onOpenAthleteSelector,
}: YapSidebarProps) {
  const initials = athleteName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navItems: { id: YapTab; label: string; isForeign?: boolean; icon: React.ElementType }[] = [
    { id: "home", label: "Home", isForeign: true, icon: Home },
    { id: "progress", label: "Progress", isForeign: true, icon: TrendingUp },
    { id: "train", label: "Train", isForeign: true, icon: Dumbbell },
    { id: "pb", label: "PB Hub", isForeign: true, icon: Trophy },
    { id: "more", label: "More", isForeign: true, icon: MoreHorizontal },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-800/80 bg-[#080F1E] text-slate-100 min-h-screen p-5 select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Top Branding */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="font-display text-xs font-extrabold tracking-wider text-white uppercase leading-tight">
              COACH ZULFI
            </div>
            <div className="text-[11px] font-bold tracking-widest text-sky-400 uppercase">
              YAP <span className="italic">PORTAL</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className={item.isForeign ? "italic" : ""}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Athlete Info Card */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div
          onClick={onOpenAthleteSelector}
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 transition ${
            onOpenAthleteSelector ? "cursor-pointer hover:border-sky-500/50 hover:bg-slate-800/70" : ""
          }`}
          title={onOpenAthleteSelector ? "Klik untuk ganti atlet" : undefined}
        >
          <Avatar
            src={photoUrl ?? undefined}
            fallback={initials}
            size="sm"
            alt={athleteName}
            className="ring-2 ring-sky-500/40"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {athleteName}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              <span className="italic">{sportCategory ?? "Youth Performance"}</span>
              {age ? ` · ${age}th` : ""}
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar <span className="italic">Portal</span></span>
        </Link>
      </div>
    </aside>
  );
}
