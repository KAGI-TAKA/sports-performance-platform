"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AthletePosition, Gender } from "@prisma/client";
import { createAthlete, updateAthlete } from "../actions";

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
      if (isEdit && initialData) {
        await updateAthlete({ id: initialData.id, ...data });
      } else {
        await createAthlete(data);
      }
      router.push("/athletes");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan data atlet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-950/40 p-3 text-xs text-red-400 border border-red-800/50">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Nama Lengkap <span className="text-red-400">*</span>
        </label>
        <input
          name="fullName"
          type="text"
          required
          defaultValue={initialData?.fullName}
          placeholder="cth. Rangga Pratama"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Posisi Utama
          </label>
          <select
            name="position"
            defaultValue={initialData?.position || "UNSPECIFIED"}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
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
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Nomor Punggung (Jersey)
          </label>
          <input
            name="jerseyNumber"
            type="number"
            min="0"
            max="99"
            defaultValue={initialData?.jerseyNumber ?? ""}
            placeholder="cth. 23"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Jenis Kelamin <span className="text-red-400">*</span>
          </label>
          <select
            name="gender"
            required
            defaultValue={initialData?.gender || "MALE"}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="MALE">Laki-laki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Tanggal Lahir <span className="text-red-400">*</span>
          </label>
          <input
            name="dateOfBirth"
            type="date"
            required
            defaultValue={formattedDob}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Tinggi (cm)
          </label>
          <input
            name="heightCm"
            type="number"
            step="0.1"
            defaultValue={initialData?.heightCm ?? ""}
            placeholder="178"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Berat (kg)
          </label>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            defaultValue={initialData?.weightKg ?? ""}
            placeholder="68"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Wingspan (cm)
          </label>
          <input
            name="wingspanCm"
            type="number"
            step="0.1"
            defaultValue={initialData?.wingspanCm ?? ""}
            placeholder="182"
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Tingkat Kompetisi / Level
        </label>
        <input
          name="competitionLevel"
          type="text"
          defaultValue={initialData?.competitionLevel ?? ""}
          placeholder="cth. Akademi Junior U-16 / DBL / Pro"
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-2"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : isEdit ? "Update Atlet" : "Simpan Atlet"}
        </button>
      </div>
    </form>
  );
}
