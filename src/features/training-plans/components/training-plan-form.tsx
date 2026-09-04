"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTrainingPlan } from "../actions";
import { toast } from "sonner";
import { Dumbbell, User, AlignLeft, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
}

export function TrainingPlanForm({
  athletes,
  defaultAthleteId = "NONE",
}: {
  athletes: AthleteOption[];
  defaultAthleteId?: string;
}) {
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
        router.push(`/training-plans/${result.planId}`);
      } else {
        toast.error(result.error ?? "Gagal membuat program latihan");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Judul Program */}
      <div className="space-y-1.5">
        <label className="block text-foreground font-semibold">
          Judul Program Latihan <span className="text-rose-500">*</span>
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
      <div className="space-y-1.5">
        <label className="block text-foreground font-semibold flex items-center gap-1">
          <User className="h-3.5 w-3.5 text-accent" />
          Target Program
        </label>
        <select
          name="athleteId"
          defaultValue={defaultAthleteId}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        >
          <option value="NONE">
            ✨ Template Organisasi (Dapat digunakan &amp; diresepkan ke semua atlet)
          </option>
          <optgroup label="Khusus Atlet">
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} {a.jerseyNumber != null ? `(#${a.jerseyNumber})` : ""}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <label className="block text-foreground font-semibold flex items-center gap-1">
          <AlignLeft className="h-3.5 w-3.5 text-accent" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-foreground font-semibold flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted" />
            Tgl Mulai (Opsional)
          </label>
          <input
            type="date"
            name="startDate"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-foreground font-semibold flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted" />
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
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
        <Link href="/training-plans">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
            Batal
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isPending}
          size="sm"
          className="h-8 text-xs gap-1.5 bg-accent hover:bg-accent/90 text-white font-semibold"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Dumbbell className="h-3.5 w-3.5" />}
          Buat &amp; Tambah Gerakan Latihan
        </Button>
      </div>
    </form>
  );
}
