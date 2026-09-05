"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Calendar,
  Target,
  Sparkles,
  Award,
  User,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export type MfdTab = "home" | "schedule" | "progress" | "missions" | "badges" | "profile";

interface MfdSidebarProps {
  activeTab: MfdTab;
  onSelectTab: (tab: MfdTab) => void;
  athleteName: string;
  sportCategory?: string | null;
  photoUrl?: string | null;
  age?: number | null;
  level: number;
  streakDays: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggle,
}: MfdSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = controlledToggle || (() => setInternalCollapsed(!internalCollapsed));

  const navItems: { id: MfdTab; label: string; subLabel: string; icon: React.ElementType }[] = [
    { id: "home", label: "Beranda", subLabel: "Halaman Utama", icon: Home },
    { id: "schedule", label: "Jadwal", subLabel: "Jadwal Sesi Lapangan", icon: Calendar },
    { id: "progress", label: "Skill", subLabel: "Kemampuan Gerak", icon: Sparkles },
    { id: "missions", label: "Misi", subLabel: "Tantangan Mandiri", icon: Target },
    { id: "badges", label: "Medali", subLabel: "Medali & Lencana", icon: Award },
    { id: "profile", label: "Profil", subLabel: "Identitas & Akun", icon: User },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080F1E] text-slate-800 dark:text-slate-100 min-h-screen select-none shrink-0 sticky top-0 h-screen overflow-y-auto shadow-sm transition-all duration-300 overflow-x-hidden ${
        isCollapsed ? "w-[72px] p-3 items-center" : "w-60 xl:w-64 p-4"
      }`}
    >
      {/* Top Section: Branding & Navigation */}
      <div className={`space-y-4 ${isCollapsed ? "w-full flex flex-col items-center" : ""}`}>
        {/* Brand Header */}
        <div className={`space-y-2 ${isCollapsed ? "flex flex-col items-center" : "px-1 pt-1"}`}>
          <div className="flex items-center justify-between w-full">
            <div className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 shrink-0">
                <Zap className="h-4.5 w-4.5 fill-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 overflow-hidden">
                  <div className="font-display font-black text-[11px] tracking-wide text-blue-900 dark:text-white uppercase leading-tight truncate">
                    Coach Zulfi AP
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase truncate">
                    Athletic Performance Hub
                  </div>
                </div>
              )}
            </div>

            {/* Collapse / Expand Toggle Button */}
            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Toggle button when collapsed */}
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition mt-1"
              title="Perluas Sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* MFD Pill Badge */}
          {!isCollapsed && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-sky-300 text-[10px] font-bold max-w-full overflow-hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shrink-0" />
              <span className="truncate"><span className="font-black">MFD</span> · <span className="italic">Movement & Fundamental Dev.</span></span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={`space-y-1 pt-2 ${isCollapsed ? "w-full flex flex-col items-center" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? `${item.label} — ${item.subLabel}` : undefined}
                className={`flex items-center rounded-xl text-xs font-bold transition-all text-left group ${
                  isCollapsed
                    ? "w-11 h-11 justify-center p-0"
                    : "w-full gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400"
                  }`}
                />
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold tracking-tight truncate">{item.label}</div>
                    <div className={`text-[10px] truncate font-normal ${
                      isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                    }`}>{item.subLabel}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Motivation Card & Logout */}
      <div className={`pt-4 space-y-2.5 ${isCollapsed ? "w-full flex flex-col items-center" : ""}`}>
        {/* Coach Zulfi Motivation Card */}
        {!isCollapsed ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base shadow-inner shrink-0">
                👨‍🏫
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="text-[9px] font-bold text-blue-200 uppercase tracking-wider">
                  Pesan Coach Zulfi
                </div>
                <div className="text-[11px] font-black text-white leading-snug truncate">
                  &quot;Keep moving, have fun!&quot;
                </div>
                <div className="text-[9px] text-blue-200 font-semibold italic mt-0.5">
                  — Coach Zulfi
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-base shadow-md cursor-pointer"
            title="Pesan Coach Zulfi: Keep moving, have fun!"
          >
            👨‍🏫
          </div>
        )}

        {/* Exit Portal Button */}
        <Link
          href="/login"
          title={isCollapsed ? "Keluar Portal" : undefined}
          className={`flex items-center justify-center rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all ${
            isCollapsed ? "w-10 h-10 p-0" : "w-full gap-2 py-2 px-3"
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Keluar Portal</span>}
        </Link>
      </div>
    </aside>
  );
}


