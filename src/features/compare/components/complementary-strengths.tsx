"use client";

import React from "react";
import { Sparkles, Shield, Target } from "lucide-react";
import type { AthleteComplementaryStrength } from "../types";

interface ComplementaryStrengthsProps {
  strengths: AthleteComplementaryStrength[];
}

export function ComplementaryStrengths({ strengths }: ComplementaryStrengthsProps) {
  if (strengths.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Profil Kekuatan Komplementer</span>
          </h3>
          <p className="text-xs text-muted">
            Analisis kekuatan relatif &amp; area pengembangan individual tanpa pemeringkatan/ranking.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {strengths.map((item) => (
          <div
            key={item.athleteId}
            className="p-3.5 rounded-lg bg-surface-2/40 border border-border/80 space-y-2 transition-all hover:border-border"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold flex items-center gap-1.5"
                style={{ color: item.color }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.athleteName}</span>
              </span>

              {item.strengthComponent && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-surface-1 px-2 py-0.5 rounded border border-border/60">
                  {item.strengthComponent}
                </span>
              )}
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed">
              {item.summaryText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
