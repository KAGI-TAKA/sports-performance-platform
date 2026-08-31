"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Trophy,
  Target,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Edit2,
  Play,
  Pause,
  Trash2,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoalFormDialog, type TestItemOption } from "./goal-form-dialog";
import {
  pauseAthleteGoalAction,
  cancelAthleteGoalAction,
  resumeAthleteGoalAction,
} from "../actions";
import type {
  PersonalBestItem,
  CurrentPerformanceItem,
  AthleteGoalDetail,
  GoalStatus,
} from "../types";

interface AthleteGoalsTabProps {
  athleteId: string;
  athleteName: string;
  personalBests: PersonalBestItem[];
  currentPerformance: CurrentPerformanceItem[];
  goals: AthleteGoalDetail[];
  availableTestItems: TestItemOption[];
  canManage: boolean;
}

const statusBadgeConfig: Record<
  GoalStatus,
  { label: string; variant: "default" | "accent" | "signature" | "success" | "warning" | "danger" | "outline"; className?: string }
> = {
  ACTIVE: {
    label: "Sedang Berjalan",
    variant: "accent",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  ACHIEVED: {
    label: "Target Tercapai",
    variant: "success",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAUSED: {
    label: "Ditunda",
    variant: "warning",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "danger",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  EXPIRED: {
    label: "Melewati Batas Waktu",
    variant: "outline",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

export function AthleteGoalsTab({
  athleteId,
  athleteName,
  personalBests,
  currentPerformance,
  goals,
  availableTestItems,
  canManage,
}: AthleteGoalsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [editingGoal, setEditingGoal] = useState<AthleteGoalDetail | null>(null);

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const historyGoals = goals.filter((g) => g.status !== "ACTIVE");

  const currentMap = new Map(
    currentPerformance.map((c) => [c.testItemId, c])
  );

  const handlePause = (goalId: string, title: string) => {
    startTransition(async () => {
      const res = await pauseAthleteGoalAction(goalId);
      if (res.success) {
        toast.success(`Target "${title}" berhasil ditunda.`);
      } else {
        toast.error(res.error || "Gagal menunda target.");
      }
    });
  };

  const handleResume = (goalId: string, title: string) => {
    startTransition(async () => {
      const res = await resumeAthleteGoalAction(goalId);
      if (res.success) {
        toast.success(`Target "${title}" berhasil diaktifkan kembali.`);
      } else {
        toast.error(res.error || "Gagal mengaktifkan target.");
      }
    });
  };

  const handleCancel = (goalId: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin membatalkan target "${title}"?`)) {
      return;
    }
    startTransition(async () => {
      const res = await cancelAthleteGoalAction(goalId);
      if (res.success) {
        toast.success(`Target "${title}" dibatalkan.`);
      } else {
        toast.error(res.error || "Gagal membatalkan target.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* SECTION A: REKOR PRIBADI (PERSONAL BESTS) */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Rekor Pribadi (Personal Best) & Performa Terkini</span>
            </CardTitle>
            <span className="text-[11px] text-muted">
              {personalBests.length} Parameter Tercatat
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {personalBests.length === 0 ? (
            <div className="p-8 text-center text-muted text-xs space-y-1">
              <Trophy className="h-8 w-8 mx-auto text-muted/40 mb-2" />
              <p className="font-semibold text-foreground">Belum ada data rekor pribadi</p>
              <p>Rekor akan otomatis tercatat setelah atlet menyelesaikan sesi evaluasi tes fisik resmi.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {personalBests.map((pb) => {
                const current = currentMap.get(pb.testItemId);
                return (
                  <div
                    key={pb.testItemId}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-2/40 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {pb.testItemName}
                        </span>
                        {pb.physicalComponent && (
                          <span className="text-[10px] uppercase font-semibold text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border/60">
                            {pb.physicalComponent.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        Diraih pada:{" "}
                        <span className="text-foreground font-medium">
                          {new Date(pb.achievedDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-6 sm:justify-end">
                      {/* Current Value */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-muted block uppercase tracking-wider">
                          Tes Terakhir
                        </span>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {current?.currentValue != null ? (
                            `${current.currentValue} ${pb.unit.toLowerCase()}`
                          ) : (
                            "—"
                          )}
                        </span>
                      </div>

                      {/* PB Value */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-amber-600 font-semibold block uppercase tracking-wider flex items-center gap-1 sm:justify-end">
                          <Sparkles className="h-3 w-3" /> Rekor Terbaik
                        </span>
                        <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                          {pb.pbValue} {pb.unit.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION B: TARGET PERFORMA AKTIF (ACTIVE GOALS) */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span>Target Sasaran Aktif ({activeGoals.length})</span>
              </CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Progres pencapaian target fisik berdasarkan hasil asesmen berjalan.
              </p>
            </div>

            {canManage && (
              <GoalFormDialog
                athleteId={athleteId}
                athleteName={athleteName}
                availableTestItems={availableTestItems}
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {activeGoals.length === 0 ? (
            <div className="p-8 text-center text-muted text-xs space-y-2 border border-dashed border-border rounded-xl">
              <Target className="h-8 w-8 mx-auto text-muted/40" />
              <p className="font-semibold text-foreground">Belum ada target aktif</p>
              <p className="max-w-md mx-auto">
                Tetapkan target peningkatan spesifik untuk memotivasi atlet dan memantau akselerasi perkembangan fisik.
              </p>
              {canManage && (
                <div className="pt-2">
                  <GoalFormDialog
                    athleteId={athleteId}
                    athleteName={athleteName}
                    availableTestItems={availableTestItems}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeGoals.map((goal) => {
                const prog = goal.progress;
                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl bg-surface-2/60 border border-border space-y-3.5 hover:border-accent/40 transition"
                  >
                    {/* Header: Title & Test Item */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {goal.title || goal.testItemName}
                          </span>
                          <Badge
                            variant={statusBadgeConfig[goal.status].variant}
                            className={`text-[10px] ${statusBadgeConfig[goal.status].className || ""}`}
                          >
                            {statusBadgeConfig[goal.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Parameter: <strong className="text-foreground">{goal.testItemName}</strong> ({goal.unit.toLowerCase()})
                          {goal.targetDate && (
                            <>
                              {" · "}Batas:{" "}
                              <span className="font-medium text-foreground">
                                {new Date(goal.targetDate).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Management Actions */}
                      {canManage && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted hover:text-foreground"
                            onClick={() => setEditingGoal(goal)}
                            disabled={isPending}
                            title="Ubah Target"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50"
                            onClick={() => handlePause(goal.id, goal.title || goal.testItemName)}
                            disabled={isPending}
                            title="Tunda Target"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50"
                            onClick={() => handleCancel(goal.id, goal.title || goal.testItemName)}
                            disabled={isPending}
                            title="Batalkan Target"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Progress Numbers Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-1 border border-border/70 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-muted block uppercase">Baseline Awal</span>
                        <span className="text-xs font-bold text-foreground">
                          {goal.baselineValue} {goal.unit.toLowerCase()}
                        </span>
                      </div>
                      <div className="border-x border-border/60">
                        <span className="text-[10px] text-muted block uppercase">Hasil Terkini</span>
                        <span className="text-xs font-bold text-foreground">
                          {goal.currentValue != null ? `${goal.currentValue} ${goal.unit.toLowerCase()}` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-accent font-semibold block uppercase">Target Sasaran</span>
                        <span className="text-xs font-bold text-accent">
                          {goal.targetValue} {goal.unit.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Performance Semantics */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted">Tingkat Kemajuan</span>
                        <span className="font-mono text-foreground font-bold">
                          {prog.progressPercent}%
                        </span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full bg-surface-3 overflow-hidden"
                        role="progressbar"
                        aria-valuenow={prog.progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Kemajuan target ${goal.testItemName}`}
                      >
                        <div
                          className={`h-full transition-all duration-500 ${
                            prog.progressPercent >= 100
                              ? "bg-emerald-500"
                              : prog.isImproving
                              ? "bg-accent"
                              : "bg-slate-400"
                          }`}
                          style={{ width: `${prog.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted pt-0.5">
                        <div className="flex items-center gap-1">
                          {prog.state === "NO_CURRENT_VALUE" ? (
                            <span className="text-muted">Menunggu evaluasi tes pertama</span>
                          ) : prog.isImproving ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                              <TrendingUp className="h-3 w-3" />
                              {prog.deltaFromBaseline > 0 ? `+${prog.deltaFromBaseline}` : prog.deltaFromBaseline}{" "}
                              {goal.unit.toLowerCase()} dari baseline (Meningkat)
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                              <TrendingDown className="h-3 w-3" />
                              {prog.deltaFromBaseline > 0 ? `+${prog.deltaFromBaseline}` : prog.deltaFromBaseline}{" "}
                              {goal.unit.toLowerCase()} dari baseline (Perlu Ditingkatkan)
                            </span>
                          )}
                        </div>

                        <span className="text-muted">
                          Dibuat oleh: {goal.createdByName}
                        </span>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {goal.notes && (
                      <p className="text-[11px] text-muted italic bg-surface-1/70 px-2.5 py-1.5 rounded border border-border/50">
                        "{goal.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION C: RIWAYAT TARGET (HISTORICAL GOALS) */}
      {historyGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              <span>Riwayat Target Selesai / Ditunda ({historyGoals.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {historyGoals.map((g) => (
                <div
                  key={g.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-2/30 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {g.title || g.testItemName}
                      </span>
                      <Badge
                        variant={statusBadgeConfig[g.status].variant}
                        className={`text-[10px] ${statusBadgeConfig[g.status].className || ""}`}
                      >
                        {statusBadgeConfig[g.status].label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted">
                      Target: <strong className="text-foreground">{g.targetValue} {g.unit.toLowerCase()}</strong> · Baseline: {g.baselineValue} {g.unit.toLowerCase()}
                      {g.achievedAt && (
                        <>
                          {" · "}Tercapai pada:{" "}
                          <span className="text-emerald-700 font-semibold">
                            {new Date(g.achievedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {canManage && g.status === "PAUSED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5 self-end sm:self-auto"
                      onClick={() => handleResume(g.id, g.title || g.testItemName)}
                      disabled={isPending}
                    >
                      <Play className="h-3 w-3" />
                      <span>Aktifkan Kembali</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog Instance */}
      {editingGoal && (
        <GoalFormDialog
          athleteId={athleteId}
          athleteName={athleteName}
          availableTestItems={availableTestItems}
          existingGoal={{
            id: editingGoal.id,
            testItemId: editingGoal.testItemId,
            testItemName: editingGoal.testItemName,
            unit: editingGoal.unit,
            scoreDirection: editingGoal.scoreDirection,
            baselineValue: editingGoal.baselineValue,
            targetValue: editingGoal.targetValue,
            title: editingGoal.title,
            targetDate: editingGoal.targetDate,
            notes: editingGoal.notes,
          }}
          open={Boolean(editingGoal)}
          onOpenChange={(open) => {
            if (!open) setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}
