import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { getAthleteById, listAthletes } from "@/features/athletes/queries";
import { listTestItems } from "@/features/assessments/queries";
import { AssessmentWizard } from "@/features/assessments/components/assessment-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, AlertTriangle } from "lucide-react";

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
    const { athletes } = await listAthletes(ctx.organizationId, { status: "active" });

    return (
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-border/60">
          <Link href="/assessments">
            <Button variant="outline" size="xs" className="gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
              Mulai Assessment Baru
            </h1>
            <p className="mt-0.5 text-xs text-muted">
              Pilih atlet aktif yang akan diuji fisik untuk menginputkan nilai tes.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {athletes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <p className="text-xs text-muted">
                  Belum ada atlet aktif terdaftar di organisasi ini.
                </p>
                <Link href="/athletes/new">
                  <Button size="sm" className="bg-accent text-white font-semibold">
                    + Tambah Atlet Pertama
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            athletes.map((a) => (
              <Link
                key={a.id}
                href={`/assessments/new?athleteId=${a.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-1 hover:border-accent hover:bg-surface-2/60 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent font-bold text-xs">
                    {a.fullName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                      {a.fullName}
                    </div>
                    <div className="text-xs text-muted">
                      {a.position !== "UNSPECIFIED" ? a.position.replace(/_/g, " ") : "Posisi —"}
                      {a.jerseyNumber != null && ` · #${a.jerseyNumber}`}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="xs" className="gap-1 text-accent">
                  Mulai Tes <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ))
          )}
        </div>
      </div>
    );
  }

  const athlete = await getAthleteById(ctx.organizationId, athleteId);
  if (!athlete) notFound();

  if (!athlete.isActive) {
    return (
      <div className="mx-auto max-w-md p-8 text-center space-y-4">
        <Card className="border-warning/30 bg-warning-bg/40 p-6 space-y-3">
          <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
          <h2 className="text-base font-bold text-foreground">Atlet Status Nonaktif</h2>
          <p className="text-xs text-muted">
            Assessment baru hanya dapat dibuat untuk atlet yang berstatus aktif. Silakan aktifkan kembali atlet ini dari profilnya.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href="/assessments/new">
              <Button variant="outline" size="xs">Pilih Atlet Lain</Button>
            </Link>
            <Link href={`/athletes/${athlete.id}`}>
              <Button size="xs" className="bg-accent text-white">Buka Profil Atlet</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px]">
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
