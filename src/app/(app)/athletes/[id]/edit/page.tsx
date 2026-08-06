import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteById } from "@/features/athletes/queries";
import { AthleteForm } from "@/features/athletes/components/athlete-form";

export default async function EditAthletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const athlete = await getAthleteById(ctx.organizationId, id);
  if (!athlete) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Edit Profil Atlet
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Perbarui data fisik atau data pribadi atlet {athlete.fullName}.
          </p>
        </div>
        <Link
          href={`/athletes?athleteId=${athlete.id}`}
          className="text-xs text-secondary hover:text-foreground"
        >
          ← Kembali ke Detail
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6">
        <AthleteForm
          initialData={{
            id: athlete.id,
            fullName: athlete.fullName,
            jerseyNumber: athlete.jerseyNumber,
            position: athlete.position,
            gender: athlete.gender,
            dateOfBirth: athlete.dateOfBirth,
            heightCm: athlete.heightCm ? Number(athlete.heightCm) : null,
            weightKg: athlete.weightKg ? Number(athlete.weightKg) : null,
            wingspanCm: athlete.wingspanCm ? Number(athlete.wingspanCm) : null,
            competitionLevel: athlete.competitionLevel,
          }}
        />
      </div>
    </div>
  );
}
