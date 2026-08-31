"use client";

import { useState } from "react";
import { Trophy, Sparkles, Calendar, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import type { PortalPersonalBestItem } from "../types";

interface PortalAthletePersonalBestsProps {
  personalBests: PortalPersonalBestItem[];
}

function getDeltaText(item: PortalPersonalBestItem): {
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
} | null {
  if (item.currentValue === null) return null;

  const diff = Math.abs(item.currentValue - item.pbValue);
  const diffRounded = Math.round(diff * 100) / 100;
  const unit = item.unit.toLowerCase();

  if (item.scoreDirection === "LOWER_IS_BETTER") {
    if (item.currentValue < item.pbValue) {
      return { text: `${diffRounded} ${unit} lebih cepat dari rekor — rekor baru!`, isPositive: true, isNeutral: false };
    } else if (item.currentValue === item.pbValue) {
      return { text: "Sama dengan rekor terbaik", isPositive: false, isNeutral: true };
    } else {
      return { text: `${diffRounded} ${unit} lebih lambat dari rekor terbaik`, isPositive: false, isNeutral: false };
    }
  } else {
    if (item.currentValue > item.pbValue) {
      return { text: `+${diffRounded} ${unit} di atas rekor terbaik — rekor baru!`, isPositive: true, isNeutral: false };
    } else if (item.currentValue === item.pbValue) {
      return { text: "Sama dengan rekor terbaik", isPositive: false, isNeutral: true };
    } else {
      return { text: `${diffRounded} ${unit} di bawah rekor terbaik`, isPositive: false, isNeutral: false };
    }
  }
}

export function PortalAthletePersonalBests({ personalBests }: PortalAthletePersonalBestsProps) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 5;
  const hasMore = personalBests.length > VISIBLE_COUNT;
  const visibleItems = expanded ? personalBests : personalBests.slice(0, VISIBLE_COUNT);

  if (personalBests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-8 text-center space-y-2">
        <Trophy className="h-8 w-8 text-indigo-200 mx-auto" />
        <p className="font-semibold text-sm text-slate-700">Belum ada rekor pribadi</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Rekor akan terbentuk setelah hasil evaluasi fisik tersimpan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900">Rekor Terbaik Kamu</h3>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
            Personal Best
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{personalBests.length} Parameter</span>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleItems.map((item) => {
          const delta = getDeltaText(item);
          return (
            <div key={item.testItemId} className="px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Left: Name + Component + Date */}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-900">{item.testItemName}</span>
                    {item.physicalComponent && (
                      <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide border border-slate-200 shrink-0">
                        {item.physicalComponent.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Rekor diraih:{" "}
                    <span className="text-slate-500 font-medium">
                      {new Date(item.achievedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </p>
                </div>

                {/* Right: Values */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  {item.currentValue !== null && (
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Hasil Terakhir</span>
                      <span className="font-mono text-xs font-bold text-slate-700">{item.currentValue} {item.unit.toLowerCase()}</span>
                    </div>
                  )}
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-amber-600 block uppercase tracking-wider font-bold flex items-center gap-0.5 sm:justify-end">
                      <Sparkles className="h-2.5 w-2.5" />Rekor Terbaik
                    </span>
                    <span className="font-mono text-base font-black text-amber-600">{item.pbValue} {item.unit.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              {/* Delta text */}
              {delta && (
                <p className={`mt-1.5 text-[10px] font-medium flex items-center gap-1 ${
                  delta.isNeutral ? "text-slate-500" : delta.isPositive ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {delta.isNeutral ? <Minus className="h-3 w-3 shrink-0" /> : delta.isPositive ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
                  {delta.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-t border-slate-100 transition-colors min-h-[44px]"
          aria-expanded={expanded}
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" />Tampilkan Lebih Sedikit</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" />{personalBests.length - VISIBLE_COUNT} rekor lainnya</>
          )}
        </button>
      )}
    </div>
  );
}
