"use client";

import React, { useState, useMemo } from "react";
import { Users, GitCompare, Sparkles, Activity } from "lucide-react";
import { CompareAthleteSelector, type AthleteOptionItem } from "./compare-athlete-selector";
import { MultiAthleteRadarChart } from "./multi-athlete-radar-chart";
import { ComplementaryStrengths } from "./complementary-strengths";
import { CompareMetricsTable } from "./compare-metrics-table";
import { calculateMultiAthleteComparison, type RawAssessmentData } from "../engine";

interface CompareHeadToHeadProps {
  athletes: AthleteOptionItem[];
  assessmentDetailsMap: Record<string, RawAssessmentData>;
  initialSelectedIds?: string[];
}

export function CompareHeadToHead({
  athletes,
  assessmentDetailsMap,
  initialSelectedIds,
}: CompareHeadToHeadProps) {
  // Default to first 2 available athletes
  const defaultIds = useMemo(() => {
    if (initialSelectedIds && initialSelectedIds.length >= 2) {
      return initialSelectedIds.slice(0, 4);
    }
    return athletes.slice(0, 2).map((a) => a.id);
  }, [athletes, initialSelectedIds]);

  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>(defaultIds);

  // Filter raw data for currently selected athletes
  const selectedRawData: RawAssessmentData[] = useMemo(() => {
    return selectedAthleteIds
      .map((id) => assessmentDetailsMap[id])
      .filter((d): d is RawAssessmentData => Boolean(d));
  }, [selectedAthleteIds, assessmentDetailsMap]);

  // Compute multi-athlete comparison result using authoritative pure engine
  const comparisonResult = useMemo(() => {
    return calculateMultiAthleteComparison(selectedRawData);
  }, [selectedRawData]);

  if (athletes.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-surface-1 p-12 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 mx-auto">
          <Users className="h-6 w-6 text-muted" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Data Atlet Belum Mencukupi</h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Fitur komparasi membutuhkan minimal 2 atlet dengan asesmen yang telah selesai di organisasi Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Komparasi Profil Performa Multi-Atlet">
      {/* 1. ATHLETE SELECTOR (2 - 4 SLOTS) */}
      <CompareAthleteSelector
        availableAthletes={athletes}
        selectedAthleteIds={selectedAthleteIds}
        onChangeSelectedIds={setSelectedAthleteIds}
      />

      {/* 2. RADAR OVERLAY (LEFT) & COMPLEMENTARY STRENGTHS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Radar Overlay 7 Components */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface-1 p-5 space-y-3">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">
              Radar Overlay 7 Komponen Fisik (Norma 0–100%)
            </h3>
            <p className="text-xs text-muted">
              Perbandingan visual profil fisik yang telah dinormalisasi berdasarkan norma kelompok usia dan gender masing-masing.
            </p>
          </div>

          <MultiAthleteRadarChart athletes={comparisonResult.athletes} />
        </div>

        {/* Complementary Strengths Insight */}
        <div className="lg:col-span-5 space-y-4">
          <ComplementaryStrengths strengths={comparisonResult.complementaryStrengths} />
        </div>
      </div>

      {/* 3. SIDE-BY-SIDE METRICS TABLE */}
      <CompareMetricsTable
        athletes={comparisonResult.athletes}
        comparisonTable={comparisonResult.comparisonTable}
      />
    </div>
  );
}
