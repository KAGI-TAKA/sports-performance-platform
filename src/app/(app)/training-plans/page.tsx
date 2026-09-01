import Link from "next/link";
import { requireOrgContext } from "@/lib/auth-context";
import {
  listTrainingPlans,
  listActiveAthletesForPlans,
} from "@/features/training-plans/queries";
import { TrainingPlanCard } from "@/features/training-plans/components/training-plan-card";
import { TrainingPlanDialogForm } from "@/features/training-plans/components/training-plan-dialog-form";
import { Dumbbell, LayoutGrid, User } from "lucide-react";

export default async function TrainingPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: "ALL" | "TEMPLATE" | "ATHLETE" }>;
}) {
  const { type = "ALL" } = await searchParams;
  const ctx = await requireOrgContext();

  const [plans, athletesRaw] = await Promise.all([
    listTrainingPlans(ctx.organizationId, { type }),
    listActiveAthletesForPlans(ctx.organizationId),
  ]);

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
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
            Step 03 — Program &amp; Rencana Latihan
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Susun rencana latihan terstruktur terindividualisasi (MFD &amp; Youth Performance) atau buat template program organisasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/training-plans/exercises"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-2 border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-surface-3 transition-colors"
          >
            <Dumbbell className="h-4 w-4 text-primary" /> Master Exercise Library
          </Link>
          <TrainingPlanDialogForm athletes={athletes} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 text-xs">
        <Link
          href="/training-plans"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
            type === "ALL"
              ? "bg-accent text-white"
              : "bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Semua Program ({plans.length})
        </Link>
        <Link
          href="/training-plans?type=TEMPLATE"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
            type === "TEMPLATE"
              ? "bg-accent text-white"
              : "bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Template Organisasi
        </Link>
        <Link
          href="/training-plans?type=ATHLETE"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
            type === "ATHLETE"
              ? "bg-accent text-white"
              : "bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Khusus Atlet
        </Link>
      </div>

      {/* Grid of Plans */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-1 py-12 text-center">
          <Dumbbell className="h-10 w-10 text-muted/50 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            Belum Ada Program Latihan
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            Klik tombol &quot;Buat Program Latihan&quot; untuk menyusun menu gerakan latihan baru.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <TrainingPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
