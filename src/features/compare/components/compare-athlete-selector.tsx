"use client";

import React from "react";
import { Users, Plus, X, User } from "lucide-react";
import { COMPARE_COLORS } from "../types";

export interface AthleteOptionItem {
  id: string;
  fullName: string;
  position: string;
  jerseyNumber: number | null;
  assessmentCount: number;
}

interface CompareAthleteSelectorProps {
  availableAthletes: AthleteOptionItem[];
  selectedAthleteIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
}

export function CompareAthleteSelector({
  availableAthletes,
  selectedAthleteIds,
  onChangeSelectedIds,
}: CompareAthleteSelectorProps) {
  // Handle updating a specific slot
  const handleSelectSlot = (index: number, newId: string) => {
    const updated = [...selectedAthleteIds];
    updated[index] = newId;
    // Deduplicate while preserving slot position
    const unique = Array.from(new Set(updated)).slice(0, 4);
    onChangeSelectedIds(unique);
  };

  // Add an athlete slot (up to 4)
  const handleAddSlot = () => {
    if (selectedAthleteIds.length >= 4) return;
    // Pick the first athlete not already selected
    const nextAvailable = availableAthletes.find(
      (a) => !selectedAthleteIds.includes(a.id)
    );
    if (nextAvailable) {
      onChangeSelectedIds([...selectedAthleteIds, nextAvailable.id]);
    }
  };

  // Remove a slot (min 2 athletes)
  const handleRemoveSlot = (index: number) => {
    if (selectedAthleteIds.length <= 2) return;
    const updated = selectedAthleteIds.filter((_, i) => i !== index);
    onChangeSelectedIds(updated);
  };

  return (
    <div className="space-y-3" role="region" aria-label="Pemilih Atlet Komparasi">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Users className="h-4 w-4 text-accent" />
          <span>Pilih Atlet yang Dibandingkan (2 – 4 Atlet)</span>
        </h3>
        <span className="text-xs text-muted">
          {selectedAthleteIds.length} dari 4 slot terisi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {selectedAthleteIds.map((selectedId, idx) => {
          const color = COMPARE_COLORS[idx % COMPARE_COLORS.length];
          const currentAthlete = availableAthletes.find((a) => a.id === selectedId);

          return (
            <div
              key={`slot-${idx}`}
              className="rounded-xl border border-border bg-surface-1 p-3.5 space-y-2 relative transition-all"
              style={{ borderTopColor: color, borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span
                  className="font-bold flex items-center gap-1.5"
                  style={{ color }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>Atlet {idx + 1}</span>
                </span>

                {selectedAthleteIds.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(idx)}
                    className="text-muted hover:text-rose-500 p-1 rounded transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label={`Hapus Slot Atlet ${idx + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={selectedId}
                onChange={(e) => handleSelectSlot(idx, e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[40px]"
                aria-label={`Pilih Atlet untuk Slot ${idx + 1}`}
              >
                {availableAthletes.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                    disabled={
                      selectedAthleteIds.includes(a.id) && a.id !== selectedId
                    }
                  >
                    {a.fullName} {a.jerseyNumber != null ? `#${a.jerseyNumber}` : ""} ({a.position.replace(/_/g, " ")})
                  </option>
                ))}
              </select>

              {currentAthlete && (
                <div className="text-[11px] text-muted flex items-center justify-between pt-1 border-t border-border/40">
                  <span>{currentAthlete.assessmentCount} asesmen selesai</span>
                  <span className="capitalize">{currentAthlete.position.replace(/_/g, " ").toLowerCase()}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Slot Button (if < 4 slots) */}
        {selectedAthleteIds.length < 4 && (
          <button
            type="button"
            onClick={handleAddSlot}
            className="rounded-xl border border-dashed border-border/80 hover:border-accent hover:bg-accent/5 p-4 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-muted hover:text-accent transition min-h-[110px]"
            aria-label="Tambah Slot Atlet Ketiga atau Keempat"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-foreground">
              <Plus className="h-4 w-4" />
            </div>
            <span>+ Tambah Atlet ({selectedAthleteIds.length + 1})</span>
          </button>
        )}
      </div>
    </div>
  );
}
