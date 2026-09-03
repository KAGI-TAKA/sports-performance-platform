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

  const isAssistantCoach = userRole === "assistant_coach";
  const canManagePlanning = userRole === "admin" || userRole === "head_coach";

  const rawView = searchParams.get("view");

  // Determine active view based on period context
  let activeView: "calendar" | "agenda" | "timetable" = "agenda";
  if (activeQuickFilter === "today") {
    activeView = "agenda";
  } else if (activeQuickFilter === "week") {
    activeView = rawView === "timetable" ? "timetable" : "agenda";
  } else {
    // "mine" or "all"
    activeView =
      rawView === "calendar"
        ? "calendar"
        : rawView === "timetable" && canManagePlanning
        ? "timetable"
        : "agenda";
  }

  function handleViewChange(newView: "calendar" | "agenda" | "timetable") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`/schedule?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* ── ROW 1: SESSION SCOPE TOOLBAR ([ Hari Ini ] [ 7 Hari ] [ Semua Jadwal Saya ]) ── */}
      <ScheduleQuickFilterBar
        activeFilter={activeQuickFilter}
        userRole={userRole}
        defaultScope={defaultScope}
      />

      {/* ── ROW 2: CONTEXTUAL VIEW SWITCHER + COUNTER ── */}
      <div className="flex items-center justify-between gap-3 pt-1 pb-2 border-b border-border/70">
        {/* Contextual View Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1 border border-border">
          {activeQuickFilter === "today" ? (
            <div className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold bg-accent text-white shadow-xs">
              <ListFilter className="h-3.5 w-3.5" />
              <span>Agenda Hari Ini</span>
            </div>
          ) : activeQuickFilter === "week" ? (
            <>
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
                <span>Daftar Agenda</span>
              </button>

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
                <span>Matriks Mingguan</span>
              </button>
            </>
          ) : (
            <>
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
                <span>Daftar Agenda</span>
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
                <span>Kalender Bulanan</span>
              </button>

              {canManagePlanning && (
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
                  <span>Matriks Mingguan</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Counter Summary Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary font-medium bg-surface-2 px-3 py-1.5 rounded-xl border border-border">
            {isAssistantCoach ? "Sesi Saya: " : "Total Sesi: "}
            <strong className="text-foreground font-bold">{sessions.length}</strong>
          </span>
        </div>
      </div>

      {/* ── ROW 3: CONTENT VIEW ── */}
      {activeView === "timetable" ? (
        <ScheduleWeeklyMatrixView
          sessions={sessions}
          coaches={coaches}
          athletes={athletes}
          userRole={userRole}
        />
      ) : activeView === "calendar" ? (
        <ScheduleCalendarView
          sessions={sessions}
          coaches={coaches}
          athletes={athletes}
          currentDateFilter={currentDateFilter}
          currentCoachFilter={currentCoachFilter}
          currentStatusFilter={currentStatusFilter}
          userRole={userRole}
        />
      ) : (
        <ScheduleAgendaView
          sessions={sessions}
          coaches={coaches}
          athletes={athletes}
          currentDateFilter={currentDateFilter}
          currentCoachFilter={currentCoachFilter}
          currentStatusFilter={currentStatusFilter}
          userRole={userRole}
        />
      )}
    </div>
  );
}
