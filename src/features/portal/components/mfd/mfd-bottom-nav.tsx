"use client";

import {
  Home,
  Calendar,
  Sparkles,
  Target,
  Award,
  User,
} from "lucide-react";
import type { MfdTab } from "./mfd-sidebar";

interface MfdBottomNavProps {
  activeTab: MfdTab;
  onSelectTab: (tab: MfdTab) => void;
}

export function MfdBottomNav({ activeTab, onSelectTab }: MfdBottomNavProps) {
  const navItems: { id: MfdTab; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "schedule", label: "Jadwal", icon: Calendar },
    { id: "progress", label: "Skill", icon: Sparkles },
    { id: "missions", label: "Misi", icon: Target },
    { id: "badges", label: "Medali", icon: Award },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <nav
      aria-label="Navigasi Atlet MFD"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-20 w-full items-center justify-around border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-xl px-2 md:hidden shadow-2xl select-none pb-2"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-all focus:outline-none ${
              isActive
                ? "text-blue-600 dark:text-sky-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <div
              className={`p-2 rounded-2xl transition-all ${
                isActive
                  ? "bg-blue-600/15 dark:bg-sky-400/20 text-blue-600 dark:text-sky-400 shadow-sm"
                  : "bg-transparent"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

