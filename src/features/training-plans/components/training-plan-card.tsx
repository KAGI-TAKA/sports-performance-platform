"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteTrainingPlan } from "../actions";
import { toast } from "sonner";
import {
  User,
  LayoutGrid,
  Calendar,
  ChevronRight,
  Trash2,
  ListOrdered,
} from "lucide-react";
import { PrescribeTemplateDialog } from "./prescribe-template-dialog";

interface AthleteOption {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
}

interface TrainingPlanCardProps {
  plan: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    athlete: {
      id: string;
      fullName: string;
    } | null;
    exercises: { id: string }[];
  };
  athletes?: AthleteOption[];
}

export function TrainingPlanCard({ plan, athletes = [] }: TrainingPlanCardProps) {
  const [isPending, startTransition] = useTransition();

  const isTemplate = !plan.athlete;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Hapus program latihan "${plan.title}"?`)) return;

    startTransition(async () => {
      const res = await deleteTrainingPlan(plan.id);
      if (res.success) {
        toast.success("Program latihan dihapus");
      } else {
        toast.error(res.error ?? "Gagal menghapus program");
      }
    });
  }

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-surface-1 p-5 shadow-sm hover:border-accent/50 hover:bg-surface-2/40 transition relative">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          {isTemplate ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400">
              <LayoutGrid className="h-3 w-3" />
              Template Organisasi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
              <User className="h-3 w-3" />
              {plan.athlete?.fullName}
            </span>
          )}

          <button
            disabled={isPending}
            onClick={handleDelete}
            className="p-1 rounded text-muted opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Hapus Program"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Title & Description */}
        <Link href={`/training-plans/${plan.id}`} className="block">
          <h3 className="font-display text-base font-bold text-foreground group-hover:text-accent transition">
            {plan.title}
          </h3>
          {plan.description && (
            <p className="mt-1 text-xs text-muted line-clamp-2">
              {plan.description}
            </p>
          )}
        </Link>
      </div>

      {/* Prescription Bar for Templates */}
      {isTemplate && athletes.length > 0 && (
        <div className="mt-3 pt-2">
          <PrescribeTemplateDialog
            templateId={plan.id}
            templateTitle={plan.title}
            athletes={athletes}
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono font-medium">
            <ListOrdered className="h-3.5 w-3.5 text-accent" />
            {plan.exercises.length} gerakan
          </span>
          {plan.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(plan.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>

        <Link
          href={`/training-plans/${plan.id}`}
          className="flex items-center gap-0.5 text-accent font-semibold group-hover:translate-x-1 transition"
        >
          Buka Program
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
