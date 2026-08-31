"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleAgendaView, type ScheduleSessionItem } from "./schedule-agenda-view";
import { ScheduleCalendarView } from "./schedule-calendar-view";
import { ScheduleWeeklyMatrixView } from "./schedule-weekly-matrix-view";
import type { CoachOption, AthleteOption } from "./schedule-dialog-form";
import { Calendar as CalendarIcon, ListFilter, LayoutGrid } from "lucide-react";

interface ScheduleContainerProps {
  sessions: ScheduleSessionItem[];
  coaches: CoachOption[];
  athletes: AthleteOption[];
  currentDateFilter?: string;
  currentCoachFilter?: string;
  currentStatusFilter?: string;
}

export function ScheduleContainer({
  sessions,
  coaches,
  athletes,
  currentDateFilter,
  currentCoachFilter,
  currentStatusFilter,
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
    <div className="space-y-6">
      {/* 3-Way View Switcher Tab (Calendar / Timetable / Agenda) */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 border border-border">
          <button
            type="button"
            onClick={() => handleViewChange("timetable")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeView === "timetable"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface-3"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Timetable Matrix
          </button>

          <button
            type="button"
            onClick={() => handleViewChange("calendar")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeView === "calendar"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface-3"
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Calendar View
          </button>

          <button
            type="button"
            onClick={() => handleViewChange("agenda")}
            className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
              activeView === "agenda"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface-3"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            Agenda View
          </button>
        </div>

        <span className="text-xs text-muted font-medium">
          Total Sesi: <strong className="text-foreground font-semibold">{sessions.length}</strong>
        </span>
      </div>

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
