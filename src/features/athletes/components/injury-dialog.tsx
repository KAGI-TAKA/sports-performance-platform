"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAthleteInjury } from "../actions";

interface InjuryDialogProps {
  athleteId: string;
  athleteName: string;
}

export function InjuryDialog({ athleteId, athleteName }: InjuryDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      athleteId,
      injuryType: formData.get("injuryType") as string,
      description: (formData.get("description") as string) || undefined,
      injuryDate: new Date(formData.get("injuryDate") as string),
      recoveredAt: formData.get("recoveredAt")
        ? new Date(formData.get("recoveredAt") as string)
        : undefined,
      severity: (formData.get("severity") as "RINGAN" | "SEDANG" | "BERAT") || undefined,
    };

    try {
      await addAthleteInjury(data);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal mencatat riwayat cedera.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-sm border border-border-strong px-2.5 py-1 text-xs font-medium text-secondary hover:text-foreground hover:bg-surface-2"
      >
        + Catat Cedera
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface-1 p-6 shadow-xl">
            <h3 className="font-display text-base font-semibold text-foreground">
              Catat Riwayat Cedera — {athleteName}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Masukkan informasi cedera fisik yang pernah dialami atlet.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-md bg-red-950/40 p-2.5 text-xs text-red-400 border border-red-800/50">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Jenis / Nama Cedera <span className="text-red-400">*</span>
                </label>
                <input
                  name="injuryType"
                  type="text"
                  required
                  placeholder="cth. Sprain Ankle Kanan / ACL Tear"
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Tingkat Keparahan
                  </label>
                  <select
                    name="severity"
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="RINGAN">Ringan</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="BERAT">Berat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Tanggal Cedera <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="injuryDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Tanggal Sembuh / Pulih (Opsional)
                </label>
                <input
                  name="recoveredAt"
                  type="date"
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Keterangan penanganan atau batasan latihan..."
                  className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-border px-3.5 py-1.5 text-xs font-medium text-secondary hover:bg-surface-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-accent px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
