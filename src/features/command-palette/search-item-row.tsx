"use client";

import React from "react";
import {
  Users,
  Calendar,
  Dumbbell,
  ClipboardList,
  Zap,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommandPaletteItem } from "./types";

interface SearchItemRowProps {
  item: CommandPaletteItem;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter?: () => void;
}

export function SearchItemRow({
  item,
  isSelected,
  onSelect,
  onMouseEnter,
}: SearchItemRowProps) {
  const getCategoryIcon = () => {
    if (item.icon) {
      const CustomIcon = item.icon;
      return <CustomIcon className="h-4 w-4 shrink-0 text-accent" />;
    }

    switch (item.category) {
      case "ACTION":
        return <Zap className="h-4 w-4 shrink-0 text-amber-500" />;
      case "ATHLETE":
        return <Users className="h-4 w-4 shrink-0 text-indigo-500" />;
      case "SCHEDULE":
        return <Calendar className="h-4 w-4 shrink-0 text-emerald-500" />;
      case "ASSESSMENT":
        return <ClipboardList className="h-4 w-4 shrink-0 text-rose-500" />;
      case "TRAINING_PLAN":
        return <Dumbbell className="h-4 w-4 shrink-0 text-purple-500" />;
      case "RECENT":
        return <Clock className="h-4 w-4 shrink-0 text-slate-400" />;
      default:
        return <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = () => {
    switch (item.category) {
      case "ACTION":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "ATHLETE":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
      case "SCHEDULE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "ASSESSMENT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      case "TRAINING_PLAN":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-surface-3 text-secondary";
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      id={`command-item-${item.id}`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors select-none text-left",
        isSelected
          ? "bg-accent/10 border-l-2 border-accent text-foreground"
          : "hover:bg-surface-2/70 text-secondary border-l-2 border-transparent"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Category / Entity Icon Container */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/40",
            isSelected ? "bg-accent/15" : "bg-surface-2"
          )}
        >
          {getCategoryIcon()}
        </div>

        {/* Title & Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-xs font-semibold leading-snug",
                isSelected ? "text-foreground font-bold" : "text-foreground"
              )}
            >
              {item.title}
            </span>
            {item.badge && (
              <span className="shrink-0 rounded-sm bg-surface-3 px-1.5 py-0.5 text-[9px] font-medium text-muted">
                {item.badge}
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-muted leading-tight mt-0.5">
            {item.subtitle}
          </p>
        </div>
      </div>

      {/* Right-Side Meta & Action Hint */}
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "hidden sm:inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            getCategoryBadgeClass()
          )}
        >
          {item.categoryLabel}
        </span>
        {isSelected ? (
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-accent">
            ↵ Enter
          </span>
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted/50 group-hover:text-muted" />
        )}
      </div>
    </div>
  );
}
