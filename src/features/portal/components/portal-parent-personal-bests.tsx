"use client";

import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import type { PortalPersonalBestItem } from "../types";

interface PortalParentPersonalBestsProps {
  personalBests: PortalPersonalBestItem[];
}

function getNarrativeDelta(item: PortalPersonalBestItem): string | null {
  if (item.currentValue === null) return null;
  const diff = Math.round(Math.abs(item.currentValue - item.pbValue) * 100) / 100;
  const unit = item.unit.toLowerCase();

  if (item.scoreDirection === "LOWER_IS_BETTER") {
    if (item.currentValue <= item.pbValue) {
      return "Ananda sedang dalam performa terbaik!";
    }
    return `Ananda masih ${diff} ${unit} dari rekor terbaiknya.`;
  } else {
    if (item.currentValue >= item.pbValue) {
      return "Ananda sedang dalam performa terbaik!";
    }
    return `Ananda masih ${diff} ${unit} dari rekor terbaiknya.`;
  }
}

export function PortalParentPersonalBests({ personalBests }: PortalParentPersonalBestsProps) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 5;
  const hasMore = personalBests.length > VISIBLE_COUNT;
  const visibleItems = expanded ? personalBests : personalBests.slice(0, VISIBLE_COUNT);

  if (personalBests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-6 text-center space-y-1.5">
        <Trophy className="h-7 w-7 text-violet-200 mx-auto" />
        <p className="font-semibold text-sm text-slate-600">Belum ada rekor tercatat</p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          Rekor terbaik Ananda akan muncul setelah evaluasi fisik resmi selesai dilakukan.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h4 className="font-bold text-sm text-slate-900">Rekor Terbaik Ananda</h4>
        </div>
        <span className="text-[10px] text-slate-400">{personalBests.length} parameter</span>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleItems.map((item) => {
          const narrative = getNarrativeDelta(item);
          return (
            <div key={item.testItemId} className="px-4 py-3.5 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-xs text-slate-800">{item.testItemName}</p>
                {item.physicalComponent && (
                  <span className="text-[9px] uppercase text-slate-400 font-semibold shrink-0">{item.physicalComponent.replace(/_/g, " ")}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap">
                {item.currentValue !== null && (
                  <span className="text-slate-600">
                    Hasil terbaru: <strong className="text-slate-800 font-mono">{item.currentValue} {item.unit.toLowerCase()}</strong>
                  </span>
                )}
                <span className="text-amber-700">
                  Rekor terbaik: <strong className="font-mono text-amber-800">{item.pbValue} {item.unit.toLowerCase()}</strong>
                </span>
              </div>
              {narrative && (
                <p className="text-[11px] text-slate-500 italic leading-relaxed">{narrative}</p>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-violet-600 hover:bg-violet-50 border-t border-slate-100 transition-colors min-h-[44px]"
          aria-expanded={expanded}
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" />Tampilkan Lebih Sedikit</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" />{personalBests.length - VISIBLE_COUNT} parameter lainnya</>
          )}
        </button>
      )}
    </div>
  );
}
