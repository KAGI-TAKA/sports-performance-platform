"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleAgendaView, type ScheduleSessionItem } from "./schedule-agenda-view";
import { ScheduleCalendarView } from "./schedule-calendar-view";
import { ScheduleWeeklyMatrixView } from "./schedule-weekly-matrix-view";
import { ScheduleQuickFilterBar } from "./schedule-quick-filter-bar";
import type { CoachOption, AthleteOption } from "./schedule-dialog-form";
import type { ActiveQuickFilter, ScheduleScope } from "../quick-filter-engine";
import { Calendar as CalendarIcon, ListFilter, LayoutGrid } from "lucide-react";

interface ScheduleContainerProps {
  sessions: ScheduleSessionItem[];
  coaches: CoachOption[];
  athletes: AthleteOption[];
  currentDateFilter?: string;
  currentCoachFilter?: string;
  currentStatusFilter?: string;
  activeQuickFilter?: ActiveQuickFilter;
  userRole?: string;
  defaultScope?: ScheduleScope;
}

export function ScheduleContainer({
  sessions,
  coaches,
  athletes,
  currentDateFilter,
  currentCoachFilter,
  currentStatusFilter,
  activeQuickFilter = "all",
  userRole = "head_coach",
  defaultScope = "all",
}: ScheduleContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const rawView = searchParams.get("view");
  const activeView: "calendar" | "agenda" | "timetable" =
    rawView === "agenda" ? "agenda" : rawView === "timetable" ? "timetable" : "calendar";

  function handleViewChange(newView: "calendar" | "agenda" | "timetable") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* View Switcher & Quick Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-border/80">
        {/* 3-Way View Switcher Tab (Calendar / Timetable / Agenda) */}
        <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1 border border-border w-fit">
          <button
            type="button"
            onClick={() => handleViewChange("timetable")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeView === "timetable"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-3"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Timetable Matrix
          </button>

          <button
            type="button"
            onClick={() => handleViewChange("calendar")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeView === "calendar"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-3"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Calendar View
          </button>

          <button
            type="button"
            onClick={() => handleViewChange("agenda")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeView === "agenda"
                ? "bg-accent text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-3"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            Agenda View
          </button>
        </div>

        {/* Counter Summary Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {defaultScope === "mine" && activeQuickFilter === "mine" ? "Jadwal Saya: " : "Total Sesi: "}
            <strong className="text-indigo-950 font-bold">{sessions.length}</strong> Sesi
          </span>
        </div>
      </div>

      {/* P7-B4 Schedule Quick Filter Bar */}
      <ScheduleQuickFilterBar
        activeFilter={activeQuickFilter}
        userRole={userRole}
        defaultScope={defaultScope}
      />

      {/* Render Selected View */}
      {activeView === "timetable" ? (
        <ScheduleWeeklyMatrixView
          sessions={sessions}
          coaches={coaches}
          athletes={athletes}
        />
      ) : activeView === "calendar" ? (
        <ScheduleCalendarView
          sessions={sessions}
          coaches={coaches}
          athletes={athletes}
          currentDateFilter={currentDateFilter}
          currentCoachFilter={currentCoachFilter}
          currentStatusFilter={currentStatusFilter}
        />
      ) : (
        <ScheduleAgendaView
          sessions={sessions}
          coaches={coaches}
          athletes={athletes}
          currentDateFilter={currentDateFilter}
          currentCoachFilter={currentCoachFilter}
          currentStatusFilter={currentStatusFilter}
        />
      )}
    </div>
  );
}
