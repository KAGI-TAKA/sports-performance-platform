"use client";

import {
  Home,
  TrendingUp,
  Dumbbell,
  Trophy,
  MoreHorizontal,
} from "lucide-react";
import type { YapTab } from "./yap-sidebar";

interface YapBottomNavProps {
  activeTab: YapTab;
  onSelectTab: (tab: YapTab) => void;
}

export function YapBottomNav({ activeTab, onSelectTab }: YapBottomNavProps) {
  const navItems: { id: YapTab; label: string; isForeign?: boolean; icon: React.ElementType }[] = [
    { id: "home", label: "Home", isForeign: true, icon: Home },
    { id: "progress", label: "Progress", isForeign: true, icon: TrendingUp },
    { id: "train", label: "Train", isForeign: true, icon: Dumbbell },
    { id: "pb", label: "PB Hub", isForeign: true, icon: Trophy },
    { id: "more", label: "More", isForeign: true, icon: MoreHorizontal },
  ];

  return (
    <nav
      aria-label="Navigasi Atlet YAP"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-800/90 bg-[#080F1E]/95 backdrop-blur-lg px-2 lg:hidden shadow-2xl select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-1 flex-col items-center justify-center py-2 min-h-[48px] transition-all focus:outline-none ${
              isActive ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-blue-600/20 text-sky-400" : ""}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${item.isForeign ? "italic" : ""}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
