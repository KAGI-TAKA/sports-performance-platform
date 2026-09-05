"use client";

import { useState } from "react";
import { User, Check, X, Plus, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export interface AthleteOption {
  id: string;
  name: string;
  category?: string | null;
  age?: number | null;
  photoUrl?: string | null;
  isActive?: boolean;
}

interface YapAthleteSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAthleteId: string;
  athletes: AthleteOption[];
  onSelectAthlete: (athleteId: string) => void;
}

export function YapAthleteSelector({
  isOpen,
  onClose,
  currentAthleteId,
  athletes,
  onSelectAthlete,
}: YapAthleteSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0B132B] border border-slate-800 p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Pilih Atlet
            </h3>
            <p className="text-xs text-slate-400">
              Siapa profil atlet yang ingin Anda lihat?
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Athlete List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {athletes.map((athlete) => {
            const isSelected = athlete.id === currentAthleteId;
            const initials = athlete.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={athlete.id}
                onClick={() => {
                  onSelectAthlete(athlete.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-sky-500/15 border-sky-500/60 shadow-lg shadow-sky-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={athlete.photoUrl ?? undefined}
                    fallback={initials}
                    size="md"
                    alt={athlete.name}
                    className={`ring-2 ${isSelected ? "ring-sky-400" : "ring-slate-700"}`}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                      <span>{athlete.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/20 px-1.5 py-0.2 rounded">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      <span className="italic">{athlete.category ?? "Youth Performance"}</span>
                      {athlete.age ? ` · ${athlete.age} th` : ""}
                    </div>
                  </div>
                </div>

                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-sky-500 text-white"
                      : "border border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info or action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Akses portal terverifikasi aman</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
