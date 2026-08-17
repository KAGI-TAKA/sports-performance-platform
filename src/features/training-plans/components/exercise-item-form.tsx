"use client";

import { useState, useTransition } from "react";
import { addExerciseToPlan, deleteExercise } from "../actions";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Dumbbell,
  ListOrdered,
  Clock,
  Loader2,
} from "lucide-react";

interface ExerciseItem {
  id: string;
  name: string;
  category: string | null;
  sets: number | null;
  reps: string | null;
  restSeconds: number | null;
  notes: string | null;
  order: number;
}

const CATEGORY_OPTIONS = [
  "Plyometrics",
  "Core & Balance",
  "Lower Body Strength",
  "Upper Body Strength",
  "Speed & Agility",
  "Mobility & Flexibility",
  "Endurance",
  "Lainnya",
];

export function ExerciseItemForm({
  planId,
  exercises,
}: {
  planId: string;
  exercises: ExerciseItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAddExercise(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await addExerciseToPlan(planId, formData);
      if (res.success) {
        toast.success("Gerakan latihan berhasil ditambahkan");
        form.reset();
        setIsOpen(false);
      } else {
        toast.error(res.error ?? "Gagal menambahkan gerakan");
      }
    });
  }

  async function handleDeleteExercise(exerciseId: string, name: string) {
    if (!confirm(`Hapus gerakan "${name}" dari program ini?`)) return;

    startTransition(async () => {
      const res = await deleteExercise(exerciseId, planId);
      if (res.success) {
        toast.success("Gerakan latihan dihapus");
      } else {
        toast.error(res.error ?? "Gagal menghapus gerakan");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Header bar & Add Button */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-accent" />
          <h2 className="font-display text-sm font-bold text-foreground">
            Daftar Menu Latihan ({exercises.length})
          </h2>
        </div>

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-3 transition"
          >
            <Plus className="h-3.5 w-3.5 text-accent" />
            Tambah Gerakan Latihan
          </button>
        )}
      </div>

      {/* Inline Form to Add Exercise */}
      {isOpen && (
        <form
          onSubmit={handleAddExercise}
          className="rounded-xl border border-accent/30 bg-surface-2/40 p-4 space-y-3 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between font-semibold text-foreground border-b border-border/50 pb-2">
            <span>Input Gerakan Latihan Baru</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">
                Nama Gerakan Latihan *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Misal: Single-Leg Box Jump"
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">
                Kategori Latihan
              </label>
              <select
                name="category"
                defaultValue="Plyometrics"
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">
                Set (Misal: 3)
              </label>
              <input
                type="number"
                name="sets"
                min="1"
                defaultValue="3"
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-foreground font-mono focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted font-medium mb-1">
                Repetisi / Durasi
              </label>
              <input
                type="text"
                name="reps"
                placeholder="10 reps / 30 detik"
                defaultValue="10 reps"
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted font-medium mb-1">
                Istirahat (Detik)
              </label>
              <input
                type="number"
                name="restSeconds"
                min="0"
                defaultValue="60"
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-foreground font-mono focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">
              Catatan / Instruksi Teknik (Opsional)
            </label>
            <input
              type="text"
              name="notes"
              placeholder="Fokus pendaratan soft landing, lutut tidak masuk ke dalam"
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 font-medium text-secondary hover:bg-surface-3 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Tambah Gerakan
            </button>
          </div>
        </form>
      )}

      {/* Exercises Table / List */}
      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
        {exercises.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs">
            <Dumbbell className="mx-auto h-8 w-8 text-muted/40 mb-2" />
            <p className="font-semibold text-foreground">
              Belum Ada Gerakan Latihan Ditambahkan
            </p>
            <p className="mt-1">
              Klik &quot;Tambah Gerakan Latihan&quot; untuk mengisi menu latihan program ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border text-xs">
            {exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-3.5 hover:bg-surface-2/40 transition"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent font-mono font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">
                        {ex.name}
                      </span>
                      {ex.category && (
                        <span className="rounded bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                          {ex.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-muted font-mono text-[11px]">
                      {ex.sets != null && <span>{ex.sets} Set</span>}
                      {ex.reps && <span>× {ex.reps}</span>}
                      {ex.restSeconds != null && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="h-3 w-3" /> Rest {ex.restSeconds}s
                        </span>
                      )}
                    </div>

                    {ex.notes && (
                      <p className="text-[11px] text-muted italic">
                        &quot;{ex.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <button
                  disabled={isPending}
                  onClick={() => handleDeleteExercise(ex.id, ex.name)}
                  className="p-1 rounded text-muted hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0 ml-3"
                  title="Hapus Gerakan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
