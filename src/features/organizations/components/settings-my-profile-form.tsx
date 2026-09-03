"use client";

import { useState, useRef } from "react";
import { updateMyProfile } from "@/features/user-management/actions";
import { toast } from "sonner";
import { Camera, User as UserIcon, Check, Shield, Upload, Loader2 } from "lucide-react";
import { COACH_AVATARS } from "@/lib/avatar-presets";
import { processImageFile } from "@/lib/image-upload-helper";

interface SettingsMyProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialImage?: string | null;
  role: string;
}

export function SettingsMyProfileForm({
  initialName,
  initialEmail,
  initialImage,
  role,
}: SettingsMyProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage || "");
  const [loading, setLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      const base64 = await processImageFile(file);
      setImage(base64);
      toast.success("Foto dari perangkat berhasil dimuat!");
    } catch (err) {
      toast.error((err as Error).message || "Gagal memproses file foto.");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setIsSaved(false);

    const res = await updateMyProfile({
      name: name.trim(),
      image: image.trim() || null,
    });

    setLoading(false);
    if (res.success) {
      setIsSaved(true);
      toast.success("Profil akun Anda berhasil diperbarui!");
      setTimeout(() => setIsSaved(false), 3000);
    } else {
      toast.error(res.error || "Gagal memperbarui profil.");
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-border bg-surface-2/60">
        <div className="relative h-16 w-16 rounded-2xl border border-border overflow-hidden bg-surface-3 flex items-center justify-center shrink-0 shadow-sm">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover rounded-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-bold text-lg text-foreground">
              {name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "ME"}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2 w-full">
          <label className="text-xs font-semibold text-foreground block">
            Foto Profil (Upload File atau URL Gambar)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-3 text-xs font-semibold text-foreground shadow-2xs transition disabled:opacity-50"
            >
              {isProcessingFile ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              ) : (
                <Upload className="h-3.5 w-3.5 text-blue-500" />
              )}
              <span>Upload dari Perangkat / File Foto</span>
            </button>

            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded hover:bg-red-500/10 transition shrink-0"
              >
                Hapus Foto
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {image.startsWith("data:") ? (
              <div className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium truncate">Foto dari perangkat siap disimpan</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Atau tempel URL gambar (https://...)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            )}
          </div>
          <p className="text-[11px] text-muted">
            Foto ini akan langsung tampil di portal rapor atlet &amp; orang tua serta direktori tim pelatih.
          </p>
        </div>
      </div>

      {/* Preset avatar selector */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wide block">
          Pilih dari Template Avatar
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {COACH_AVATARS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setImage(p.url)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition ${
                image === p.url
                  ? "border-blue-500 bg-blue-500/15 text-blue-300 font-semibold"
                  : "border-border bg-surface-2 text-secondary hover:text-foreground hover:bg-surface-3"
              }`}
            >
              <img src={p.url} alt={p.label} className="h-4 w-4 rounded-full object-cover" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide block">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted uppercase tracking-wide block">
            Alamat Email Akun
          </label>
          <input
            type="email"
            value={initialEmail}
            disabled
            className="w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs font-mono text-muted cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-xs text-secondary">
          <Shield className="h-3.5 w-3.5 text-blue-500" />
          <span>Role: <strong>{role === "admin" ? "Admin / Owner" : role === "head_coach" ? "Head Coach" : "Asisten Pelatih"}</strong></span>
        </div>

        <button
          type="submit"
          disabled={loading || name.trim().length < 2}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50"
        >
          {isSaved ? (
            <>
              <Check className="h-3.5 w-3.5 text-white" />
              Tersimpan
            </>
          ) : loading ? (
            "Menyimpan..."
          ) : (
            "Simpan Profil Saya"
          )}
        </button>
      </div>
    </form>
  );
}
