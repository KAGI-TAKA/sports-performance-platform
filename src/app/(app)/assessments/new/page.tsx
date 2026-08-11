import { notFound, redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteById, listAthletes } from "@/features/athletes/queries";
import { listTestItems } from "@/features/assessments/queries";
import { AssessmentWizard } from "@/features/assessments/components/assessment-wizard";
import Link from "next/link";

export default async function NewAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ athleteId?: string }>;
}) {
  const { athleteId } = await searchParams;
  const ctx = await requireOrgContext();

  const testItemsRaw = await listTestItems(ctx.organizationId);

  const testItems = testItemsRaw.map((t) => ({
    id: t.id,
    physicalComponent: t.physicalComponent,
    name: t.name,
    unit: t.unit,
    scoreDirection: t.scoreDirection,
    benchmarks: t.benchmarks.map((b) => ({
      thresholdA: Number(b.thresholdA),
      thresholdB: Number(b.thresholdB),
      thresholdC: Number(b.thresholdC),
      thresholdD: Number(b.thresholdD),
    })),
  }));

  if (!athleteId) {
   const { athletes } = await listAthletes(ctx.organizationId);

    return (
      <div className="mx-auto max-w-xl p-7">
        <h1 className="font-display text-lg font-semibold text-foreground">
          Mulai Assessment Baru
        </h1>
        <p className="mt-1 text-xs text-muted">
          Pilih atlet yang akan diuji fisik untuk memulai penginputan hasil tes.
        </p>

        <div className="mt-6 space-y-2">
          {athletes.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface-1 p-6 text-center text-sm text-muted">
              Belum ada atlet terdaftar.{" "}
              <Link href="/athletes/new" className="text-accent underline">
                Tambah atlet pertama
              </Link>
            </div>
          ) : (
            athletes.map((a) => (
              <Link
                key={a.id}
                href={`/assessments/new?athleteId=${a.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-1 p-4 hover:border-accent hover:bg-surface-2 transition"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {a.fullName}
                  </div>
                  <div className="text-xs text-muted">
                    {a.position.replace("_", " ")}
                  </div>
                </div>
                <span className="text-xs font-semibold text-accent">
                  Mulai Tes →
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    );
  }

  const athlete = await getAthleteById(ctx.organizationId, athleteId);
  if (!athlete) notFound();

  return (
    <div className="p-7">
      <AssessmentWizard
        athlete={{
          id: athlete.id,
          fullName: athlete.fullName,
          position: athlete.position,
        }}
        testItems={testItems}
      />
    </div>
  );
}
