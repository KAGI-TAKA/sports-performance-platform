"use client";

import { useState } from "react";
import { Target, TrendingUp, TrendingDown, Trophy, Clock, ChevronDown, ChevronUp, CheckCircle2, PauseCircle } from "lucide-react";
import type { PortalAthleteGoalItem } from "../types";

interface PortalAthleteGoalsSectionProps {
  portalGoals: PortalAthleteGoalItem[];
  athleteFirstName: string;
}

function getMotivationalLabel(goal: PortalAthleteGoalItem): { text: string; icon: React.ReactNode; color: string } {
  if (goal.status === "ACHIEVED") return { text: "Target Tercapai!", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-emerald-600" };
  if (goal.status === "PAUSED") return { text: "Target Ditunda", icon: <PauseCircle className="h-3 w-3" />, color: "text-amber-600" };
  if (goal.status === "EXPIRED") return { text: "Batas Target Terlewati", icon: <Clock className="h-3 w-3" />, color: "text-slate-500" };
  if (goal.state === "NO_CURRENT_VALUE") return { text: "Menunggu Evaluasi Berikutnya", icon: <Clock className="h-3 w-3" />, color: "text-slate-500" };
  if (goal.progressPercent >= 100) return { text: "Hampir Tercapai!", icon: <CheckCircle2 className="h-3 w-3" />, color: "text-emerald-600" };
  if (goal.isImproving) return { text: "Sedang Berkembang", icon: <TrendingUp className="h-3 w-3" />, color: "text-emerald-600" };
  return { text: "Terus Berjuang!", icon: <TrendingDown className="h-3 w-3" />, color: "text-amber-600" };
}

function getDeltaSubtext(goal: PortalAthleteGoalItem): string | null {
  if (goal.state === "NO_CURRENT_VALUE") return null;
  const unit = goal.unit.toLowerCase();
  const delta = Math.round(Math.abs(goal.deltaFromBaseline) * 100) / 100;
  const remaining = Math.round(Math.abs(goal.targetValue - (goal.currentValue ?? goal.baselineValue)) * 100) / 100;

  if (goal.progressPercent >= 100) return `Tinggal ${remaining} ${unit} lagi untuk mencapai target!`;
  if (goal.isImproving) {
    return `+${delta} ${unit} dari awal — terus tingkatkan!`;
  }
  return `${delta} ${unit} dari baseline — terus berlatih!`;
}

function ActiveGoalCard({ goal }: { goal: PortalAthleteGoalItem }) {
  const label = getMotivationalLabel(goal);
  const deltaText = getDeltaSubtext(goal);
  const barColor = goal.progressPercent >= 100 ? "bg-emerald-500" : goal.isImproving ? "bg-indigo-500" : "bg-amber-400";

  return (
    <article
      className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-4 sm:p-5 space-y-3.5 hover:border-indigo-200 transition-colors"
      aria-label={`Target: ${goal.title || goal.testItemName}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Target Berikutnya</span>
          <h4 className="font-bold text-sm text-slate-900 mt-0.5">{goal.title || goal.testItemName}</h4>
          <p className="text-[11px] text-slate-500">Parameter: <strong className="text-slate-700">{goal.testItemName}</strong> ({goal.unit.toLowerCase()})</p>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${
          label.color === "text-emerald-600" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
          label.color === "text-amber-600" ? "bg-amber-50 border-amber-200 text-amber-700" :
          "bg-slate-100 border-slate-200 text-slate-600"
        }`}>
          {label.icon}{label.text}
        </span>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs bg-white/80 rounded-xl border border-slate-100 p-2.5">
        <div>
          <span className="text-[9px] text-slate-400 uppercase block font-semibold">Awal</span>
          <span className="font-bold text-slate-700">{goal.baselineValue} {goal.unit.toLowerCase()}</span>
        </div>
        <div className="border-x border-slate-100">
          <span className="text-[9px] text-slate-400 uppercase block font-semibold">Sekarang</span>
          <span className="font-bold text-slate-700">{goal.currentValue != null ? `${goal.currentValue} ${goal.unit.toLowerCase()}` : "—"}</span>
        </div>
        <div>
          <span className="text-[9px] text-indigo-500 uppercase block font-bold">Target</span>
          <span className="font-bold text-indigo-700">{goal.targetValue} {goal.unit.toLowerCase()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Kemajuan</span>
          <span className="font-mono font-bold text-slate-700">{goal.progressPercent}%</span>
        </div>
        <div
          className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={goal.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Kemajuan target ${goal.testItemName}: ${goal.progressPercent}%`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
          />
        </div>
        {deltaText && (
          <p className={`text-[10px] font-medium flex items-center gap-1 ${
            goal.state === "NO_CURRENT_VALUE" ? "text-slate-400" :
            goal.isImproving ? "text-emerald-600" : "text-amber-600"
          }`}>
            {goal.isImproving ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
            {deltaText}
          </p>
        )}
        {goal.targetDate && (
          <p className="text-[10px] text-slate-400">Batas waktu: <strong className="text-slate-600">{new Date(goal.targetDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong></p>
        )}
      </div>
    </article>
  );
}

export function PortalAthleteGoalsSection({ portalGoals, athleteFirstName }: PortalAthleteGoalsSectionProps) {
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const activeGoals = portalGoals.filter((g) => g.status === "ACTIVE");
  const achievedGoals = portalGoals.filter((g) => g.status === "ACHIEVED");
  const pausedGoals = portalGoals.filter((g) => g.status === "PAUSED");
  const expiredGoals = portalGoals.filter((g) => g.status === "EXPIRED");

  const VISIBLE_ACTIVE = 3;
  const hasMoreActive = activeGoals.length > VISIBLE_ACTIVE;
  const visibleActive = goalsExpanded ? activeGoals : activeGoals.slice(0, VISIBLE_ACTIVE);

  return (
    <div className="space-y-4">
      {/* ── ACTIVE GOALS ── */}
      <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Target Berikutnya</h3>
            {activeGoals.length > 0 && (
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{activeGoals.length}</span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {activeGoals.length === 0 ? (
            <div className="py-6 text-center space-y-1.5">
              <Target className="h-7 w-7 text-indigo-200 mx-auto" />
              <p className="font-semibold text-sm text-slate-600">Belum ada target aktif</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Coach akan menetapkan targetmu setelah evaluasi fisik berikutnya.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleActive.map((g) => <ActiveGoalCard key={g.id} goal={g} />)}
              </div>
              {hasMoreActive && (
                <button
                  onClick={() => setGoalsExpanded((p) => !p)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl border border-dashed border-indigo-200 transition-colors min-h-[44px]"
                  aria-expanded={goalsExpanded}
                >
                  {goalsExpanded ? (
                    <><ChevronUp className="h-3.5 w-3.5" />Sembunyikan</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5" />{activeGoals.length - VISIBLE_ACTIVE} target lainnya</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── PAUSED GOALS (compact) ── */}
      {pausedGoals.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-3 space-y-2">
          <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
            <PauseCircle className="h-3.5 w-3.5" />
            Target Ditunda ({pausedGoals.length})
          </p>
          {pausedGoals.map((g) => (
            <p key={g.id} className="text-xs text-amber-800">
              <strong>{g.title || g.testItemName}</strong>{" "}
              <span className="text-amber-600">— Target: {g.targetValue} {g.unit.toLowerCase()}</span>
            </p>
          ))}
        </div>
      )}

      {/* ── ACHIEVED + EXPIRED (collapsed) ── */}
      {(achievedGoals.length > 0 || expiredGoals.length > 0) && (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setHistoryExpanded((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors min-h-[44px]"
            aria-expanded={historyExpanded}
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-sm text-slate-700">
                Riwayat Target ({achievedGoals.length + expiredGoals.length})
              </span>
            </div>
            {historyExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {historyExpanded && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {achievedGoals.map((g) => (
                <div key={g.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-xs text-slate-800">{g.title || g.testItemName}</p>
                    <p className="text-[10px] text-slate-400">
                      Target: {g.targetValue} {g.unit.toLowerCase()}
                      {g.achievedAt && ` · Tercapai: ${new Date(g.achievedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />Tercapai
                  </span>
                </div>
              ))}
              {expiredGoals.map((g) => (
                <div key={g.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-xs text-slate-500">{g.title || g.testItemName}</p>
                    <p className="text-[10px] text-slate-400">Target: {g.targetValue} {g.unit.toLowerCase()}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                    Terlewati
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
