"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthletePosition, Gender } from "@prisma/client";
import { createAthlete, updateAthlete } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AthleteFormProps {
  initialData?: {
    id: string;
    fullName: string;
    jerseyNumber: number | null;
    position: AthletePosition;
    gender: Gender;
    dateOfBirth: Date;
    heightCm: number | null;
    weightKg: number | null;
    wingspanCm: number | null;
    competitionLevel: string | null;
  };
}

export function AthleteForm({ initialData }: AthleteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      jerseyNumber: formData.get("jerseyNumber")
        ? Number(formData.get("jerseyNumber"))
        : undefined,
      position: formData.get("position") as AthletePosition,
      gender: formData.get("gender") as Gender,
      dateOfBirth: formData.get("dateOfBirth")
        ? new Date(formData.get("dateOfBirth") as string)
        : new Date(),
      heightCm: formData.get("heightCm")
        ? Number(formData.get("heightCm"))
        : undefined,
      weightKg: formData.get("weightKg")
        ? Number(formData.get("weightKg"))
        : undefined,
      wingspanCm: formData.get("wingspanCm")
        ? Number(formData.get("wingspanCm"))
        : undefined,
      competitionLevel: (formData.get("competitionLevel") as string) || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      {error && (
        <div className="rounded-md bg-danger-bg p-3 text-xs text-danger border border-danger/30 font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block font-medium text-foreground mb-1">
          Nama Lengkap <span className="text-danger">*</span>
        </label>
        <input
          name="fullName"
          type="text"
          required
          defaultValue={initialData?.fullName}
          placeholder="cth. Rangga Pratama"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-1">
            Posisi Utama
          </label>
          <select
            name="position"
            defaultValue={initialData?.position || "UNSPECIFIED"}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          >
            <option value="UNSPECIFIED">Pilih Posisi</option>
            <option value="POINT_GUARD">Point Guard (PG)</option>
            <option value="SHOOTING_GUARD">Shooting Guard (SG)</option>
            <option value="SMALL_FORWARD">Small Forward (SF)</option>
            <option value="POWER_FORWARD">Power Forward (PF)</option>
            <option value="CENTER">Center (C)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1">
            Nomor Punggung (Jersey)
          </label>
          <input
            name="jerseyNumber"
            type="number"
            min="0"
            max="99"
            defaultValue={initialData?.jerseyNumber ?? ""}
            placeholder="cth. 23"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-1">
            Jenis Kelamin <span className="text-danger">*</span>
          </label>
          <select
            name="gender"
            required
            defaultValue={initialData?.gender || "MALE"}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          >
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1">
            Tanggal Lahir <span className="text-danger">*</span>
          </label>
          <input
            name="dateOfBirth"
            type="date"
            required
            defaultValue={formattedDob}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-medium text-foreground mb-1">
            Tinggi (cm)
          </label>
          <input
            name="heightCm"
            type="number"
            step="0.1"
            defaultValue={initialData?.heightCm ?? ""}
            placeholder="178"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1">
            Berat (kg)
          </label>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            defaultValue={initialData?.weightKg ?? ""}
            placeholder="68"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-1">
            Wingspan (cm)
          </label>
          <input
            name="wingspanCm"
            type="number"
            step="0.1"
            defaultValue={initialData?.wingspanCm ?? ""}
            placeholder="182"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-1">
          Tingkat Kompetisi / Level
        </label>
        <input
          name="competitionLevel"
          type="text"
          defaultValue={initialData?.competitionLevel ?? ""}
          placeholder="cth. Akademi Junior U-16 / DBL / Pro"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border px-4 py-2 font-medium text-secondary hover:bg-surface-2 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-accent px-5 py-2 font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isEdit ? "Update Atlet" : "Simpan Atlet"}
        </button>
      </div>
    </form>
  );
}
