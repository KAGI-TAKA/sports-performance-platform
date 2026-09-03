import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { listCoachesForOrg } from "@/features/schedule/queries";
import { AthleteForm } from "@/features/athletes/components/athlete-form";

export default async function NewAthletePage() {
  const ctx = await requireOrgContext();
  if (ctx.role !== "admin" && ctx.role !== "head_coach") {
    redirect("/athletes");
  }

  const coachesRaw = await listCoachesForOrg(ctx.organizationId);
  const coaches = coachesRaw.map((m) => ({
    id: m.id,
    name: m.user.name ?? "Pelatih",
    role: m.role,
  }));

  return (
    <div className="mx-auto max-w-2xl p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Tambah Atlet Baru
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Isi formulir data fisik dan identitas atlet untuk didaftarkan ke sistem pembinaan.
          </p>
        </div>
        <Link
          href="/athletes"
          className="text-xs text-secondary hover:text-foreground"
        >
          ← Kembali ke Daftar Atlet
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6">
        <AthleteForm coaches={coaches} />
      </div>
    </div>
  );
}
