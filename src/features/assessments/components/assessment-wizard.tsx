"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhysicalComponent, ScoreDirection, MeasurementUnit } from "@prisma/client";
import { createAssessment } from "../actions";
import { calculateAssessmentEngine, calculateAgeAtDate, pickBestBenchmark, TestItemValue } from "../engine";
import { toast } from "sonner";
import { ArrowLeft, Users, Check, ChevronRight, Save, ArrowRight } from "lucide-react";

interface TestItemProp {
  id: string;
  physicalComponent: PhysicalComponent | null;
  name: string;
  unit: MeasurementUnit;
  scoreDirection: ScoreDirection;
  testType?: string;
  benchmarks: Array<{
    id?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: string | null;
    thresholdA: number;
    thresholdB: number;
    thresholdC: number;
    thresholdD: number;
  }>;
}

interface AssessmentWizardProps {
  athlete: {
    id: string;
    fullName: string;
    position?: string;
    trainingLevel?: string;
    dateOfBirth?: Date | string;
    gender?: string;
  };
  allAthletes?: Array<{
    id: string;
    fullName: string;
    trainingLevel?: string;
  }>;
  testItems: TestItemProp[];
  previousAssessment?: {
    id: string;
    assessmentDate: Date;
    overallScore: number | null;
    overallGrade: string | null;
    assessmentType: string;
    resultItems: Array<{
      testItemId: string;
      rawValue: number;
      testItemName: string;
      unit: string;
    }>;
  } | null;
}

function getSliderMax(item: TestItemProp): number {
  const bm = item.benchmarks[0];

  if (bm) {
    if (item.scoreDirection === "HIGHER_IS_BETTER") {
      return Math.ceil(Number(bm.thresholdA) * 1.3);
    } else {
      return Math.ceil(Number(bm.thresholdD) * 1.5);
    }
  }

  const unitFallback: Partial<Record<MeasurementUnit, number>> = {
    SECOND: 60,
    CM: 300,
    M: 20,
    REPETITION: 100,
    KG: 200,
    ML_KG_MIN: 80,
    SCORE: 100,
  };
  return unitFallback[item.unit] ?? 100;
}

const STEP_COMPONENTS: { key: PhysicalComponent; label: string }[] = [
  { key: "FLEXIBILITY", label: "Fleksibilitas" },
  { key: "POWER", label: "Power" },
  { key: "SPEED", label: "Kecepatan" },
  { key: "AGILITY", label: "Kelincahan" },
  { key: "MUSCULAR_ENDURANCE", label: "Daya Tahan Otot" },
  { key: "ANAEROBIC_ENDURANCE", label: "Daya Tahan Anaerobik" },
  { key: "AEROBIC_ENDURANCE", label: "Daya Tahan Aerobik" },
];

