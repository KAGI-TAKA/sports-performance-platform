import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { AthleteForm } from "@/features/athletes/components/athlete-form";

export default async function NewAthletePage() {
  await requireOrgContext();

  return (
    <div className="mx-auto max-w-2xl p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            Tambah Atlet Baru
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Isi formulir data fisik dan identitas atlet untuk didaftarkan ke skuad.
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
        <AthleteForm />
      </div>
    </div>
  );
}
