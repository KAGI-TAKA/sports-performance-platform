"use client";

import { useState, useTransition } from "react";
import { createCoachGuidance } from "../actions";
import { toast } from "sonner";
import {
  Plus,
  X,
  Sparkles,
  Link as LinkIcon,
  User,
  Users,
  Loader2,
  Pin,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AthleteOption {
  id: string;
  fullName: string;
}

export function GuidanceDialogForm({
  athletes = [],
  defaultAthleteId,
  triggerText = "Tambah Informasi / Saran Edukasi",
}: {
  athletes?: AthleteOption[];
  defaultAthleteId?: string;
  triggerText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [targetMode, setTargetMode] = useState<"ALL" | "SINGLE" | "MULTIPLE">(
    defaultAthleteId ? "SINGLE" : "ALL"
  );
  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    defaultAthleteId || athletes[0]?.id || ""
  );
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>(
    defaultAthleteId ? [defaultAthleteId] : []
  );

  function handleToggleMulti(id: string) {
    setSelectedMultiIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set("targetType", targetMode);
    if (targetMode === "SINGLE") {
      formData.set("athleteId", selectedSingleId);
    } else if (targetMode === "MULTIPLE") {
      formData.delete("athleteIds");
      for (const id of selectedMultiIds) {
        formData.append("athleteIds", id);
      }
      if (selectedMultiIds.length === 0) {
        toast.error("Pilih setidaknya 1 atlet untuk target penerima.");
        return;
      }
    } else {
      formData.set("athleteId", "ALL");
    }

    startTransition(async () => {
      const res = await createCoachGuidance(formData);
      if (res.success) {
        toast.success("Informasi/Saran berhasil dipublikasikan ke Portal Klien!");
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(res.error ?? "Gagal mempublikasikan informasi");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition shadow-xs"
      >
        <Plus className="h-4 w-4" />
        <span>{triggerText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    Publikasikan Informasi / Berita Edukasi
                  </h3>
                  <p className="text-[11px] text-muted">
                    Akan tampil di Portal Klien (Orang Tua &amp; Atlet)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Judul */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Judul Informasi / Berita <span className="text-danger">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Misal: Panduan Menu Nutrisi & Hidrasi Sebelum Lomba"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Kategori Informasi
                </label>
                <select
                  name="category"
                  defaultValue="NUTRISI"
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="NUTRISI">🍎 Nutrisi &amp; Hidrasi</option>
                  <option value="LATIHAN_MANDIRI">🏃 Latihan Mandiri / Drills</option>
                  <option value="PENGUMUMAN">📢 Pengumuman Jadwal &amp; Event</option>
                  <option value="KESEHATAN">🩹 Pemulihan &amp; Pencegahan Cedera</option>
                  <option value="MOTIVASI">🔥 Motivasi &amp; Mindset Atlet</option>
                </select>
              </div>

              {/* Target Penerima Mode Selector */}
              <div className="space-y-2 rounded-xl bg-surface-2/60 p-3 border border-border/80">
                <label className="block font-bold text-foreground">
                  Target Penerima:
                </label>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setTargetMode("ALL")}
                    className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition ${
                      targetMode === "ALL"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    📢 Semua (Publik)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode("SINGLE")}
                    className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition ${
                      targetMode === "SINGLE"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    👤 1 Atlet Khusus
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode("MULTIPLE")}
                    className={`py-1.5 px-2 rounded-md font-semibold text-[11px] transition ${
                      targetMode === "MULTIPLE"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    👥 Beberapa Atlet
                  </button>
                </div>

                {/* Single Athlete Dropdown */}
                {targetMode === "SINGLE" && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[11px] text-muted mb-1">
                      Pilih Atlet Target:
                    </label>
                    <select
                      value={selectedSingleId}
                      onChange={(e) => setSelectedSingleId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs font-semibold text-foreground focus:border-accent focus:outline-none"
                    >
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          👤 {a.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Multiple Athletes Checkbox List */}
                {targetMode === "MULTIPLE" && (
                  <div className="pt-2 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>Pilih Atlet ({selectedMultiIds.length} terpilih):</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMultiIds(
                            selectedMultiIds.length === athletes.length
                              ? []
                              : athletes.map((a) => a.id)
                          )
                        }
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        {selectedMultiIds.length === athletes.length
                          ? "Batal Pilih Semua"
                          : "Pilih Semua"}
                      </button>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-border bg-surface-1 p-2">
                      {athletes.map((a) => {
                        const isChecked = selectedMultiIds.includes(a.id);
                        return (
                          <label
                            key={a.id}
                            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface-2 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleMulti(a.id)}
                              className="rounded border-border accent-indigo-600 h-3.5 w-3.5"
                            />
                            <span className="text-xs font-medium text-foreground">
                              {a.fullName}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Isi Pesan / Artikel */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Isi Pesan / Saran Pelatih <span className="text-danger">*</span>
                </label>
                <textarea
                  name="content"
                  required
                  rows={5}
                  placeholder="Tuliskan saran nutrisi, instruksi peregangan di rumah, atau pesan penting yang ingin disampaikan kepada orang tua dan atlet..."
                  className="w-full rounded-lg border border-border bg-surface-2 p-3 text-xs text-foreground focus:border-accent focus:outline-none leading-relaxed"
                />
              </div>

              {/* Link URL Tambahan */}
              <div>
                <label className="block font-medium text-foreground mb-1 flex items-center gap-1">
                  <LinkIcon className="h-3.5 w-3.5 text-muted" />
                  <span>Link Referensi / Video Tambahan (Opsional)</span>
                </label>
                <input
                  name="linkUrl"
                  type="url"
                  placeholder="https://instagram.com/p/... atau https://youtube.com/..."
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  name="isPinned"
                  id="isPinned"
                  type="checkbox"
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="isPinned" className="text-xs text-foreground font-medium flex items-center gap-1 cursor-pointer select-none">
                  <Pin className="h-3.5 w-3.5 text-amber-500" />
                  Sematkan di Paling Atas (*Pin to Top*)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-secondary hover:bg-surface-2 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Publikasikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