export function AssessmentWizard({
  athlete,
  allAthletes = [],
  testItems,
  previousAssessment,
}: AssessmentWizardProps) {
  const router = useRouter();
  const hasPrevious = Boolean(previousAssessment && previousAssessment.resultItems.length > 0);
  const defaultMode =
    athlete.trainingLevel === "BEGINNER" || athlete.trainingLevel === "INTERMEDIATE" || hasPrevious
      ? "PROGRESS_BASED"
      : "BENCHMARK_BASED";

  const [assessmentType, setAssessmentType] = useState<"PROGRESS_BASED" | "BENCHMARK_BASED">(defaultMode);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rawValues, setRawValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentComponent = STEP_COMPONENTS[currentStepIndex];

  // Map test items by component
  const componentTestItems = useMemo(() => {
    return testItems.filter((item) => item.physicalComponent === currentComponent.key);
  }, [testItems, currentComponent.key]);

  // Find next athlete in list for the "Save & Next" flow
  const nextAthlete = useMemo(() => {
    if (allAthletes.length <= 1) return null;
    const currentIndex = allAthletes.findIndex((a) => a.id === athlete.id);
    if (currentIndex === -1 || currentIndex === allAthletes.length - 1) {
      return allAthletes[0]?.id !== athlete.id ? allAthletes[0] : null;
    }
    return allAthletes[currentIndex + 1];
  }, [allAthletes, athlete.id]);

  // Live Score Engine Calculation
  const livePreview = useMemo(() => {
    const athleteAge = athlete.dateOfBirth
      ? calculateAgeAtDate(new Date(athlete.dateOfBirth))
      : 12;

    const filledItems: TestItemValue[] = Object.entries(rawValues)
      .map(([id, rawValue]) => {
        const itemDef = testItems.find((t) => t.id === id);
        if (!itemDef || rawValue == null || isNaN(rawValue)) return null;

        const benchmarksFormatted = (itemDef.benchmarks ?? []).map((b) => ({
          ageMin: b.ageMin ?? 0,
          ageMax: b.ageMax ?? 99,
          gender: b.gender ?? null,
          thresholdA: b.thresholdA,
          thresholdB: b.thresholdB,
          thresholdC: b.thresholdC,
          thresholdD: b.thresholdD,
        }));

        const bm = pickBestBenchmark(
          benchmarksFormatted,
          athlete.gender ?? "MALE",
          athleteAge
        ) ?? itemDef.benchmarks[0];

        return {
          testItemId: id,
          physicalComponent: itemDef.physicalComponent,
          rawValue: Number(rawValue),
          scoreDirection: itemDef.scoreDirection,
          thresholdA: bm ? Number(bm.thresholdA) : undefined,
          thresholdB: bm ? Number(bm.thresholdB) : undefined,
          thresholdC: bm ? Number(bm.thresholdC) : undefined,
          thresholdD: bm ? Number(bm.thresholdD) : undefined,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const filledComponentKeys = new Set(filledItems.map((i) => i.physicalComponent));
    const filledCount = filledComponentKeys.size;

    if (filledItems.length === 0) {
      return {
        score: 0,
        grade: "—",
        filledCount: 0,
        componentScores: {},
        isPartial: true,
      };
    }

    const calculated = calculateAssessmentEngine(filledItems);
    return {
      score: calculated.overallScore ?? 0,
      grade: calculated.overallGrade ?? "—",
      filledCount,
      componentScores: calculated.componentScores,
      isPartial: filledCount < 7,
    };
  }, [rawValues, testItems, athlete]);

  // Live Delta Progress comparison for PROGRESS_BASED mode
  const progressComparisons = useMemo(() => {
    let improved = 0;
    let declining = 0;
    let stable = 0;

    const items = Object.entries(rawValues).map(([id, rawValue]) => {
      const itemDef = testItems.find((t) => t.id === id);
      const prevItem = previousAssessment?.resultItems.find((r) => r.testItemId === id);

      if (!itemDef || rawValue == null || isNaN(rawValue)) return null;

      const currentVal = Number(rawValue);
      const prevVal = prevItem ? Number(prevItem.rawValue) : null;
      let trend: "IMPROVED" | "DECLINING" | "STABLE" | "NEW" = "NEW";
      let delta: number | null = null;
      let pct: number | null = null;

      if (prevVal != null) {
        delta = Math.round((currentVal - prevVal) * 100) / 100;
        pct = prevVal > 0 ? Math.round((delta / prevVal) * 1000) / 10 : null;

        const isHigherBetter = itemDef.scoreDirection === "HIGHER_IS_BETTER";
        if (Math.abs(delta) < 0.01) {
          trend = "STABLE";
          stable++;
        } else if ((isHigherBetter && delta > 0) || (!isHigherBetter && delta < 0)) {
          trend = "IMPROVED";
          improved++;
        } else {
          trend = "DECLINING";
          declining++;
        }
      }

      return {
        testItemId: id,
        name: itemDef.name,
        unit: itemDef.unit,
        currentVal,
        prevVal,
        delta,
        pct,
        trend,
      };
    }).filter((i): i is NonNullable<typeof i> => i !== null);

    return { items, improved, declining, stable };
  }, [rawValues, testItems, previousAssessment]);

  const handleValueChange = (testItemId: string, val: number) => {
    setRawValues((prev) => ({
      ...prev,
      [testItemId]: val,
    }));
    setError(null);
  };

  async function handleSave(redirectToNextAthleteId?: string) {
    setLoading(true);
    setError(null);

    const results = Object.entries(rawValues)
      .filter(([_, rawValue]) => rawValue != null && !isNaN(rawValue) && rawValue > 0)
      .map(([testItemId, rawValue]) => ({
        testItemId,
        rawValue: Number(rawValue),
      }));

    if (results.length === 0) {
      setError("Silakan isi setidaknya satu nilai hasil tes.");
      setLoading(false);
      return;
    }

    try {
      const res = await createAssessment({
        athleteId: athlete.id,
        assessmentDate: new Date(),
        assessmentType,
        results,
      });

      if (res.success && res.assessmentId) {
        if (redirectToNextAthleteId) {
          toast.success(`Assessment untuk ${athlete.fullName} berhasil disimpan! Beralih ke atlet berikutnya.`);
          router.push(`/assessments/new?athleteId=${redirectToNextAthleteId}`);
        } else {
          toast.success("Assessment fisik berhasil disimpan!");
          router.push(`/assessments/${res.assessmentId}`);
        }
        router.refresh();
      } else {
        setError(res.error ?? "Gagal menyimpan hasil assessment.");
        toast.error(res.error ?? "Gagal menyimpan hasil assessment.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan hasil assessment.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  }

  const isLastStep = currentStepIndex === STEP_COMPONENTS.length - 1;
  const athleteAge = athlete.dateOfBirth ? calculateAgeAtDate(new Date(athlete.dateOfBirth)) : null;

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & ATHLETE SWITCHER ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/assessments"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-1 text-muted hover:text-foreground transition"
              title="Kembali ke Asesmen"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <h1 className="font-display text-lg font-bold text-foreground">
              Assessment Fisik — {athlete.fullName}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted flex-wrap pl-9 sm:pl-0">
            {athlete.gender && (
              <span>{athlete.gender === "MALE" ? "👦 Putra" : "👧 Putri"}</span>
            )}
            {athleteAge != null && <span>· Usia {athleteAge} Thn</span>}
            <span>· Level: <strong className="text-foreground">{athlete.trainingLevel || "Pemula"}</strong></span>
            {hasPrevious && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                📈 Ada Data Baseline
              </span>
            )}
          </div>
        </div>

        {/* Mode Toggle Switch & Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {allAthletes.length > 1 && (
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs">
              <Users className="h-3.5 w-3.5 text-muted" />
              <select
                value={athlete.id}
                onChange={(e) => router.push(`/assessments/new?athleteId=${e.target.value}`)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
              >
                {allAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center bg-surface-2 p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setAssessmentType("PROGRESS_BASED")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                assessmentType === "PROGRESS_BASED"
                  ? "bg-accent text-white shadow-2xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              🌱 Mode Progress
            </button>
            <button
              type="button"
              onClick={() => setAssessmentType("BENCHMARK_BASED")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                assessmentType === "BENCHMARK_BASED"
                  ? "bg-accent text-white shadow-2xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              🏆 Mode Benchmark
            </button>
          </div>
        </div>
      </div>

      {/* ── STEPPER TABS (1 to 7) ───────────────────────────────────── */}
      <div className="flex items-center justify-between overflow-x-auto gap-2 py-1 select-none">
        {STEP_COMPONENTS.map((comp, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <button
              key={comp.key}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 border ${
                isActive
                  ? "bg-accent text-white border-accent shadow-2xs"
                  : isCompleted
                  ? "bg-surface-2 text-foreground border-border hover:bg-surface-3"
                  : "bg-surface-1 text-muted border-border hover:bg-surface-2"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white text-accent"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-surface-3 text-muted"
                }`}
              >
                {idx + 1}
              </span>
              <span>{comp.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN GRID: FORM INPUTS VS LIVE PREVIEW ──────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Form Box */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 sm:p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-foreground font-display">
              {currentComponent.label}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Masukkan angka hasil tes atlet. Tekan <kbd className="font-mono bg-surface-2 px-1 py-0.5 rounded border border-border text-[10px]">Enter</kbd> untuk berpindah ke item berikutnya.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {componentTestItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              Belum ada item tes terdaftar untuk komponen ini. Silakan lanjut ke komponen berikutnya.
            </div>
          ) : (
            <div className="space-y-5">
              {componentTestItems.map((item, itemIdx) => {
                const isQualitative = item.testType === "QUALITATIVE";
                const val = rawValues[item.id] ?? 0;
                const prevItem = previousAssessment?.resultItems.find((r) => r.testItemId === item.id);

                if (isQualitative) {
                  const RUBRICS = [
                    { label: "Sangat Baik", score: 100, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Baik", score: 75, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                    { label: "Cukup", score: 50, color: "bg-amber-50 text-amber-700 border-amber-200" },
                    { label: "Kurang", score: 25, color: "bg-rose-50 text-rose-700 border-rose-200" },
                  ];

                  return (
                    <div key={item.id} className="space-y-2 rounded-lg bg-surface-2/40 border border-border p-3.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                        <span>{item.name} (Rubrik Kualitatif)</span>
                        <span className="text-[10px] font-mono text-indigo-600">QUALITATIVE</span>
                      </div>

                      {prevItem && (
                        <div className="text-[11px] text-muted">
                          📌 Sesi Sebelumnya: <strong className="text-foreground">{prevItem.rawValue}%</strong>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {RUBRICS.map((r) => {
                          const isSelected = rawValues[item.id] === r.score;
                          return (
                            <button
                              key={r.label}
                              type="button"
                              onClick={() => handleValueChange(item.id, r.score)}
                              className={`rounded-md border px-2 py-2 text-center text-xs font-bold transition ${
                                isSelected
                                  ? `${r.color} ring-1 ring-accent shadow-2xs`
                                  : "border-border bg-surface-1 text-muted hover:text-foreground hover:bg-surface-2"
                              }`}
                            >
                              <div>{r.label}</div>
                              <div className="text-[9px] font-mono opacity-70 mt-0.5">{r.score}%</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Live Delta calculation per item
                let deltaBadge = null;
                if (prevItem && rawValues[item.id] != null && !isNaN(rawValues[item.id]) && rawValues[item.id] > 0) {
                  const currentInput = Number(rawValues[item.id]);
                  const diff = currentInput - prevItem.rawValue;
                  const isImproved =
                    item.scoreDirection === "HIGHER_IS_BETTER" ? diff > 0 : diff < 0;
                  const isDeclined =
                    item.scoreDirection === "HIGHER_IS_BETTER" ? diff < 0 : diff > 0;

                  if (Math.abs(diff) > 0.001) {
                    deltaBadge = (
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                          isImproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isDeclined
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-surface-2 text-muted"
                        }`}
                      >
                        {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {item.unit}{" "}
                        {isImproved ? "🟢 Meningkat" : "🔴 Menurun"}
                      </span>
                    );
                  }
                }

                return (
                  <div key={item.id} className="space-y-2 rounded-lg bg-surface-2/40 border border-border p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {item.name} ({item.unit})
                        </div>
                        {prevItem ? (
                          <div className="text-[11px] text-muted">
                            Baseline Lalu: <strong className="text-foreground">{prevItem.rawValue} {item.unit}</strong>
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted">Baseline: Belum ada data lampau</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {deltaBadge}
                        <input
                          ref={(el) => {
                            inputRefs.current[item.id] = el;
                          }}
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          value={rawValues[item.id] ?? ""}
                          onChange={(e) => handleValueChange(item.id, Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const nextItem = componentTestItems[itemIdx + 1];
                              if (nextItem && inputRefs.current[nextItem.id]) {
                                inputRefs.current[nextItem.id]?.focus();
                              } else if (!isLastStep) {
                                setCurrentStepIndex((prev) => Math.min(STEP_COMPONENTS.length - 1, prev + 1));
                              }
                            }
                          }}
                          placeholder="0.00"
                          className="w-24 rounded-md border border-border bg-surface-1 px-2.5 py-1.5 text-right font-mono text-sm font-bold text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-2xs"
                        />
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={getSliderMax(item)}
                      step="0.5"
                      value={val}
                      onChange={(e) => handleValueChange(item.id, Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-surface-3 appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Stepper Action Buttons */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border gap-2">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-2 disabled:opacity-40"
            >
              Kembali
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Save partial shortcut */}
              {Object.keys(rawValues).length > 0 && !isLastStep && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave()}
                  className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                  title="Simpan nilai tes yang sudah diisi sekarang tanpa harus mengisi seluruh komponen"
                >
                  <Save className="h-3 w-3 inline mr-1" />
                  Simpan Sekarang ({Object.keys(rawValues).length} Item)
                </button>
              )}

              {/* Save & Next Athlete shortcut */}
              {Object.keys(rawValues).length > 0 && nextAthlete && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave(nextAthlete.id)}
                  className="rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface-3 transition"
                  title={`Simpan dan langsung beralih ke ${nextAthlete.fullName}`}
                >
                  Simpan &amp; Lanjut: {nextAthlete.fullName.split(" ")[0]} →
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave()}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-2xs"
                >
                  {loading ? "Menyimpan..." : "Selesai & Simpan Analisis"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex((prev) => Math.min(STEP_COMPONENTS.length - 1, prev + 1))}
                  className="rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent/90 transition shadow-2xs"
                >
                  Lanjut →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: LIVE PROGRESS PREVIEW ─────────────────────── */}
        <div className="rounded-xl border border-border bg-surface-1 p-5 flex flex-col justify-between shadow-2xs space-y-4">
          {assessmentType === "PROGRESS_BASED" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {hasPrevious ? "Evaluasi Progres (Vs Sesi Lalu)" : "Pencatatan Baseline"}
                </h3>
              </div>

              {hasPrevious ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-950 font-bold">Ringkasan Kemajuan:</span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Baseline: {new Date(previousAssessment!.assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="rounded bg-emerald-100/80 p-1.5 border border-emerald-300">
                      <div className="text-base font-black text-emerald-700">
                        {progressComparisons.improved}
                      </div>
                      <span className="text-[9px] font-sans font-bold text-emerald-800">
                        Meningkat
                      </span>
                    </div>
                    <div className="rounded bg-slate-100 p-1.5 border border-slate-300">
                      <div className="text-base font-black text-slate-700">
                        {progressComparisons.stable}
                      </div>
                      <span className="text-[9px] font-sans font-bold text-slate-600">
                        Stabil
                      </span>
                    </div>
                    <div className="rounded bg-rose-100 p-1.5 border border-rose-300">
                      <div className="text-base font-black text-rose-700">
                        {progressComparisons.declining}
                      </div>
                      <span className="text-[9px] font-sans font-bold text-rose-800">
                        Menurun
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-center space-y-1.5">
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    🌱 Asesmen Pertama (Baseline)
                  </span>
                  <div className="font-mono text-3xl font-black text-foreground pt-1">
                    {livePreview.filledCount} / 7
                  </div>
                  <p className="text-[11px] text-emerald-950 font-medium">
                    Komponen Fisik Terisi
                  </p>
                </div>
              )}

              {/* Live Items Delta Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[11px] font-bold text-muted uppercase block">
                  {hasPrevious ? "Perbandingan per Item:" : "Ringkasan Input Sesi Ini:"}
                </span>

                {progressComparisons.items.length > 0 ? (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {progressComparisons.items.map((item) => (
                      <div
                        key={item.testItemId}
                        className="rounded bg-surface-2 p-2 text-xs font-mono border border-border/60 space-y-0.5"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-semibold text-foreground truncate max-w-[150px]">
                            {item.name}
                          </span>
                          <strong className="text-foreground">
                            {item.currentVal} {item.unit}
                          </strong>
                        </div>

                        {item.prevVal != null && (
                          <div className="flex items-center justify-between text-[10px] text-muted pt-0.5 border-t border-border/40">
                            <span>Lalu: {item.prevVal} {item.unit}</span>
                            <span
                              className={`font-bold ${
                                item.trend === "IMPROVED"
                                  ? "text-emerald-700 font-bold"
                                  : item.trend === "DECLINING"
                                  ? "text-rose-700 font-bold"
                                  : "text-muted"
                              }`}
                            >
                              {item.delta! > 0 ? `+${item.delta}` : item.delta} {item.unit} ({item.pct! > 0 ? `+${item.pct}%` : `${item.pct}%`})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic">
                    Belum ada nilai tes yang dimasukkan.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Mode Benchmark (Kompetitif)
                </h3>
              </div>

              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 text-center space-y-1.5">
                <div className="font-mono text-4xl font-extrabold text-foreground">
                  {livePreview.score > 0 ? `${livePreview.score}%` : "—"}
                </div>
                <div className="inline-block rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold uppercase text-white shadow-2xs">
                  Grade {livePreview.grade}
                </div>
                <p className="text-[10px] text-indigo-900 pt-1">
                  Acuan kelompok usia &amp; gender
                </p>
              </div>

              <div className="border-t border-border pt-3 text-center">
                <p className="text-xs text-muted">
                  terisi <span className="font-semibold text-foreground">{livePreview.filledCount}</span> dari 7 komponen
                </p>
                <div className="mt-1.5 w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${(livePreview.filledCount / 7) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-surface-2 p-2.5 text-[10px] text-muted border border-border">
            💡 Sistem mendukung simpan parsial. Pelatih dapat menyimpan tes meskipun hanya menguji 1 atau 2 item.
          </div>
        </div>
      </div>
    </div>
  );
}
