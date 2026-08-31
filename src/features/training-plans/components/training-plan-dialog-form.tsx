"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTrainingPlan } from "../actions";
import { toast } from "sonner";
import { Plus, X, Dumbbell, User, AlignLeft, Calendar, Loader2 } from "lucide-react";

interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
}

export function TrainingPlanDialogForm({
  athletes,
  triggerText = "Buat Program Latihan",
  isTemplateDefault = false,
}: {
  athletes: AthleteOption[];
  triggerText?: string;
  isTemplateDefault?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createTrainingPlan(formData);
      if (result.success && result.planId) {
        toast.success("Program latihan berhasil dibuat");
        setIsOpen(false);
        form.reset();
        router.push(`/training-plans/${result.planId}`);
      } else {
        toast.error(result.error ?? "Gagal membuat program latihan");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, hsl(230 85% 58%), hsl(250 80% 65%))",
        }}
      >
        <Plus className="h-4 w-4" />
        {triggerText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-5 shadow-xl transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-accent" />
                <h2 className="font-display text-base font-bold text-foreground">
                  Program Latihan Baru
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Judul Program */}
              <div>
                <label className="block text-muted font-medium mb-1">
                  Judul Program Latihan *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Misal: Program Penguatan Ankle & Landing Form 4 Minggu"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Target Program (Template Organisasi vs Atlet Spesifik) */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Target Program
                </label>
                <select
                  name="athleteId"
                  defaultValue={isTemplateDefault ? "NONE" : "NONE"}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="NONE">
                    ✨ Template Organisasi (Dapat digunakan semua atlet)
                  </option>
                  <optgroup label="Khusus Atlet">
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <AlignLeft className="h-3.5 w-3.5" />
                  Deskripsi / Tujuan Program (Opsional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Fokus pengembangan, kriteria ketercapaian, instruksi khusus."
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Tgl Mulai (Opsional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Tgl Selesai (Opsional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 font-medium text-secondary hover:bg-surface-2 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Buat &amp; Tambah Gerakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
