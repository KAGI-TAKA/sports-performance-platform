"use client";

import { useState, useTransition } from "react";
import { createSessionLog } from "../actions";
import { toast } from "sonner";
import {
  Plus,
  X,
  ClipboardCheck,
  User,
  Calendar,
  Activity,
  MessageSquare,
  Video,
  Loader2,
} from "lucide-react";

interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
}

export function SessionLogDialogForm({
  athletes,
  defaultAthleteId,
}: {
  athletes: AthleteOption[];
  defaultAthleteId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const todayStr = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createSessionLog(formData);
      if (result.success) {
        toast.success("Catatan sesi harian berhasil disimpan");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "Gagal menyimpan catatan sesi");
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
        Catat Sesi Harian
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-5 shadow-xl transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-accent" />
                <h2 className="font-display text-base font-bold text-foreground">
                  Input Catatan Sesi Latihan Harian
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
              {/* Atlet */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Atlet *
                </label>
                <select
                  name="athleteId"
                  defaultValue={defaultAthleteId ?? athletes[0]?.id ?? ""}
                  required
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName}{" "}
                      {a.jerseyNumber != null ? `#${a.jerseyNumber}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Latihan */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Tanggal Latihan *
                </label>
                <input
                  type="date"
                  name="sessionDate"
                  defaultValue={todayStr}
                  required
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Aktivitas Latihan Hari Ini */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  Aktivitas &amp; Latihan Hari Ini *
                </label>
                <textarea
                  name="activitiesDone"
                  required
                  rows={3}
                  placeholder="Misal: Dribble Crossover 3x50m, Defensive Slide 4x30s, Form Shooting 100x"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Evaluasi / Feedback Pelatih */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Evaluasi / Feedback Pelatih (Opsional)
                </label>
                <textarea
                  name="coachFeedback"
                  rows={2}
                  placeholder="Keseimbangan sudah membaik, fokus pendaratan kaki kiri perlu dilatih lagi."
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Link Video Rekaman */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" />
                  Link Video Rekaman Latihan (Opsional)
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  placeholder="https://youtube.com/watch?v=... atau link video Supabase"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Actions */}
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
