"use client";

import { useState, useTransition, useRef } from "react";
import { updateBenchmark } from "../actions";
import { Check, X, Pencil, Loader2 } from "lucide-react";

interface BenchmarkEditFormProps {
  benchmarkId: string;
  thresholdA: number;
  thresholdB: number;
  thresholdC: number;
  thresholdD: number;
  scoreDirection: "HIGHER_IS_BETTER" | "LOWER_IS_BETTER";
}

export function BenchmarkEditForm({
  benchmarkId,
  thresholdA,
  thresholdB,
  thresholdC,
  thresholdD,
  scoreDirection,
}: BenchmarkEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const hint =
    scoreDirection === "HIGHER_IS_BETTER"
      ? "A > B > C > D (nilai lebih tinggi = lebih baik)"
      : "A < B < C < D (nilai lebih rendah = lebih baik)";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await updateBenchmark(benchmarkId, fd);
      if (res.success) {
        setEditing(false);
      } else {
        setError(res.error ?? "Gagal menyimpan.");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3 justify-end flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <ThresholdChip label="A" value={thresholdA} color="emerald" />
          <ThresholdChip label="B" value={thresholdB} color="blue" />
          <ThresholdChip label="C" value={thresholdC} color="amber" />
          <ThresholdChip label="D" value={thresholdD} color="red" />
        </div>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted hover:text-accent hover:bg-accent/10 transition border border-border"
          title="Edit threshold"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 items-end"
    >
      <p className="text-[10px] text-muted self-start">{hint}</p>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {[
          { name: "thresholdA", label: "A", defaultValue: thresholdA, color: "border-emerald-500/50 text-emerald-400" },
          { name: "thresholdB", label: "B", defaultValue: thresholdB, color: "border-blue-500/50 text-blue-400" },
          { name: "thresholdC", label: "C", defaultValue: thresholdC, color: "border-amber-500/50 text-amber-400" },
          { name: "thresholdD", label: "D", defaultValue: thresholdD, color: "border-red-500/50 text-red-400" },
        ].map((field) => (
          <div key={field.name} className="flex items-center gap-1">
            <span className={`text-[10px] font-bold ${field.color.split(" ")[1]}`}>{field.label}</span>
            <input
              type="number"
              name={field.name}
              step="0.01"
              defaultValue={field.defaultValue}
              required
              className={`w-16 rounded border ${field.color.split(" ")[0]} bg-surface-2 px-1.5 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent/30`}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isPending}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-success/20 text-success hover:bg-success/30 transition"
          title="Simpan"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setError(null); }}
          className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-3 text-muted hover:text-foreground transition"
          title="Batal"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && <p className="text-[11px] text-danger self-start">{error}</p>}
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
