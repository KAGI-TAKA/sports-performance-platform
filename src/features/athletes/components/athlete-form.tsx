"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAthlete, updateAthlete } from "../actions";
import { toast } from "sonner";
import { Loader2, Camera, Upload, Check } from "lucide-react";
import { ATHLETE_AVATARS } from "@/lib/avatar-presets";
import { processImageFile } from "@/lib/image-upload-helper";

export type GenderType = "MALE" | "FEMALE";

export interface AthleteFormProps {
  coaches?: Array<{ id: string; name: string; role?: string }>;
  initialData?: {
    id: string;
    fullName: string;
    sportCategory?: string | null;
    gender: GenderType;
    dateOfBirth: Date;
    heightCm: number | null;
    weightKg: number | null;
    competitionLevel: string | null;
    assignedCoachId?: string | null;
    photoUrl?: string | null;
  };
}

const TRAINING_LEVEL_OPTIONS = [
  {
    value: "Pemula",
    label: "Pemula",
    description: "Baru mulai atau belum memiliki pengalaman latihan terstruktur.",
  },
  {
    value: "Berkembang",
    label: "Berkembang",
    description: "Sudah memiliki pengalaman latihan dasar dan mulai mengikuti latihan secara rutin.",
  },
  {
    value: "Lanjutan",
    label: "Lanjutan",
    description: "Memiliki pengalaman latihan yang konsisten dan kemampuan dasar yang berkembang.",
  },
  {
    value: "Performance",
    label: "Performance",
    description: "Mengikuti latihan dengan fokus peningkatan performa fisik dan target spesifik.",
  },
];

