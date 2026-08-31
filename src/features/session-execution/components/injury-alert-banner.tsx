"use client";

import { AlertTriangle } from "lucide-react";
import type { SessionExecutionAthleteData } from "../types";

interface InjuryAlertBannerProps {
  athletes: SessionExecutionAthleteData[];
}

export function InjuryAlertBanner({ athletes }: InjuryAlertBannerProps) {
  const athletesWithInjuries = athletes.filter(
    (a) => a.activeInjuries && a.activeInjuries.length > 0
  );

  if (athletesWithInjuries.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-2 text-slate-800 shadow-xs"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <h4 className="font-bold text-xs uppercase tracking-wide text-amber-900">
          Perhatian: Catatan Cedera Aktif ({athletesWithInjuries.length} Atlet)
        </h4>
      </div>

      <div className="divide-y divide-amber-200/60 text-xs">
        {athletesWithInjuries.map((athlete) => (
          <div key={athlete.id} className="py-1.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <strong className="text-slate-900 font-semibold">{athlete.fullName}</strong>
              <span className="text-slate-600 text-[11px] ml-1.5">
                ({athlete.activeInjuries.map((inj) => `${inj.injuryType}${inj.severity ? ` - ${inj.severity}` : ""}`).join(", ")})
              </span>
            </div>
            <span className="text-[11px] font-medium text-amber-800 italic">
              Pastikan intensitas latihan mengikuti arahan Coach.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
