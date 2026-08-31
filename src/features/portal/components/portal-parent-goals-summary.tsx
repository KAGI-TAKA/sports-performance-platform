"use client";

import { CheckCircle2, Target, PauseCircle } from "lucide-react";
import type { PortalAthleteGoalItem } from "../types";

interface PortalParentGoalsSummaryProps {
  portalGoals: PortalAthleteGoalItem[];
}

function getParentStatusText(goal: PortalAthleteGoalItem): { text: string; color: string; icon: React.ReactNode } {
  if (goal.status === "ACHIEVED") return { text: "Target Tercapai", color: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  if (goal.status === "PAUSED") return { text: "Target Sementara Ditunda", color: "text-amber-600", icon: <PauseCircle className="h-3.5 w-3.5" /> };
  if (goal.state === "NO_CURRENT_VALUE") return { text: "Menunggu Hasil Tes Berikutnya", color: "text-slate-500", icon: null };
  if (goal.isImproving) return { text: "Sedang Berkembang", color: "text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  return { text: "Masih Dalam Proses", color: "text-amber-600", icon: null };
}

function getProgressNarrative(goal: PortalAthleteGoalItem): string | null {
  if (goal.status === "ACHIEVED" && goal.achievedAt) {
    return `Dicapai pada ${new Date(goal.achievedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`;
  }
  if (goal.state === "NO_CURRENT_VALUE") return null;
  if (goal.currentValue === null) return null;

  const unit = goal.unit.toLowerCase();
  const base = goal.baselineValue;
  const current = goal.currentValue;
  const target = goal.targetValue;

  return `Ananda berlatih dari ${base} ${unit} menuju ${target} ${unit}. Hasil terbaru: ${current} ${unit}.`;
}

export function PortalParentGoalsSummary({ portalGoals }: PortalParentGoalsSummaryProps) {
  const activeGoals = portalGoals.filter((g) => g.status === "ACTIVE");
  const achievedGoals = portalGoals.filter((g) => g.status === "ACHIEVED");
  const pausedGoals = portalGoals.filter((g) => g.status === "PAUSED");

  // Show ACTIVE first (top 2), then ACHIEVED (recent 1), then PAUSED (compact)
  const primaryGoals = activeGoals.slice(0, 2);
  const extraActive = activeGoals.length > 2 ? activeGoals.length - 2 : 0;

  if (portalGoals.length === 0 || (activeGoals.length === 0 && achievedGoals.length === 0 && pausedGoals.length === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-6 text-center space-y-1">
        <Target className="h-6 w-6 text-violet-200 mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Belum ada target perkembangan</p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">Pelatih akan menetapkan target perkembangan setelah evaluasi fisik dilakukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Active goals (primary) */}
      {primaryGoals.map((goal) => {
        const statusInfo = getParentStatusText(goal);
        const narrative = getProgressNarrative(goal);
        return (
          <div key={goal.id} className="rounded-2xl border border-violet-100 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-violet-500 tracking-wider">Target Perkembangan</p>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{goal.title || goal.testItemName}</p>
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold shrink-0 ${statusInfo.color}`}>
                {statusInfo.icon}{statusInfo.text}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              {goal.currentValue !== null && (
                <span>Hasil terbaru: <strong className="font-mono text-slate-800">{goal.currentValue} {goal.unit.toLowerCase()}</strong></span>
              )}
              <span>Target: <strong className="font-mono text-violet-700">{goal.targetValue} {goal.unit.toLowerCase()}</strong></span>
            </div>
            {narrative && (
              <p className="text-[11px] text-slate-500 leading-relaxed">{narrative}</p>
            )}
          </div>
        );
      })}

      {/* +N more active */}
      {extraActive > 0 && (
        <p className="text-xs text-slate-500 pl-1">+ {extraActive} target perkembangan lainnya</p>
      )}

      {/* Achieved goals */}
      {achievedGoals.slice(0, 2).map((goal) => {
        const statusInfo = getParentStatusText(goal);
        return (
          <div key={goal.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-xs text-slate-800">🎉 {goal.title || goal.testItemName}</p>
              <p className="text-[11px] text-slate-500">
                Target: {goal.targetValue} {goal.unit.toLowerCase()}
                {goal.achievedAt && ` · Tercapai: ${new Date(goal.achievedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            </div>
            <span className={`text-[10px] font-bold flex items-center gap-1 shrink-0 ${statusInfo.color}`}>
              {statusInfo.icon}{statusInfo.text}
            </span>
          </div>
        );
      })}

      {/* Paused goals (compact row) */}
      {pausedGoals.length > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 px-3.5 py-2.5">
          <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
            <PauseCircle className="h-3.5 w-3.5" />
            Target Sementara Ditunda ({pausedGoals.length}): {pausedGoals.map((g) => g.title || g.testItemName).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