export function AthleteForm({ initialData, coaches = [] }: AthleteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>(initialData?.photoUrl || "");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingFile(true);
      const base64 = await processImageFile(file);
      setPhotoUrl(base64);
      toast.success("Foto atlet dari perangkat berhasil dimuat!");
    } catch (err) {
      toast.error((err as Error).message || "Gagal memproses file foto.");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [selectedLevel, setSelectedLevel] = useState<string>(
    initialData?.competitionLevel || "Pemula"
  );
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    initialData?.assignedCoachId || "NONE"
  );

  const isEdit = Boolean(initialData);

  const formattedDob = initialData?.dateOfBirth
    ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const assignedCoachVal = formData.get("assignedCoachId") as string;

    const data = {
      fullName: formData.get("fullName") as string,
      sportCategory: (formData.get("sportCategory") as string) || "Multi-Sport / Atletik",
      position: "UNSPECIFIED" as const,
      gender: formData.get("gender") as GenderType,
      dateOfBirth: formData.get("dateOfBirth")
        ? new Date(formData.get("dateOfBirth") as string)
        : new Date(),
      heightCm: formData.get("heightCm")
        ? Number(formData.get("heightCm"))
        : undefined,
      weightKg: formData.get("weightKg")
        ? Number(formData.get("weightKg"))
        : undefined,
      competitionLevel: (formData.get("competitionLevel") as string) || "Pemula",
      assignedCoachId: assignedCoachVal && assignedCoachVal !== "NONE" ? assignedCoachVal : null,
      photoUrl: photoUrl.trim() || null,
    };

    try {
      let res;
      if (isEdit && initialData) {
        res = await updateAthlete({ id: initialData.id, ...data });
      } else {
        res = await createAthlete(data);
      }

      if (res.success) {
        toast.success(isEdit ? "Data atlet berhasil diperbarui" : "Atlet baru berhasil didaftarkan");
        const targetUrl = "athleteId" in res && res.athleteId ? `/athletes/${res.athleteId}` : "/athletes";
        router.push(targetUrl);
        router.refresh();
      } else {
        setError(res.error ?? "Gagal menyimpan data atlet");
        toast.error(res.error ?? "Gagal menyimpan data atlet");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data atlet.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const activeOption = TRAINING_LEVEL_OPTIONS.find((opt) => opt.value === selectedLevel);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      {error && (
        <div className="rounded-md bg-danger-bg p-3 text-xs text-danger border border-danger/30 font-medium">
          {error}
        </div>
      )}

      {/* ── Foto Profil Atlet ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
        <label className="block font-medium text-foreground text-xs">
          Foto Profil Atlet (Opsional)
        </label>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl border border-border overflow-hidden bg-surface-3 flex items-center justify-center shrink-0 shadow-2xs">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Preview Atlet"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Camera className="h-6 w-6 text-muted" />
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface-1 hover:bg-surface-3 text-xs font-semibold text-foreground shadow-2xs transition disabled:opacity-50"
              >
                {isProcessingFile ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span>Pilih File Foto Atlet dari Komputer/HP</span>
              </button>
            </div>
            {photoUrl.startsWith("data:") ? (
              <div className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium truncate">Foto atlet dari perangkat siap disimpan</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Atau tempel URL gambar (https://...)"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full min-h-[36px] rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
              />
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-muted font-medium mr-1">Preset Cepat:</span>
              {ATHLETE_AVATARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPhotoUrl(p.url)}
                  className={`flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-lg border transition ${
                    photoUrl === p.url
                      ? "border-blue-500 bg-blue-500/15 text-blue-300 font-semibold"
                      : "border-border bg-surface-1 hover:bg-surface-3 text-secondary"
                  }`}
                >
                  <img src={p.url} alt={p.label} className="h-4 w-4 rounded-md object-cover" />
                  <span>{p.label}</span>
                </button>
              ))}
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="text-[10.5px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-red-500/10 transition"
                >
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Nama Lengkap <span className="text-danger">*</span>
          </label>
          <input
            name="fullName"
            type="text"
            required
            defaultValue={initialData?.fullName}
            placeholder="cth. Rangga Pratama"
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Cabang Olahraga
          </label>
          <select
            name="sportCategory"
            defaultValue={initialData?.sportCategory || "Multi-Sport / Atletik"}
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          >
            <option value="Multi-Sport / Atletik">Multi-Sport / Atletik (Umum)</option>
            <option value="Sepak Bola / Futsal">Sepak Bola / Futsal</option>
            <option value="Bola Basket">Bola Basket</option>
            <option value="Bulutangkis">Bulutangkis</option>
            <option value="Lari & Sprint">Lari &amp; Sprint</option>
            <option value="Renang">Renang</option>
            <option value="Beladiri">Beladiri (Taekwondo, Silat, dll.)</option>
            <option value="Tenis / Padel">Tenis / Padel</option>
            <option value="Lainnya">Cabang Lainnya</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Jenis Kelamin <span className="text-danger">*</span>
          </label>
          <select
            name="gender"
            required
            defaultValue={initialData?.gender || "MALE"}
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          >
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Tanggal Lahir <span className="text-danger">*</span>
          </label>
          <input
            name="dateOfBirth"
            type="date"
            required
            defaultValue={formattedDob}
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Tinggi Badan (cm)
          </label>
          <input
            name="heightCm"
            type="number"
            step="0.1"
            defaultValue={initialData?.heightCm ?? ""}
            placeholder="165"
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Berat Badan (kg)
          </label>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            defaultValue={initialData?.weightKg ?? ""}
            placeholder="55"
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          />
        </div>
      </div>

      {/* Training Level Field */}
      <div>
        <label className="block font-medium text-foreground mb-1.5 text-xs">
          Training Level (Tingkat Pengalaman) <span className="text-danger">*</span>
        </label>
        <select
          name="competitionLevel"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-accent focus:outline-none transition"
        >
          {TRAINING_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {activeOption && (
          <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
            💡 <span className="font-semibold text-foreground">{activeOption.label}</span>: {activeOption.description}
          </p>
        )}
      </div>

      {/* Assigned Assistant Coach (Penugasan Pembinaan) */}
      {coaches.length > 0 && (
        <div>
          <label className="block font-medium text-foreground mb-1.5 text-xs">
            Asisten Pelatih Pembina (Assigned Assistant Coach)
          </label>
          <select
            name="assignedCoachId"
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-accent focus:outline-none transition"
          >
            <option value="NONE">-- Belum Ditugaskan ke Asisten Khusus (Dikelola Head Coach) --</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                👤 {c.name} {c.role === "assistant_coach" ? "(Assistant Coach)" : "(Head Coach)"}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
            Asisten pelatih yang ditugaskan akan dapat memantau data perkembangan atlet ini di direktori atlet dan catatan sesi mereka.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[44px] rounded-lg border border-border px-4 py-2.5 font-semibold text-secondary hover:bg-surface-2 transition text-xs"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] flex items-center gap-1.5 rounded-lg bg-accent px-6 py-2.5 font-semibold text-white hover:opacity-90 transition disabled:opacity-50 text-xs shadow-xs"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isEdit ? "Update Profil Atlet" : "Simpan Atlet Baru"}
        </button>
      </div>
    </form>
  );
}
