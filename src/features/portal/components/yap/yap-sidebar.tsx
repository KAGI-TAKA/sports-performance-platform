"use client";

import Link from "next/link";
import {
  Home,
  TrendingUp,
  Dumbbell,
  Trophy,
  LogOut,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { APP_CONFIG } from "@/lib/constants";

export type YapTab = "home" | "progress" | "train" | "pb";

interface YapSidebarProps {
  activeTab: YapTab;
  onSelectTab: (tab: YapTab) => void;
  athleteName: string;
  sportCategory?: string | null;
  photoUrl?: string | null;
  age?: number | null;
}

export function YapSidebar({
  activeTab,
  onSelectTab,
  athleteName,
  sportCategory,
  photoUrl,
  age,
}: YapSidebarProps) {
  const initials = athleteName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navItems: {
    id: YapTab;
    label: string;
    subLabel: string;
    isForeign?: boolean;
    icon: React.ElementType;
  }[] = [
    { id: "home", label: "Beranda", subLabel: "Overview", icon: Home },
    { id: "progress", label: "Progres Fisik", subLabel: "Analisis 7 Komponen", icon: TrendingUp },
    { id: "train", label: "Program Latihan", subLabel: "Drills & Jadwal", icon: Dumbbell },
    { id: "pb", label: "PB Hub", subLabel: "Rekor & Target", isForeign: true, icon: Trophy },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-800/80 bg-[#060D1F] text-slate-100 min-h-screen p-5 select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Top Branding */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-1 pt-1 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <div className="font-display text-xs font-black tracking-wider text-white uppercase leading-tight">
                {APP_CONFIG.name}
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                ATHLETIC PERFORMANCE HUB
              </div>
            </div>
          </div>

          {/* YAP Blue Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-sky-400 text-[10px] font-bold">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>YAP · <span className="italic">Youth Athletic Performance (13–18+)</span></span>
          </div>
        </div>

        {/* Navigation Menu (Only 4 Core Athlete Tabs) */}
        <nav className="space-y-2 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className={item.isForeign ? "italic" : ""}>{item.label}</span>
                </div>
                <span className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                  {item.subLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Athlete Profile & Coach Motivation */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {/* Personal Athlete Info Card (Personal Space, No Switcher) */}
        <div className="p-3 rounded-xl bg-[#0B1426] border border-slate-800 flex items-center gap-2.5">
          <Avatar
            src={photoUrl ?? undefined}
            fallback={initials}
            size="sm"
            alt={athleteName}
            className="ring-2 ring-blue-500/40"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {athleteName}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              <span className="italic">{sportCategory ?? "Youth Athlete"}</span>
              {age ? ` · ${age}th` : ""}
            </div>
          </div>
        </div>

        {/* Coach Zulfi Motivation Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0B172E] to-[#080F1E] border border-blue-500/20 text-white space-y-1.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-sm shrink-0">
              👨‍🏫
            </div>
            <div className="text-[10px] text-slate-300 italic leading-relaxed">
              &quot;Your potential is limitless. Keep showing up, keep improving.&quot;
            </div>
          </div>
          <div className="text-[10px] text-sky-400 font-bold text-right">
            — Coach Zulfi
          </div>
        </div>

        {/* Logout Link */}
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar <span className="italic">Portal</span></span>
        </Link>
      </div>
    </aside>
  );
}
