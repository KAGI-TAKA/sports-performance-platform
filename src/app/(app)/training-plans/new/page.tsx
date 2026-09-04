import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { listActiveAthletesForPlans } from "@/features/training-plans/queries";
import { TrainingPlanForm } from "@/features/training-plans/components/training-plan-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell } from "lucide-react";

interface NewTrainingPlanPageProps {
  searchParams: Promise<{ athleteId?: string }>;
}

export default async function NewTrainingPlanPage({ searchParams }: NewTrainingPlanPageProps) {
  const ctx = await requireOrgContext();
  const { athleteId } = await searchParams;
  const athletesRaw = await listActiveAthletesForPlans(ctx.organizationId);

  const athletes = athletesRaw.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    jerseyNumber: a.jerseyNumber,
  }));

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-border/60">
        <Link href="/training-plans">
          <Button variant="outline" size="xs" className="gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-accent" />
            Buat Program Latihan Baru
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Susun menu gerakan latihan khusus untuk atlet atau buat template program organisasi.
          </p>
        </div>
      </div>

      <Card className="border border-border bg-surface-1 shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Formulir Program Latihan
            </span>
            <span className="text-[11px] text-muted">
              {athleteId ? "Target: Atlet Terpilih" : "Template / Atlet"}
            </span>
          </div>

          <TrainingPlanForm athletes={athletes} defaultAthleteId={athleteId || "NONE"} />
        </CardContent>
      </Card>
    </div>
  );
}

