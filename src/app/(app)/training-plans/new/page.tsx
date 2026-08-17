import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import { listActiveAthletesForPlans } from "@/features/training-plans/queries";
import { TrainingPlanDialogForm } from "@/features/training-plans/components/training-plan-dialog-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewTrainingPlanPage() {
  const ctx = await requireOrgContext();
  const athletesRaw = await listActiveAthletesForPlans(ctx.organizationId);

  const athletes = athletesRaw.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    jerseyNumber: a.jerseyNumber,
  }));

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-border/60">
        <Link href="/training-plans">
          <Button variant="outline" size="xs" className="gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            Buat Program Latihan Baru
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Susun menu gerakan latihan khusus untuk atlet atau buat template program organisasi.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Formulir Pembuatan Program
            </span>
          </div>

          <TrainingPlanDialogForm athletes={athletes} triggerText="+ Form Pembuatan Program Latihan" />
        </CardContent>
      </Card>
    </div>
  );
}
