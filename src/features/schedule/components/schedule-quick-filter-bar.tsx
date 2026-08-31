"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Users, User, Calendar, CalendarDays } from "lucide-react";
import type { ActiveQuickFilter, ScheduleScope } from "../quick-filter-engine";

interface ScheduleQuickFilterBarProps {
  activeFilter: ActiveQuickFilter;
  userRole?: string;
  defaultScope?: ScheduleScope;
}

export function ScheduleQuickFilterBar({
  activeFilter,
  userRole = "head_coach",
  defaultScope = "all",
}: ScheduleQuickFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilterClick(targetFilter: ActiveQuickFilter) {
    const params = new URLSearchParams(searchParams.toString());

    // Clean up specific date filter when switching quick filter modes
    params.delete("date");

    switch (targetFilter) {
      case "all":
        params.set("scope", "all");
        params.set("period", "all");
        params.delete("coachId");
        break;
      case "mine":
        params.set("scope", "mine");
        params.set("period", "all");
        params.delete("coachId");
        break;
      case "today":
        params.set("period", "today");
        break;
      case "week":
        params.set("period", "week");
        break;
    }

    router.push(`/schedule?${params.toString()}`);
  }

  const isAssistant = defaultScope === "mine";

  const filters: {
    key: ActiveQuickFilter;
    label: string;
    sublabel?: string;
    icon: React.ElementType;
  }[] = [
    {
      key: "all",
      label: "Semua Sesi",
      icon: Users,
    },
    {
      key: "mine",
      label: isAssistant ? "Jadwal Saya" : "Sesi Saya",
      icon: User,
    },
    {
      key: "today",
      label: "Hari Ini",
      icon: Calendar,
    },
    {
      key: "week",
      label: "7 Hari (Minggu Ini)",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-1 -mb-1 no-scrollbar">
      <div
        role="group"
        aria-label="Filter Cepat Jadwal"
        className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-max sm:w-auto min-w-full sm:min-w-0"
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const Icon = f.icon;

          return (
            <button
              key={f.key}
              type="button"
              onClick={() => handleFilterClick(f.key)}
              aria-pressed={isActive}
              className={`flex-1 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 select-none shrink-0 ${
                isActive
                  ? "bg-white text-indigo-700 shadow-2xs border border-slate-200/90 ring-1 ring-indigo-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
