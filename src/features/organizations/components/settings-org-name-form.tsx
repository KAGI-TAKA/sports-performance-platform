"use client";

import { useState } from "react";
import { updateOrgName } from "../actions";
import { toast } from "sonner";

interface SettingsOrgNameFormProps {
  currentName: string;
  canEdit: boolean;
}

export function SettingsOrgNameForm({ currentName, canEdit }: SettingsOrgNameFormProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updateOrgName({ name });
    setLoading(false);
    if (result.success) {
      toast.success('Nama organisasi berhasil diperbarui');
      setEditing(false);
    } else {
      toast.error(result.error ?? 'Gagal memperbarui nama');
    }
  }

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted uppercase tracking-wide block">
        Nama Organisasi
      </label>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            id="org-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-accent bg-surface-2 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
            maxLength={100}
          />
          <button
            id="save-org-name-btn"
            onClick={handleSave}
            disabled={loading || name.trim().length < 3}
            className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            id="cancel-edit-org-name-btn"
            onClick={() => { setEditing(false); setName(currentName); }}
            className="rounded-md px-3 py-2 text-xs font-medium text-muted hover:text-foreground transition"
          >
            Batal
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground">
            {name}
          </div>
          {canEdit && (
            <button
              id="edit-org-name-btn"
              onClick={() => setEditing(true)}
              className="rounded-md px-3 py-2 text-xs font-medium text-accent hover:bg-accent/10 transition"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
