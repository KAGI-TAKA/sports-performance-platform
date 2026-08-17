import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import {
  listTrainingPlans,
  listActiveAthletesForPlans,
} from "@/features/training-plans/queries";
import { TrainingPlanCard } from "@/features/training-plans/components/training-plan-card";
import { TrainingPlanDialogForm } from "@/features/training-plans/components/training-plan-dialog-form";
import { Dumbbell, LayoutGrid, User, Layers } from "lucide-react";

export default async function TrainingPlanTemplatesPage() {
  const ctx = await requireOrgContext();

  const templates = await listTrainingPlans(ctx.organizationId, { type: "TEMPLATE" });
  const athletesRaw = await listActiveAthletesForPlans(ctx.organizationId);

  const athletes = athletesRaw.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    jerseyNumber: a.jerseyNumber,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-accent" />
            Katalog Template Program Organisasi
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Kumpulan program latihan standar organisasi yang dapat digunakan kembali &amp; diresepkan ke atlet.
          </p>
        </div>

        <TrainingPlanDialogForm athletes={athletes} isTemplateDefault />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 text-xs">
        <Link
          href="/training-plans"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold bg-surface-2 text-muted hover:text-foreground transition"
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Semua Program
        </Link>
        <Link
          href="/training-plans/templates"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold bg-accent text-white shadow-xs transition"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Template Organisasi ({templates.length})
        </Link>
        <Link
          href="/training-plans?type=ATHLETE"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold bg-surface-2 text-muted hover:text-foreground transition"
        >
          <User className="h-3.5 w-3.5" />
          Khusus Atlet
        </Link>
      </div>

      {/* Grid of Templates */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 py-12 text-center">
          <Layers className="h-10 w-10 text-muted/50 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            Belum Ada Template Program Organisasi
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            Klik &quot;Buat Program Latihan&quot; di atas dan kosongkan pilihan atlet untuk membuat template standar organisasi.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((plan) => (
            <TrainingPlanCard key={plan.id} plan={plan} athletes={athletes} />
          ))}
        </div>
      )}
    </div>
  );
}
