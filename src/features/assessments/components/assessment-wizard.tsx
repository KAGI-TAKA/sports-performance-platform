"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PhysicalComponent, ScoreDirection, MeasurementUnit } from "@prisma/client";
import { createAssessment } from "../actions";
import { calculateAssessmentEngine, TestItemValue } from "../engine";

interface TestItemProp {
  id: string;
  physicalComponent: PhysicalComponent;
  name: string;
  unit: MeasurementUnit;
  scoreDirection: ScoreDirection;
  testType?: string;
  benchmarks: Array<{
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
    position: string;
  };
  testItems: TestItemProp[];
}

// ─── Slider Range Helper ─────────────────────────────────────────────────────
// Menghitung nilai maksimum slider berdasarkan benchmark aktual item tes.
// Lebih intuitif daripada angka hardcoded per unit.
function getSliderMax(item: TestItemProp): number {
  const bm = item.benchmarks[0];

  if (bm) {
    if (item.scoreDirection === "HIGHER_IS_BETTER") {
      // Beri 30% ruang di atas threshold A (nilai terbaik)
      return Math.ceil(Number(bm.thresholdA) * 1.3);
    } else {
      // LOWER_IS_BETTER: thresholdD = nilai paling buruk (angka paling tinggi).
      // Beri 50% ruang supaya bisa input angka jelek sekalipun.
      return Math.ceil(Number(bm.thresholdD) * 1.5);
    }
  }

  // Fallback berbasis unit jika belum ada benchmark
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

export function AssessmentWizard({ athlete, testItems }: AssessmentWizardProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rawValues, setRawValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentComponent = STEP_COMPONENTS[currentStepIndex];

  // Map test items by component
  const componentTestItems = useMemo(() => {
    return testItems.filter((item) => item.physicalComponent === currentComponent.key);
  }, [testItems, currentComponent.key]);

  // Live Score Engine Calculation
  const livePreview = useMemo(() => {
    const filledItems: TestItemValue[] = Object.entries(rawValues)
      .map(([id, rawValue]) => {
        const itemDef = testItems.find((t) => t.id === id);
        if (!itemDef || rawValue == null || isNaN(rawValue)) return null;

        const bm = itemDef.benchmarks[0];
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
      return { score: 0, grade: "—", filledCount: 0 };
    }

    const res = calculateAssessmentEngine(filledItems);
    return {
      score: res.overallScore,
      grade: res.overallGrade,
      filledCount,
    };
  }, [rawValues, testItems]);

  function handleValueChange(id: string, val: number) {
    setRawValues((prev) => ({ ...prev, [id]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const results = Object.entries(rawValues).map(([testItemId, rawValue]) => ({
      testItemId,
      rawValue: Number(rawValue),
    }));

    if (results.length === 0) {
      setError("Silakan isi setidaknya satu nilai hasil tes.");
      setLoading(false);
      return;
    }

    try {
      const created = await createAssessment({
        athleteId: athlete.id,
        assessmentDate: new Date(),
        results,
      });

      router.push(`/assessments/${created.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan hasil assessment.");
      setLoading(false);
    }
  }

  const isLastStep = currentStepIndex === STEP_COMPONENTS.length - 1;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Assessment Physical — {athlete.fullName}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Posisi: {athlete.position.replace("_", " ")} · Tanggal:{" "}
            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stepper Header (1 to 7) */}
      <div className="flex items-center justify-between overflow-x-auto gap-2 py-2">
        {STEP_COMPONENTS.map((comp, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;

          return (
            <button
              key={comp.key}
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? "bg-accent text-white shadow-md"
                  : isCompleted
                  ? "bg-surface-2 text-foreground border border-accent/40"
                  : "bg-surface-1 text-muted border border-border"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  isActive
                    ? "bg-white text-accent"
                    : isCompleted
                    ? "bg-accent/20 text-accent"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {idx + 1}
              </span>
              {comp.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md bg-red-950/40 p-3 text-xs text-red-400 border border-red-800/50">
          {error}
        </div>
      )}

      {/* Main Grid Layout (Left Form, Right Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Area */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface-1 p-6 space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="font-display text-base font-semibold text-foreground capitalize">
              {currentComponent.label}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Geser slider atau ketikkan nilai angka sesuai hasil tes atlet di lapangan.
            </p>
          </div>

          {componentTestItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              Belum ada item tes terdaftar untuk komponen ini. Silakan lanjut ke komponen berikutnya.
            </div>
          ) : (
            <div className="space-y-6">
              {componentTestItems.map((item) => {
                const isQualitative = item.testType === "QUALITATIVE";
                const val = rawValues[item.id] ?? 0;

                if (isQualitative) {
                  const RUBRICS = [
                    { label: "Sangat Baik", score: 100, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
                    { label: "Baik", score: 75, color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
                    { label: "Cukup", score: 50, color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
                    { label: "Kurang", score: 25, color: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
                  ];

                  return (
                    <div key={item.id} className="space-y-2 rounded-lg bg-surface-2/40 border border-border p-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                        <span>{item.name} (Rubrik Teknik)</span>
                        <span className="text-[10px] font-mono text-purple-400">QUALITATIVE</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {RUBRICS.map((r) => {
                          const isSelected = rawValues[item.id] === r.score;
                          return (
                            <button
                              key={r.label}
                              type="button"
                              onClick={() => handleValueChange(item.id, r.score)}
                              className={`rounded-lg border px-2 py-2 text-center text-xs font-bold transition ${
                                isSelected
                                  ? `${r.color} shadow-sm ring-1 ring-accent`
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

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <label className="font-medium text-foreground">
                        {item.name} ({item.unit.toLowerCase()})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={rawValues[item.id] ?? ""}
                        onChange={(e) => handleValueChange(item.id, Number(e.target.value))}
                        className="w-24 rounded-md border border-border bg-surface-2 px-3 py-1 text-right font-mono text-sm font-semibold text-foreground focus:border-accent focus:outline-none"
                      />
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={getSliderMax(item)}
                      step="0.5"
                      value={val}
                      onChange={(e) => handleValueChange(item.id, Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-surface-2 appearance-none cursor-pointer accent-accent"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Stepper Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-md border border-border px-4 py-2 text-xs font-medium text-secondary hover:bg-surface-2 disabled:opacity-40"
            >
              Kembali
            </button>

            {isLastStep ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="rounded-md bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? "Menyimpan..." : "Selesai & Analisis"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStepIndex((prev) => Math.min(STEP_COMPONENTS.length - 1, prev + 1))}
                className="rounded-md bg-accent px-5 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
              >
                Lanjut →
              </button>
            )}
          </div>
        </div>

        {/* Right Live Score Preview Panel (Wireframe 3) */}
        <div className="rounded-lg border border-border bg-surface-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Skor Sementara
            </h3>

            <div className="mt-6 text-center">
              <div className="font-mono text-5xl font-extrabold text-foreground">
                {livePreview.score > 0 ? `${livePreview.score}%` : "—"}
              </div>
              <div className="mt-2 text-sm font-semibold uppercase text-accent">
                Grade {livePreview.grade}
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-4 text-center">
              <p className="text-xs text-muted">
                terisi <span className="font-semibold text-foreground">{livePreview.filledCount}</span> dari 7 komponen
              </p>
              <div className="mt-2 w-full h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(livePreview.filledCount / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-surface-2 p-3 text-[11px] text-muted space-y-1">
            <p>💡 <strong className="text-foreground">Info UX:</strong> Kalkulasi skor dan grade dihitung secara otomatis saat Anda menggeser slider atau mengisi angka tes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
