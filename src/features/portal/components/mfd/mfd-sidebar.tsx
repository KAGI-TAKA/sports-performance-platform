"use client";

import Link from "next/link";
import {
  Home,
  Target,
  Sparkles,
  Award,
  User,
  LogOut,
  Flame,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { APP_CONFIG } from "@/lib/constants";

export type MfdTab = "home" | "missions" | "progress" | "badges" | "profile";

interface MfdSidebarProps {
  activeTab: MfdTab;
  onSelectTab: (tab: MfdTab) => void;
  athleteName: string;
  sportCategory?: string | null;
  photoUrl?: string | null;
  age?: number | null;
  level: number;
  streakDays: number;
}

export function MfdSidebar({
  activeTab,
  onSelectTab,
  athleteName,
  sportCategory,
  photoUrl,
  age,
  level,
  streakDays,
}: MfdSidebarProps) {
  const initials = athleteName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navItems: { id: MfdTab; label: string; subLabel: string; isForeign?: boolean; icon: React.ElementType; color: string }[] = [
    { id: "home", label: "Home", subLabel: "Beranda Seru", isForeign: true, icon: Home, color: "text-amber-400" },
    { id: "missions", label: "Misi", subLabel: "Tantangan & Sesi", icon: Target, color: "text-sky-400" },
    { id: "progress", label: "Gerak", subLabel: "Skill & Kemampuan", icon: Sparkles, color: "text-emerald-400" },
    { id: "badges", label: "Medali", subLabel: "Koleksi Prestasi", icon: Award, color: "text-purple-400" },
    { id: "profile", label: "Paspor", subLabel: "Profil Saya", icon: User, color: "text-rose-400" },
  ];

  return (
    <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-blue-100/30 dark:border-slate-800/80 bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white min-h-screen p-5 select-none shrink-0 sticky top-0 h-screen overflow-y-auto shadow-2xl">
      {/* Top Branding */}
      <div className="space-y-6">
        <div className="flex items-center gap-3.5 px-2 pt-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 ring-2 ring-amber-300/40">
            <Zap className="h-6 w-6 fill-white" />
          </div>
          <div>
            <div className="font-black text-sm tracking-wide text-white uppercase font-display">
              {APP_CONFIG.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                MFD <span className="italic">KIDS</span> (6–12 TAHUN)
              </span>
            </div>
          </div>
        </div>

        {/* Level & Streak Quick Badge */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-black text-amber-300 text-xs shadow-inner">
              ⭐ <span className="italic">Lv.</span>{level}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-200">Level Juara</div>
              <div className="text-[9px] text-amber-300 font-semibold italic">Movement Hero</div>
            </div>
          </div>
          {streakDays > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black">
              <Flame className="h-3.5 w-3.5 fill-orange-400 animate-pulse" />
              <span>{streakDays} Hari <span className="italic">Streak</span></span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-white/20 scale-[1.02]"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/20 text-white shadow-inner"
                      : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : item.color}`} />
                </div>
                <div>
                  <div className={`text-xs font-extrabold tracking-wide ${item.isForeign ? "italic" : ""}`}>{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal group-hover:text-slate-300">
                    {item.subLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Athlete Info Card */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Avatar
            src={photoUrl ?? undefined}
            fallback={initials}
            size="md"
            alt={athleteName}
            className="ring-2 ring-amber-400/50"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-white truncate">
              {athleteName}
            </div>
            <div className="text-[10px] text-blue-200 truncate font-semibold">
              <span className="italic">{sportCategory ?? "Multi-Sport Development"}</span>{age ? ` · ${age} Tahun` : ""}
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all border border-transparent hover:border-rose-500/30"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar <span className="italic">Portal</span></span>
        </Link>
      </div>
    </aside>
  );
}
