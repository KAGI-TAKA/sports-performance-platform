"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, Check, ChevronDown, X, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AthleteItem {
  id: string;
  fullName: string;
  sportCategory?: string | null;
  count?: number;
}

interface SessionLogAthleteFilterProps {
  athletes: AthleteItem[];
  selectedAthleteId?: string;
  totalLogs: number;
}

export function SessionLogAthleteFilter({
  athletes,
  selectedAthleteId = "ALL",
  totalLogs,
}: SessionLogAthleteFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAthlete = useMemo(() => {
    if (selectedAthleteId === "ALL") return null;
    return athletes.find((a) => a.id === selectedAthleteId);
  }, [athletes, selectedAthleteId]);

  const filteredAthletes = useMemo(() => {
    if (!searchQuery.trim()) return athletes;
    const q = searchQuery.toLowerCase();
    return athletes.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        (a.sportCategory && a.sportCategory.toLowerCase().includes(q))
    );
  }, [athletes, searchQuery]);

  function handleSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "ALL") {
      params.delete("athleteId");
    } else {
      params.set("athleteId", id);
    }
    setIsOpen(false);
    setSearchQuery("");
    router.push(`/session-logs?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-muted">
          <Users className="h-3.5 w-3.5" />
          Filter Atlet:
        </span>

        {/* Searchable Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-1 px-3 py-1.5 font-medium text-foreground hover:bg-surface-2 transition shadow-2xs min-w-[200px]"
          >
            <div className="flex items-center gap-2 truncate">
              <User className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate font-semibold">
                {selectedAthlete ? selectedAthlete.fullName : "Semua Atlet"}
              </span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu with Live Search */}
          {isOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-border bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
              {/* Search input */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari nama atlet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-8 pr-3 text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Options list */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                {/* Option: Semua Atlet */}
                <button
                  type="button"
                  onClick={() => handleSelect("ALL")}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                    selectedAthleteId === "ALL"
                      ? "bg-accent text-white font-semibold"
                      : "hover:bg-surface-2 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Semua Atlet</span>
                  </div>
                  {selectedAthleteId === "ALL" && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>

                {/* Filtered Athletes List */}
                {filteredAthletes.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted">
                    Tidak ada atlet yang cocok.
                  </p>
                ) : (
                  filteredAthletes.map((a) => {
                    const isSelected = selectedAthleteId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleSelect(a.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                          isSelected
                            ? "bg-accent text-white font-semibold"
                            : "hover:bg-surface-2 text-foreground"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-medium">{a.fullName}</div>
                          {a.sportCategory && (
                            <div className={`text-[10px] truncate ${isSelected ? "text-indigo-100" : "text-muted"}`}>
                              {a.sportCategory}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filter Badge if specific athlete selected */}
        {selectedAthlete && (
          <button
            type="button"
            onClick={() => handleSelect("ALL")}
            className="flex items-center gap-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent px-2 py-1 text-[11px] font-semibold transition"
          >
            <span>Reset ke Semua</span>
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="text-[11px] text-muted">
        Menampilkan{" "}
        <strong className="text-foreground font-semibold">
          {totalLogs}
        </strong>{" "}
        catatan sesi {selectedAthlete ? `untuk ${selectedAthlete.fullName}` : "seluruh atlet"}
      </div>
    </div>
  );
}
