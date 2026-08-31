"use client";

import { useState, useTransition, useRef } from "react";
import { upsertBenchmarkForTestItem, deleteBenchmark } from "../actions";
import { Check, X, Pencil, Loader2, Plus, Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

interface BenchmarkEditFormProps {
  testItemId: string;
  benchmarkId?: string;
  gender?: "MALE" | "FEMALE" | null;
  ageMin?: number | null;
  ageMax?: number | null;
  thresholdA?: number | null;
  thresholdB?: number | null;
  thresholdC?: number | null;
  thresholdD?: number | null;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
  /** Hanya admin dan head_coach yang boleh mengedit benchmark. */
  canEdit: boolean;
}

export function BenchmarkEditForm({
  testItemId,
  benchmarkId,
  gender = null,
  ageMin = 0,
  ageMax = 99,
  thresholdA,
  thresholdB,
  thresholdC,
  thresholdD,
  scoreDirection,
  canEdit,
}: BenchmarkEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"ALL" | "MALE" | "FEMALE">(
    gender === "MALE" ? "MALE" : gender === "FEMALE" ? "FEMALE" : "ALL"
  );
  const [currentAgeMin, setCurrentAgeMin] = useState<number>(ageMin ?? 0);
  const [currentAgeMax, setCurrentAgeMax] = useState<number>(ageMax ?? 99);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const hasExistingThresholds =
    thresholdA != null && thresholdB != null && thresholdC != null && thresholdD != null;

  const hint =
    scoreDirection === "HIGHER_IS_BETTER"
      ? "A > B > C > D (nilai lebih tinggi = lebih baik)"
      : "A < B < C < D (nilai lebih rendah = lebih baik)";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await upsertBenchmarkForTestItem(testItemId, fd, benchmarkId);
      if (res.success) {
        toast.success("Benchmark berhasil disimpan");
        setEditing(false);
      } else {
        toast.error(res.error ?? "Gagal menyimpan threshold");
      }
    });
  }

  async function handleDeleteThreshold() {
    if (!benchmarkId) {
      setEditing(false);
      return;
    }
    if (!confirm("Hapus seluruh nilai threshold benchmark ini?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteBenchmark(benchmarkId);
      if (res.success) {
        toast.success("Threshold benchmark berhasil dihapus");
        setEditing(false);
      } else {
        toast.error(res.error ?? "Gagal menghapus threshold");
      }
    });
  }

  function setAgePreset(min: number, max: number) {
    setCurrentAgeMin(min);
    setCurrentAgeMax(max);
  }

  if (!editing) {
    if (!hasExistingThresholds) {
      return (
        <div className="flex items-center justify-end">
          {canEdit ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/10 transition border border-accent/30"
              title="Pasang threshold benchmark baru"
            >
              <Plus className="h-3.5 w-3.5" />
              Pasang Threshold
            </button>
          ) : (
            <span className="text-xs text-muted">Belum ada threshold</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 justify-end flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <ThresholdChip label="A" value={thresholdA} color="emerald" />
          <ThresholdChip label="B" value={thresholdB} color="blue" />
          <ThresholdChip label="C" value={thresholdC} color="amber" />
          <ThresholdChip label="D" value={thresholdD} color="red" />
        </div>
        {canEdit ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted hover:text-accent hover:bg-accent/10 transition border border-border"
            title="Edit threshold"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        ) : (
          <span className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted select-none">
            Hanya Admin
          </span>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full bg-surface-1 p-3.5 rounded-xl border border-border/80 space-y-3 mt-1 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
        <span className="text-xs font-bold text-foreground font-display flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
          Atur Standar Usia, Gender &amp; Threshold Grade
        </span>
        <span className="text-[10px] text-muted">{hint}</span>
      </div>

      {/* Row 1: Gender & Age Range Config */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        {/* Gender Selection */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-foreground block">
            Target Gender Atlet:
          </label>
          <input type="hidden" name="gender" value={selectedGender} />
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setSelectedGender("ALL")}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition ${
                selectedGender === "ALL"
                  ? "bg-surface-1 text-foreground font-bold shadow-xs border border-border"
                  : "text-muted hover:text-foreground"
              }`}
            >
              🌐 Universal
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender("MALE")}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition ${
                selectedGender === "MALE"
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              👦 Putra
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender("FEMALE")}
              className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition ${
                selectedGender === "FEMALE"
                  ? "bg-pink-600 text-white font-bold shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              👧 Putri
            </button>
          </div>
        </div>

        {/* Age Range Selection */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-foreground block">
            Rentang Usia (Tahun):
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted">Min:</span>
              <input
                type="number"
                name="ageMin"
                min="0"
                max="99"
                value={currentAgeMin}
                onChange={(e) => setCurrentAgeMin(Number(e.target.value))}
                required
                className="w-12 rounded border border-border bg-surface-2 px-1.5 py-1 text-xs font-mono text-center text-foreground"
              />
            </div>
            <span className="text-muted text-xs">–</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted">Max:</span>
              <input
                type="number"
                name="ageMax"
                min="0"
                max="99"
                value={currentAgeMax}
                onChange={(e) => setCurrentAgeMax(Number(e.target.value))}
                required
                className="w-12 rounded border border-border bg-surface-2 px-1.5 py-1 text-xs font-mono text-center text-foreground"
              />
              <span className="text-[10px] text-muted">thn</span>
            </div>

            {/* Quick Age Presets */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => setAgePreset(6, 8)}
                className="px-1.5 py-0.5 rounded bg-surface-2 hover:bg-surface-3 text-[10px] text-muted hover:text-foreground border border-border"
              >
                6-8
              </button>
              <button
                type="button"
                onClick={() => setAgePreset(9, 11)}
                className="px-1.5 py-0.5 rounded bg-surface-2 hover:bg-surface-3 text-[10px] text-muted hover:text-foreground border border-border"
              >
                9-11
              </button>
              <button
                type="button"
                onClick={() => setAgePreset(12, 15)}
                className="px-1.5 py-0.5 rounded bg-surface-2 hover:bg-surface-3 text-[10px] text-muted hover:text-foreground border border-border"
              >
                12-15
              </button>
              <button
                type="button"
                onClick={() => setAgePreset(0, 99)}
                className="px-1.5 py-0.5 rounded bg-surface-2 hover:bg-surface-3 text-[10px] text-muted hover:text-foreground border border-border"
              >
                Semua
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Thresholds A/B/C/D & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-foreground">Target Nilai:</span>
          {[
            { name: "thresholdA", label: "Grade A", defaultValue: thresholdA, color: "border-emerald-500 text-emerald-500 bg-emerald-500/10" },
            { name: "thresholdB", label: "Grade B", defaultValue: thresholdB, color: "border-blue-500 text-blue-500 bg-blue-500/10" },
            { name: "thresholdC", label: "Grade C", defaultValue: thresholdC, color: "border-amber-500 text-amber-500 bg-amber-500/10" },
            { name: "thresholdD", label: "Grade D", defaultValue: thresholdD, color: "border-red-500 text-red-500 bg-red-500/10" },
          ].map((field) => (
            <div key={field.name} className="flex items-center gap-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${field.color}`}>
                {field.label}
              </span>
              <input
                type="number"
                name={field.name}
                step="0.01"
                defaultValue={field.defaultValue ?? undefined}
                required
                className="w-16 rounded border border-border bg-surface-2 px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition shadow-xs disabled:opacity-50"
            title="Simpan Perubahan Benchmark"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>Simpan</span>
          </button>

          {benchmarkId && (
            <button
              type="button"
              onClick={handleDeleteThreshold}
              disabled={isPending}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition text-xs font-semibold border border-danger/20"
              title="Hapus Nilai Threshold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => { setEditing(false); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-3 text-muted hover:text-foreground transition text-xs font-semibold border border-border"
            title="Batal"
          >
            <X className="h-3.5 w-3.5" />
            <span>Batal</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function ThresholdChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "blue" | "amber" | "red";
}) {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${colorMap[color]}`}>
      <span className="text-[9px] font-bold opacity-70">{label}</span>
      <span className="text-[11px] font-semibold">{value}</span>
    </span>
  );
}
