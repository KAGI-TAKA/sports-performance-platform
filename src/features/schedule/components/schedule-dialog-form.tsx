"use client";

import { useState, useTransition } from "react";
import { createScheduleSession } from "../actions";
import { toast } from "sonner";
import { Plus, X, Calendar, Clock, User, Users, MapPin, AlignLeft, Loader2 } from "lucide-react";

interface CoachOption {
  id: string;
  name: string;
}

interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string;
}

export function ScheduleDialogForm({
  coaches,
  athletes,
}: {
  coaches: CoachOption[];
  athletes: AthleteOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Selected athletes state
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    coaches[0]?.id ?? ""
  );

  // Default times: today at next hour
  const now = new Date();
  const defaultDateStr = now.toISOString().split("T")[0];
  const defaultStartTimeStr = `${defaultDateStr}T15:00`;
  const defaultEndTimeStr = `${defaultDateStr}T16:00`;

  function toggleAthlete(id: string) {
    setSelectedAthleteIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (selectedAthleteIds.length === 0) {
      toast.error("Pilih minimal 1 atlet");
      return;
    }

    // Append selected athlete IDs
    selectedAthleteIds.forEach((id) => formData.append("athleteIds", id));
    formData.set("coachId", selectedCoachId);

    startTransition(async () => {
      const result = await createScheduleSession(formData);
      if (result.success) {
        toast.success("Jadwal sesi latihan berhasil dibuat");
        setIsOpen(false);
        setSelectedAthleteIds([]);
        form.reset();
      } else {
        toast.error(result.error ?? "Gagal membuat jadwal");
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
        Tambah Jadwal Sesi
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface-1 p-5 shadow-xl transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <h2 className="font-display text-base font-bold text-foreground">
                  Buat Jadwal Sesi Latihan
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
              {/* Judul Sesi */}
              <div>
                <label className="block text-muted font-medium mb-1">
                  Judul / Jenis Sesi *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Misal: Private Training - Fundamental Speed & Agility"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Pelatih */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Pelatih *
                </label>
                <select
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                >
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Atlet (Multi-Select for Private 1-on-1 or Small Group 2-3 kids) */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Pilih Atlet (1-on-1 atau Grup Kecil) *
                </label>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-surface-2/60 p-2 space-y-1 divide-y divide-border/30">
                  {athletes.length === 0 ? (
                    <p className="text-muted text-center py-2">
                      Belum ada atlet terdaftar
                    </p>
                  ) : (
                    athletes.map((a) => {
                      const isSelected = selectedAthleteIds.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-surface-3 cursor-pointer transition select-none"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAthlete(a.id)}
                              className="rounded border-border text-accent focus:ring-accent"
                            />
                            <span className="font-semibold text-foreground">
                              {a.fullName}
                            </span>
                            {a.jerseyNumber != null && (
                              <span className="text-[10px] text-muted font-mono">
                                #{a.jerseyNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted">
                            {a.position !== "UNSPECIFIED"
                              ? a.position.replace(/_/g, " ")
                              : ""}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                {selectedAthleteIds.length > 0 && (
                  <p className="mt-1 text-[11px] text-accent font-medium">
                    {selectedAthleteIds.length} atlet terpilih (
                    {selectedAthleteIds.length === 1
                      ? "Private 1-on-1"
                      : `Grup ${selectedAthleteIds.length} anak`}
                    )
                  </p>
                )}
              </div>

              {/* Waktu Sesi (Start & End) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Waktu Mulai *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    defaultValue={defaultStartTimeStr}
                    required
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Waktu Selesai *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    defaultValue={defaultEndTimeStr}
                    required
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Misal: Power Up Gym / Lapangan B"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Catatan Sesi */}
              <div>
                <label className="block text-muted font-medium mb-1 flex items-center gap-1">
                  <AlignLeft className="h-3.5 w-3.5" />
                  Catatan Sesi (Opsional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Fokus instruksi, alat yang disiapkan, dsb."
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-foreground focus:border-accent focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
