"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAthlete, updateAthlete } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export type GenderType = "MALE" | "FEMALE";

export interface AthleteFormProps {
  initialData?: {
    id: string;
    fullName: string;
    sportCategory?: string | null;
    gender: GenderType;
    dateOfBirth: Date;
    heightCm: number | null;
    weightKg: number | null;
    competitionLevel: string | null;
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

export function AthleteForm({ initialData }: AthleteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>(
    initialData?.competitionLevel || "Pemula"
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
