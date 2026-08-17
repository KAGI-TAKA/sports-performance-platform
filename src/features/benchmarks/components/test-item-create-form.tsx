"use client";

import { useState } from "react";
import { createTestItem } from "./../actions";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface TestItemCreateFormProps {
  physicalComponent: string;
  canCreate: boolean;
}

export function TestItemCreateForm({ physicalComponent, canCreate }: TestItemCreateFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!canCreate) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await createTestItem(fd);
    setLoading(false);
    
    if (result.success) {
      toast.success("Item tes berhasil ditambahkan");
      setExpanded(false);
    } else {
      toast.error(result.error ?? "Gagal menambahkan item tes");
    }
  }

  if (!expanded) {
    return (
      <div className="px-5 py-3 bg-surface-2/20">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-xs font-medium text-muted hover:text-accent transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Item Tes
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 bg-surface-2/30 border-t border-border">
      <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
        <input type="hidden" name="physicalComponent" value={physicalComponent} />
        
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide">Nama Item</label>
          <input
            name="name"
            required
            placeholder="Contoh: Sprint 20m"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-1 w-32">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide">Satuan</label>
          <select
            name="unit"
            required
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="CM">CM</option>
            <option value="M">Meter</option>
            <option value="KG">KG</option>
            <option value="SECOND">Detik</option>
            <option value="REPETITION">Repetisi</option>
            <option value="ML_KG_MIN">mL/kg/min</option>
            <option value="SCORE">Skor</option>
          </select>
        </div>

        <div className="space-y-1 w-44">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide">Tipe Tes</label>
          <select
            name="testType"
            required
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="NUMERIC">Pengukuran Numerik</option>
            <option value="QUALITATIVE">Rubrik Teknik / Kualitatif</option>
          </select>
        </div>

        <div className="space-y-1 w-44">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide">Arah Nilai</label>
          <select
            name="scoreDirection"
            required
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="HIGHER_IS_BETTER">Tinggi = Baik</option>
            <option value="LOWER_IS_BETTER">Rendah = Baik</option>
          </select>
        </div>

        <div className="space-y-1 w-20">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide" title="Menentukan urutan item saat ditampilkan pada formulir assessment">
            Urutan
          </label>
          <input
            name="order"
            type="number"
            defaultValue={99}
            required
            title="Menentukan urutan item saat ditampilkan pada formulir assessment"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-3 text-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
