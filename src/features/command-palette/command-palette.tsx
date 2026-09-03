"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Command, Sparkles, Clock, Trash2 } from "lucide-react";
import { NAV_GROUPS, QUICK_ACTIONS } from "@/lib/navigation";
import { formatDateID, formatTimeID } from "@/lib/date-utils";
import { searchCommandPaletteAction } from "./actions";
import { SearchItemRow } from "./search-item-row";
import type { CommandPaletteItem, RecentCommandItem } from "./types";
import { cn } from "@/lib/utils";

import { isRouteAllowedForRole } from "@/lib/access-policy";

const RECENT_STORAGE_KEY = "kinetiq_recent_commands";
const MAX_RECENT_ITEMS = 3;

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: string;
}

export function CommandPalette({ open: controlledOpen, onOpenChange, role }: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (val: boolean) => {
      if (onOpenChange) {
        onOpenChange(val);
      } else {
        setInternalOpen(val);
      }
    },
    [onOpenChange]
  );

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, startSearchTransition] = useTransition();
  const [serverResults, setServerResults] = useState<{
    athletes: CommandPaletteItem[];
    sessions: CommandPaletteItem[];
    trainingPlans: CommandPaletteItem[];
    assessments: CommandPaletteItem[];
  }>({
    athletes: [],
    sessions: [],
    trainingPlans: [],
    assessments: [],
  });
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<RecentCommandItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent items from localStorage on mount & when palette opens
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentItems(parsed.slice(0, MAX_RECENT_ITEMS));
        }
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, setOpen]);

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setQuery("");
      setSelectedIndex(0);
      setSearchError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isAssistant = (role || "").toLowerCase() === "assistant_coach";

  // Build static navigation and quick action command items
  const staticItems = useMemo<CommandPaletteItem[]>(() => {
    const items: CommandPaletteItem[] = [];

    // Quick Actions
    QUICK_ACTIONS.forEach((qa) => {
      // If Assistant Coach, strictly forbid planning, athlete onboarding, and assessment management
      if (isAssistant) {
        if (
          qa.id === "qa-new-athlete" ||
          qa.id === "qa-new-plan" ||
          qa.id === "qa-new-schedule" ||
          qa.id === "qa-new-assessment" ||
          qa.id === "qa-squad-assessment"
        ) {
          return;
        }
      }

      if (qa.allowedRoles && !qa.allowedRoles.includes(role || "admin")) {
        return;
      }

      items.push({
        id: qa.id,
        category: "ACTION",
        categoryLabel: "Aksi Cepat",
        title: qa.title,
        subtitle: qa.subtitle,
        href: qa.href,
        icon: qa.icon,
        keywords: qa.keywords,
      });
    });

    // If Assistant Coach, add dedicated field execution quick actions
    if (isAssistant) {
      items.push(
        {
          id: "qa-asst-today",
          category: "ACTION",
          categoryLabel: "Aksi Cepat",
          title: "Agenda Sesi Hari Ini",
          subtitle: "Lihat sesi latihan yang ditugaskan kepada Anda hari ini",
          href: "/schedule?view=agenda",
          keywords: ["agenda", "today", "hari ini", "jadwal", "tugas"],
        },
        {
          id: "qa-asst-roster",
          category: "ACTION",
          categoryLabel: "Aksi Cepat",
          title: "Roster Atlet",
          subtitle: "Lihat profil atlet peserta dan riwayat catatan lapangan",
          href: "/athletes",
          keywords: ["atlet", "roster", "pemain", "atlet aktif"],
        },
        {
          id: "qa-asst-logs",
          category: "ACTION",
          categoryLabel: "Aksi Cepat",
          title: "Riwayat Log Sesi Lapangan",
          subtitle: "Pantau catatan evaluasi sesi latihan yang telah disubmit",
          href: "/session-logs",
          keywords: ["log", "riwayat", "history", "evaluasi"],
        }
      );
    }

    // Navigation Pages — Strictly filter by role
    NAV_GROUPS.forEach((g) => {
      g.items.forEach((nav) => {
        if (!isRouteAllowedForRole(role || "admin", nav.href)) {
          return;
        }

        items.push({
          id: `nav-${nav.href}`,
          category: "NAVIGATION",
          categoryLabel: g.title,
          title: nav.label,
          subtitle: nav.description || `Buka halaman ${nav.label}`,
          href: nav.href,
          icon: nav.icon,
          keywords: nav.keywords,
        });
      });
    });

    return items;
  }, [role, isAssistant]);

  // Filter static items on client based on current query
  const filteredStaticItems = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return staticItems;

    return staticItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(clean);
      const matchSubtitle = item.subtitle.toLowerCase().includes(clean);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(clean));
      return matchTitle || matchSubtitle || matchKeywords;
    });
  }, [query, staticItems]);

  // Debounced Server Search Action for Dynamic Entities
  useEffect(() => {
    const clean = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (clean.length < 2) {
      setServerResults({
        athletes: [],
        sessions: [],
        trainingPlans: [],
        assessments: [],
      });
      setSearchError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      startSearchTransition(async () => {
        const res = await searchCommandPaletteAction(clean);
        if (res.success && res.data) {
          setSearchError(null);
          const { athletes, sessions, trainingPlans, assessments } = res.data;

          const athleteItems: CommandPaletteItem[] = athletes.map((a) => ({
            id: `ath-${a.id}`,
            category: "ATHLETE",
            categoryLabel: "Atlet",
            title: a.fullName,
            subtitle: `${a.sportCategory ? `${a.sportCategory} · ` : ""}${a.trainingLevel}${
              a.jerseyNumber != null ? ` · Jersey #${a.jerseyNumber}` : ""
            }`,
            href: `/athletes/${a.id}`,
            avatarUrl: a.photoUrl,
          }));

          const sessionItems: CommandPaletteItem[] = sessions.map((s) => ({
            id: `ses-${s.id}`,
            category: "SCHEDULE",
            categoryLabel: "Jadwal",
            title: s.title,
            subtitle: `${formatDateID(s.startTime)} · ${formatTimeID(s.startTime)} · ${
              s.coachName
            }${s.location ? ` (${s.location})` : ""}`,
            href: `/schedule/${s.id}/execute`,
          }));

          const planItems: CommandPaletteItem[] = trainingPlans.map((p) => ({
            id: `plan-${p.id}`,
            category: "TRAINING_PLAN",
            categoryLabel: "Program",
            title: p.title,
            subtitle: `${p.exerciseCount} gerakan latihan · Status: ${p.status}`,
            href: `/training-plans/${p.id}`,
          }));

          const assessmentItems: CommandPaletteItem[] = assessments.map((ass) => ({
            id: `ass-${ass.id}`,
            category: "ASSESSMENT",
            categoryLabel: "Assessment",
            title: `Rapor Fisik: ${ass.athleteName}`,
            subtitle: `Tanggal: ${formatDateID(ass.assessmentDate)}${
              ass.overallScore != null
                ? ` · Skor: ${ass.overallScore.toFixed(1)}% (${ass.overallGrade || "—"})`
                : ""
            }`,
            href: `/assessments/${ass.id}`,
          }));

          setServerResults({
            athletes: athleteItems,
            sessions: sessionItems,
            trainingPlans: planItems,
            assessments: assessmentItems,
          });
        } else {
          setSearchError(res.error || "Gagal memuat hasil pencarian server");
        }
      });
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Combined Flattened List for deterministic keyboard navigation
  const flattenedList = useMemo<CommandPaletteItem[]>(() => {
    const list: CommandPaletteItem[] = [];

    // When query is empty and we have recent items, show recent at top (strictly filtered by role)
    if (!query.trim() && recentItems.length > 0) {
      recentItems.forEach((r) => {
        if (!isRouteAllowedForRole(role || "admin", r.href)) return;
        if (
          isAssistant &&
          (r.title.toLowerCase().includes("tambah atlet") ||
            r.title.toLowerCase().includes("program latihan") ||
            r.title.toLowerCase().includes("jadwalkan sesi") ||
            r.title.toLowerCase().includes("assessment") ||
            r.title.toLowerCase().includes("asesmen"))
        ) {
          return;
        }

        list.push({
          id: `recent-${r.id}`,
          category: "RECENT",
          categoryLabel: "Terbaru",
          title: r.title,
          subtitle: r.subtitle,
          href: r.href,
        });
      });
    }

    // Dynamic Server Results
    if (serverResults.athletes.length > 0) {
      list.push(...serverResults.athletes);
    }
    if (serverResults.sessions.length > 0) {
      list.push(...serverResults.sessions);
    }

    // Plans and assessments are strictly forbidden for Assistant Coach
    if (!isAssistant) {
      if (serverResults.trainingPlans.length > 0) {
        list.push(...serverResults.trainingPlans);
      }
      if (serverResults.assessments.length > 0) {
        list.push(...serverResults.assessments);
      }
    }

    // Filtered Static Items (Quick Actions & Navigation)
    list.push(...filteredStaticItems);

    return list;
  }, [query, recentItems, serverResults, filteredStaticItems]);

  // Keep selectedIndex within bounds
  useEffect(() => {
    if (selectedIndex >= flattenedList.length) {
      setSelectedIndex(Math.max(0, flattenedList.length - 1));
    }
  }, [flattenedList.length, selectedIndex]);

  // Save selected item to recent items
  const recordRecentItem = useCallback((item: CommandPaletteItem) => {
    try {
      const newRecent: RecentCommandItem = {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        href: item.href,
        category: item.category,
        timestamp: Date.now(),
      };
      const existingStr = localStorage.getItem(RECENT_STORAGE_KEY);
      let existing: RecentCommandItem[] = existingStr ? JSON.parse(existingStr) : [];
      existing = existing.filter((x) => x.href !== item.href);
      existing.unshift(newRecent);
      const sliced = existing.slice(0, MAX_RECENT_ITEMS);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(sliced));
      setRecentItems(sliced);
    } catch {
      // ignore
    }
  }, []);

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY);
      setRecentItems([]);
    } catch {
      // ignore
    }
  };

  const handleSelectItem = useCallback(
    (item: CommandPaletteItem) => {
      recordRecentItem(item);
      setOpen(false);
      router.push(item.href);
    },
    [recordRecentItem, router, setOpen]
  );

  // Keyboard navigation within the dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (flattenedList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedList.length) % flattenedList.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = flattenedList[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 select-none animate-in fade-in-0 duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette Pencarian Global"
        className="relative z-50 flex w-full max-w-xl flex-col rounded-2xl border border-border bg-surface-1 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[85vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="relative flex h-14 shrink-0 items-center border-b border-border px-4 gap-3 bg-surface-2/40">
          <Search className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={
              flattenedList[selectedIndex] ? `command-item-${flattenedList[selectedIndex].id}` : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Cari atlet, sesi, program, atau ketik aksi… (Esc untuk tutup)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />

          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />}

          {query && !isSearching && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded p-1 text-muted hover:text-foreground"
              aria-label="Hapus teks"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setOpen(false)}
            className="flex h-7 items-center gap-1 rounded border border-border bg-surface-2 px-2 text-[10px] font-mono text-muted hover:text-foreground transition"
            title="Tutup dialog (Esc)"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y-0"
        >
          {/* Error Banner */}
          {searchError && (
            <div className="p-3 my-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
              {searchError}
            </div>
          )}

          {/* Empty State */}
          {flattenedList.length === 0 && (
            <div className="py-12 text-center text-muted space-y-2">
              <Sparkles className="h-8 w-8 mx-auto text-muted/60" />
              <p className="text-xs font-semibold text-foreground">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-muted max-w-xs mx-auto">
                Coba kata kunci lain atau gunakan aksi cepat di bawah untuk menambah data baru.
              </p>
            </div>
          )}

          {/* Render List Items */}
          {flattenedList.length > 0 && (
            <div className="space-y-0.5">
              {/* Category Subheadings Helper */}
              {flattenedList.map((item, idx) => {
                const isFirstOfCategory =
                  idx === 0 || flattenedList[idx - 1].category !== item.category;

                return (
                  <React.Fragment key={item.id}>
                    {isFirstOfCategory && (
                      <div className="flex items-center justify-between px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted/80">
                        <span>{item.categoryLabel}</span>
                        {item.category === "RECENT" && (
                          <button
                            type="button"
                            onClick={handleClearRecent}
                            className="flex items-center gap-1 text-[9.5px] lowercase text-muted hover:text-rose-500 transition font-normal"
                          >
                            <Trash2 className="h-3 w-3" /> hapus riwayat
                          </button>
                        )}
                      </div>
                    )}

                    <SearchItemRow
                      item={item}
                      isSelected={idx === selectedIndex}
                      onSelect={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Footer Hint */}
        <div className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-surface-2/60 px-4 text-[10px] text-muted select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface-1 px-1 py-0.5 font-mono text-[9px]">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-surface-1 px-1 py-0.5 font-mono text-[9px]">
                ↓
              </kbd>
              <span>Navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface-1 px-1 py-0.5 font-mono text-[9px]">
                ↵
              </kbd>
              <span>Buka</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Command className="h-3 w-3 text-accent" />
            <span>Coach Zulfi Quick Command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
