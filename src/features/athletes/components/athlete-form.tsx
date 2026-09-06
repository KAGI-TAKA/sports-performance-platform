"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAthlete, updateAthlete } from "../actions";
import { toast } from "sonner";
import { Loader2, Camera, Upload, Check, Zap, Sparkles } from "lucide-react";
import { ATHLETE_AVATARS } from "@/lib/avatar-presets";
import { processImageFile } from "@/lib/image-upload-helper";
import { resolveAthletePathway, type AthletePathway, PATHWAY_CONFIG } from "@/lib/athlete-pathway";

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

const LEVEL_TO_TRAINING_ENUM: Record<string, "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ELITE"> = {
  Pemula: "BEGINNER",
  Berkembang: "INTERMEDIATE",
  Lanjutan: "ADVANCED",
  Performance: "ELITE",
};

function parseInitialLevel(level?: string | null): string {
  if (!level) return "Pemula";
  if (level.includes("Performance")) return "Performance";
  if (level.includes("Lanjutan")) return "Lanjutan";
  if (level.includes("Berkembang")) return "Berkembang";
  return "Pemula";
}

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

  const [selectedSport, setSelectedSport] = useState<string>(
    initialData?.sportCategory || "Sepak Bola / Futsal"
  );
  const [selectedPathway, setSelectedPathway] = useState<AthletePathway>(() =>
    resolveAthletePathway(initialData || { sportCategory: "Sepak Bola / Futsal" })
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(() =>
    parseInitialLevel(initialData?.competitionLevel)
  );
  const [selectedCoachId, setSelectedCoachId] = useState<string>(
    initialData?.assignedCoachId || "NONE"
  );

  const isEdit = Boolean(initialData);

  const formattedDob = initialData?.dateOfBirth
    ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
    : "";

  const handleSportCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sport = e.target.value;
    setSelectedSport(sport);
    if (sport === "Multi-Sport / Atletik") {
      setSelectedPathway("MFD");
    } else {
      setSelectedPathway("YAP");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const assignedCoachVal = formData.get("assignedCoachId") as string;

    const finalCompLevel = `${selectedPathway} • ${selectedLevel}`;
    const mappedTrainingLevel = LEVEL_TO_TRAINING_ENUM[selectedLevel] || "BEGINNER";

    const data = {
      fullName: formData.get("fullName") as string,
      sportCategory: selectedSport,
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
      competitionLevel: finalCompLevel,
      trainingLevel: mappedTrainingLevel,
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

      {/* Jalur Pembinaan (Program Pathway) */}
      <div className="rounded-xl border border-border bg-surface-1/60 p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <label className="block font-bold text-foreground text-xs">
              Jalur Pembinaan (Program Pathway) <span className="text-danger">*</span>
            </label>
            <p className="text-[11px] text-muted">
              Pilih jalur platform untuk atlet. Kategorisasi tidak dikunci oleh batas usia.
            </p>
          </div>
          <span className="text-[10.5px] font-semibold text-accent px-2 py-0.5 rounded-md bg-surface-2 border border-border w-fit">
            Penentu Akses Portal Atlet
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
          {/* Card YAP */}
          <button
            type="button"
            onClick={() => setSelectedPathway("YAP")}
            className={`relative flex flex-col p-3 rounded-xl border text-left transition ${
              selectedPathway === "YAP"
                ? "border-blue-500 bg-blue-500/10 shadow-xs ring-2 ring-blue-500/20"
                : "border-border bg-surface-2 hover:bg-surface-3 opacity-75 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-400">
                <Zap className="h-3.5 w-3.5 shrink-0" />
                Youth Athlete Performance (YAP)
              </span>
              {selectedPathway === "YAP" && (
                <span className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted leading-snug">
              Atlet cabang olahraga spesifik (Sepak Bola, Basket, Bulutangkis, dll.) &amp; fokus peningkatan performa atletik. Berapapun usianya.
            </p>
          </button>

          {/* Card MFD */}
          <button
            type="button"
            onClick={() => setSelectedPathway("MFD")}
            className={`relative flex flex-col p-3 rounded-xl border text-left transition ${
              selectedPathway === "MFD"
                ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-2 ring-emerald-500/20"
                : "border-border bg-surface-2 hover:bg-surface-3 opacity-75 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="inline-flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Multilateral Development (MFD)
              </span>
              {selectedPathway === "MFD" && (
                <span className="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted leading-snug">
              Fondasi gerak multilateral, variasi motorik dasar anak, &amp; kebugaran umum tanpa spesialisasi cabang tunggal.
            </p>
          </button>
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
            value={selectedSport}
            onChange={handleSportCategoryChange}
            className="w-full min-h-[44px] sm:min-h-[48px] rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs text-foreground focus:border-accent focus:outline-none transition"
          >
            <option value="Multi-Sport / Atletik">Multi-Sport / Fondasi Umum (MFD)</option>
            <option value="Sepak Bola / Futsal">Sepak Bola / Futsal</option>
            <option value="Bola Basket">Bola Basket</option>
            <option value="Bulutangkis">Bulutangkis</option>
            <option value="Lari & Sprint">Lari &amp; Sprint</option>
            <option value="Renang">Renang</option>
            <option value="Beladiri">Beladiri (Taekwondo, Silat, dll.)</option>
            <option value="Tenis / Padel">Tenis / Padel</option>
            <option value="Lainnya">Cabang Lainnya</option>
          </select>
          <p className="mt-1.5 text-[11px] text-muted">
            {selectedPathway === "YAP" ? (
              <span className="text-blue-500 font-medium inline-flex items-center gap-1">
                <Zap className="h-3 w-3 inline" /> Terhubung ke Jalur YAP (Youth Athlete Performance)
              </span>
            ) : (
              <span className="text-emerald-500 font-medium inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 inline" /> Terhubung ke Jalur MFD (Multilateral Development)
              </span>
            )}
          </p>
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
        <div className="mt-2 flex items-center gap-2 text-[11.5px] rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-muted">
          <span>Kombinasi Status:</span>
          <span className="font-bold text-foreground inline-flex items-center gap-1.5">
            <span className={selectedPathway === "YAP" ? "text-blue-500 font-bold" : "text-emerald-500 font-bold"}>
              {selectedPathway === "YAP" ? "Jalur YAP" : "Jalur MFD"}
            </span>
            <span>·</span>
            <span>Tingkat {selectedLevel}</span>
          </span>
        </div>
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
