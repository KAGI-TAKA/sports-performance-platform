"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createAssessment } from "@/features/assessments/actions";
import type { SessionExecutionAthleteData } from "../types";
import {
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  User,
  Plus,
  Minus,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";

export interface FieldTestItemOption {
  id: string;
  name: string;
  unit: string;
  physicalComponent?: string | null;
  scoreDirection?: string | null;
}

interface FieldAssessmentDrawerProps {
  athletes: SessionExecutionAthleteData[];
  availableTestItems: FieldTestItemOption[];
  onRecordedCountChange?: (count: number) => void;
  isReadOnly?: boolean;
}

export function FieldAssessmentDrawer({
  athletes,
  availableTestItems,
  onRecordedCountChange,
  isReadOnly = false,
}: FieldAssessmentDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Active selections
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id || ""
  );
  const [selectedTestItemId, setSelectedTestItemId] = useState<string>(
    availableTestItems[0]?.id || ""
  );
  const [rawValue, setRawValue] = useState<string>("");
  const [recordedResults, setRecordedResults] = useState<
    Array<{ athleteName: string; testName: string; value: number; unit: string }>
  >([]);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);
  const selectedTestItem = availableTestItems.find((t) => t.id === selectedTestItemId);

  // Quick adjust buttons (+0.5, -0.5, +1, -1)
  const handleQuickAdjust = (delta: number) => {
    const current = parseFloat(rawValue) || 0;
    const next = Math.max(0, parseFloat((current + delta).toFixed(2)));
    setRawValue(String(next));
  };

  // Submit single assessment
  const handleSaveResult = (advanceToNext: boolean = false) => {
    if (!selectedAthleteId || !selectedTestItemId) {
      toast.error("Pilih atlet dan item tes terlebih dahulu");
      return;
    }

    const numVal = parseFloat(rawValue);
    if (isNaN(numVal) || numVal <= 0) {
      toast.error("Masukkan nilai tes fisik yang valid (angka positif)");
      return;
    }

    startTransition(async () => {
      const res = await createAssessment({
        athleteId: selectedAthleteId,
        assessmentDate: new Date().toISOString(),
        paradigm: "BENCHMARK",
        results: [
          {
            testItemId: selectedTestItemId,
            rawValue: numVal,
          },
        ],
      });

      if (res.success) {
        toast.success(
          `Hasil tes ${selectedTestItem?.name} untuk ${selectedAthlete?.fullName} berhasil dicatat!`
        );

        const newRecord = {
          athleteName: selectedAthlete?.fullName || "Atlet",
          testName: selectedTestItem?.name || "Tes",
          value: numVal,
          unit: selectedTestItem?.unit || "",
        };

        const updated = [...recordedResults, newRecord];
        setRecordedResults(updated);
        onRecordedCountChange?.(updated.length);
        setRawValue("");

        // Advance to next athlete if requested
        if (advanceToNext) {
          const currentIndex = athletes.findIndex((a) => a.id === selectedAthleteId);
          const nextIndex = (currentIndex + 1) % athletes.length;
          setSelectedAthleteId(athletes[nextIndex]?.id || athletes[0]?.id || "");
        }
      } else {
        toast.error(res.error || "Gagal menyimpan hasil tes");
      }
    });
  };

  if (availableTestItems.length === 0 || athletes.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-1 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/80 bg-surface-2/40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold text-xs">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-foreground">
                Input Tes Fisik Lapangan
              </h3>
              {recordedResults.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {recordedResults.length} Tercatat
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted">
              Pencatatan cepat metrik tes fisik atlet di lapangan
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? "Tutup Form" : "+ Input Nilai"}
          </button>
        )}
      </div>

      {/* Expandable Form Body */}
      {isOpen && !isReadOnly && (
        <div className="p-4 sm:p-5 space-y-4 bg-surface-1">
          {/* Step 1: Athlete Selector Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              1. Pilih Atlet
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1.5">
              {athletes.map((a) => {
                const isSelected = a.id === selectedAthleteId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAthleteId(a.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white border-accent shadow-xs"
                        : "bg-surface-2 text-muted border-border hover:text-foreground"
                    }`}
                  >
                    <User className="h-3 w-3" />
                    <span>{a.fullName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Test Item Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              2. Pilih Item Tes Fisik
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTestItems.map((t) => {
                const isSelected = t.id === selectedTestItemId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTestItemId(t.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent/10 border-accent text-accent shadow-xs"
                        : "bg-surface-2/60 border-border text-muted hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    <span className="font-bold text-xs block leading-snug truncate">
                      {t.name}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">
                      Satuan: {t.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Numeric Entry with Quick Adjust Buttons */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              3. Masukkan Nilai ({selectedTestItem?.name} - {selectedTestItem?.unit})
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdjust(-1)}
                className="h-11 w-11 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 font-bold flex items-center justify-center text-foreground cursor-pointer text-sm"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(-0.1)}
                className="h-11 w-11 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 font-bold flex items-center justify-center text-foreground cursor-pointer text-xs"
              >
                -0.1
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  step="any"
                  value={rawValue}
                  onChange={(e) => setRawValue(e.target.value)}
                  placeholder={`Contoh: 15.2 ${selectedTestItem?.unit || ""}`}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-surface-2 font-mono font-bold text-lg text-center text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <button
                type="button"
                onClick={() => handleQuickAdjust(0.1)}
                className="h-11 w-11 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 font-bold flex items-center justify-center text-foreground cursor-pointer text-xs"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdjust(1)}
                className="h-11 w-11 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 font-bold flex items-center justify-center text-foreground cursor-pointer text-sm"
              >
                +1
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              disabled={isPending || !rawValue}
              onClick={() => handleSaveResult(false)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 disabled:opacity-50 text-foreground font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              <span>Simpan Nilai</span>
            </button>

            <button
              type="button"
              disabled={isPending || !rawValue}
              onClick={() => handleSaveResult(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              <span>Simpan &amp; Atlet Berikutnya →</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Records Feed in this Session */}
      {recordedResults.length > 0 && (
        <div className="p-3.5 bg-surface-2/30 border-t border-border/60 text-xs">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
            Riwayat Tes Fisik Tercatat Sesi Ini ({recordedResults.length}):
          </span>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {recordedResults.map((rec, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-1 border border-border/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{rec.athleteName}</span>
                  <span className="text-muted text-[11px]">• {rec.testName}</span>
                </div>
                <span className="font-mono font-bold text-accent">
                  {rec.value} {rec.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
