import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth-context";
import { getTrainingPlanById } from "@/features/training-plans/queries";
import { ExerciseItemForm } from "@/features/training-plans/components/exercise-item-form";
import {
  ArrowLeft,
  Dumbbell,
  User,
  LayoutGrid,
  Calendar,
} from "lucide-react";

export default async function TrainingPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrgContext();

  const plan = await getTrainingPlanById(ctx.organizationId, id);
  if (!plan) {
    notFound();
  }

  const isTemplate = !plan.athlete;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/training-plans"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Daftar Program
        </Link>

        {/* Plan Header Card */}
        <div className="rounded-xl border border-border bg-surface-1 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h1 className="font-display text-xl font-bold text-foreground">
              {plan.title}
            </h1>

            {isTemplate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">
                <LayoutGrid className="h-3.5 w-3.5" />
                Template Organisasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                <User className="h-3.5 w-3.5" />
                Atlet: {plan.athlete?.fullName}
              </span>
            )}
          </div>

          {plan.description && (
            <p className="text-xs text-muted leading-relaxed">
              {plan.description}
            </p>
          )}

          {(plan.startDate || plan.endDate) && (
            <div className="flex items-center gap-3 pt-2 text-xs text-muted font-mono border-t border-border/50">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              <span>
                Periode:{" "}
                {plan.startDate
                  ? new Date(plan.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Mulai bebas"}{" "}
                —{" "}
                {plan.endDate
                  ? new Date(plan.endDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Tanpa batas"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Exercises Section */}
      <ExerciseItemForm planId={plan.id} exercises={plan.exercises} />
    </div>
  );
}
